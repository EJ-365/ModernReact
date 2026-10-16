/**
 * Static mesh batching — merges many small, never-changing meshes that share a
 * material into one draw call per material per spatial cell (keeps frustum culling).
 * Multi-material meshes (e.g. tower boxes) are split by geometry group.
 */
import * as THREE from 'three';

const _m = new THREE.Matrix4();
const _n = new THREE.Matrix3();
const _v = new THREE.Vector3();

function attrSig(g) {
  return (g.attributes.normal ? 'n' : '') + (g.attributes.uv ? 'u' : '') + (g.attributes.color ? 'c' : '');
}

/**
 * @param {THREE.Object3D} group  parent whose direct Mesh children are candidates
 * @param {object} [opts]
 * @param {number} [opts.cell=2400]  spatial bucket size (world units)
 * @param {(o:THREE.Mesh)=>boolean} [opts.filter]  extra predicate; return false to keep a mesh as-is
 * @returns {{before:number, after:number}}
 */
export function batchStaticChildren(group, opts = {}) {
  const cell = opts.cell || 2400;
  const filter = opts.filter || (() => true);
  const buckets = new Map();
  const consumed = [];
  group.updateMatrix();
  for (const o of group.children) {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.visible) continue;
    if (o.children.length || o.morphTargetInfluences) continue;
    if (o.userData && Object.keys(o.userData).some((k) => k !== 'batch')) continue;
    if (!filter(o)) continue;
    const g = o.geometry;
    if (!g || !g.attributes.position || g.attributes.position.itemSize !== 3) continue;
    if (g.attributes.position.isInterleavedBufferAttribute) continue;
    o.updateMatrix();
    if (!g.boundingSphere) g.computeBoundingSphere();
    _v.copy(g.boundingSphere.center).applyMatrix4(o.matrix);
    const ck = Math.floor(_v.x / cell) + ':' + Math.floor(_v.z / cell);
    const sig = attrSig(g);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const ranges = new Map(); /* matIndex -> [[start,count],…] */
    const idxCount = g.index ? g.index.count : g.attributes.position.count;
    if (Array.isArray(o.material) && g.groups.length) {
      for (const gr of g.groups) {
        const mi = gr.materialIndex || 0;
        if (!mats[mi]) continue;
        const cnt = Math.min(gr.count, idxCount - gr.start);
        (ranges.get(mi) || ranges.set(mi, []).get(mi)).push([gr.start, cnt]);
      }
    } else {
      ranges.set(0, [[0, idxCount]]);
    }
    for (const [mi, rs] of ranges) {
      const mat = mats[mi];
      if (!mat || mat.visible === false) continue;
      const key = mat.uuid + '|' + sig + '|' + ck + '|' + o.renderOrder + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0);
      let b = buckets.get(key);
      if (!b) { b = { mat, sig, list: [], proto: o }; buckets.set(key, b); }
      b.list.push({ o, g, rs });
    }
    consumed.push(o);
  }
  const before = group.children.length;
  const keep = new Set();
  /* A mesh is replaced only if every one of its material ranges lands in a bucket with ≥2 entries */
  for (let changed = true; changed;) {
    changed = false;
    for (const b of buckets.values()) {
      const live = b.list.filter((e) => !keep.has(e.o));
      if (live.length === 1) { keep.add(live[0].o); changed = true; }
    }
  }
  for (const b of buckets.values()) {
    const list = b.list.filter((e) => !keep.has(e.o));
    if (list.length < 2) continue;
    let vTot = 0, iTot = 0;
    for (const e of list) {
      vTot += e.g.attributes.position.count;
      for (const [, c] of e.rs) iTot += c;
    }
    const pos = new Float32Array(vTot * 3);
    const nrm = b.sig.includes('n') ? new Float32Array(vTot * 3) : null;
    const uv = b.sig.includes('u') ? new Float32Array(vTot * 2) : null;
    const col = b.sig.includes('c') ? new Float32Array(vTot * 3) : null;
    const idx = vTot > 65535 ? new Uint32Array(iTot) : new Uint16Array(iTot);
    let vo = 0, io = 0;
    for (const e of list) {
      const g = e.g;
      _m.copy(e.o.matrix);
      _n.getNormalMatrix(_m);
      const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv, c = g.attributes.color;
      for (let i = 0; i < p.count; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(_m);
        pos[(vo + i) * 3] = _v.x; pos[(vo + i) * 3 + 1] = _v.y; pos[(vo + i) * 3 + 2] = _v.z;
        if (nrm) {
          _v.fromBufferAttribute(n, i).applyMatrix3(_n).normalize();
          nrm[(vo + i) * 3] = _v.x; nrm[(vo + i) * 3 + 1] = _v.y; nrm[(vo + i) * 3 + 2] = _v.z;
        }
        if (uv) { uv[(vo + i) * 2] = u.getX(i); uv[(vo + i) * 2 + 1] = u.getY(i); }
        if (col) { col[(vo + i) * 3] = c.getX(i); col[(vo + i) * 3 + 1] = c.getY(i); col[(vo + i) * 3 + 2] = c.getZ(i); }
      }
      const ix = g.index ? g.index.array : null;
      for (const [s, cnt] of e.rs) {
        for (let k = 0; k < cnt; k++) idx[io + k] = (ix ? ix[s + k] : s + k) + vo;
        io += cnt;
      }
      vo += p.count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    if (nrm) out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    if (uv) out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.setIndex(new THREE.BufferAttribute(idx.subarray(0, io), 1));
    out.computeBoundingSphere();
    out.computeBoundingBox();
    const m = new THREE.Mesh(out, b.mat);
    m.name = 'static-batch';
    m.renderOrder = b.proto.renderOrder;
    m.castShadow = b.proto.castShadow;
    m.receiveShadow = b.proto.receiveShadow;
    m.matrixAutoUpdate = false;
    group.add(m);
  }
  const geos = new Set();
  for (const o of consumed) {
    if (keep.has(o)) continue;
    group.remove(o);
    geos.add(o.geometry);
  }
  /* Shared geometries (unit boxes etc.) may still be used elsewhere — only free uniquely-built ones */
  for (const g of geos) if (g.type === 'BufferGeometry' && !g.userData.shared) g.dispose();
  return { before, after: group.children.length };
}
