/* Every car/truck/bus in traffic drawn with its detailed model, instanced: each type's model is merged per material
   once, so all traffic costs one draw call per (type, material) regardless of how many vehicles are on screen. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const SLOT = { paint: 1, paint2: 2, head: 3, tail: 4, glowH: 5, glowT: 6 };
const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
let _glowTex = null;
function glowMat() {
  if (!_glowTex) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(0.6, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    _glowTex = new THREE.CanvasTexture(c);
  }
  return new THREE.MeshBasicMaterial({ map: _glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide });
}

export function createDetailedTraffic(scene, defs) {
  const sets = {};
  for (const [style, { build, cap }] of Object.entries(defs)) {
    const model = build();
    model.updateMatrixWorld(true);
    const groups = new Map(), ud = model.userData, add = (key, g) => { if (!groups.has(key)) groups.set(key, []); groups.get(key).push(g); };
    model.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      const m = o.material;
      const key = m === ud.paint ? 'paint' : m === ud.paint2 ? 'paint2' : m === ud.lampHead ? 'head' : m === ud.lampTail ? 'tail' : m;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
      g.applyMatrix4(o.matrixWorld);
      add(key, g);
      if (key === 'head' || key === 'tail') {
        /* soft glow card just in front of each lamp lens, facing out of the car; brightness is set per vehicle */
        g.computeBoundingBox(); const bb = g.boundingBox, c = bb.getCenter(new THREE.Vector3()), fr = key === 'head';
        const w = Math.max(0.5, (bb.max.x - bb.min.x) * 3.2), h = Math.max(0.42, (bb.max.y - bb.min.y) * 4.5);
        const q = new THREE.PlaneGeometry(w, h).toNonIndexed(); q.deleteAttribute('uv');
        if (!fr) q.rotateY(Math.PI);
        q.translate(c.x, c.y, fr ? bb.max.z + 0.03 : bb.min.z - 0.03);
        const qu = new THREE.PlaneGeometry(1, 1).toNonIndexed().getAttribute('uv');
        q.setAttribute('uv', qu.clone());
        add(fr ? 'glowH' : 'glowT', q);
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const meshes = [];
    for (const [key, list] of groups) {
      const glow = key === 'glowH' || key === 'glowT';
      if (!glow) for (const g of list) if (g.getAttribute('uv')) g.deleteAttribute('uv');
      const geo = mergeGeometries(list);
      const slot = SLOT[key] || 0;
      const mat = slot === 1 || slot === 2 ? new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.35, roughness: 0.34 })
        : slot === 3 || slot === 4 ? lensMat : glow ? glowMat() : key;
      const im = new THREE.InstancedMesh(geo, mat, cap);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false; im.count = 0;
      if (slot) { im.setColorAt(0, new THREE.Color(0xffffff)); im.instanceColor.setUsage(THREE.DynamicDrawUsage); }
      if (glow) im.renderOrder = 3;
      im.userData.slot = slot;
      scene.add(im); meshes.push(im);
    }
    sets[style] = { meshes, cap, n: 0, top: box.max.y };
  }
  const _c = new THREE.Color();
  return {
    sets,
    begin() { for (const k in sets) sets[k].n = 0; },
    /* returns false when that type is full (the caller then keeps the simple instanced body).
       L = lamp colours {h: head lens, t: tail lens, hg: head glow, tg: tail glow}; black glow = off */
    add(style, matrix, col, col2, L) {
      const s = sets[style];
      if (!s || s.n >= s.cap) return false;
      const i = s.n++;
      for (const im of s.meshes) {
        im.setMatrixAt(i, matrix);
        const k = im.userData.slot;
        if (!k) continue;
        const hex = k === 1 ? col : k === 2 ? (col2 != null ? col2 : col) : !L ? 0 : k === 3 ? L.h : k === 4 ? L.t : k === 5 ? L.hg : L.tg;
        im.setColorAt(i, _c.setHex(hex));
      }
      return true;
    },
    end() {
      for (const k in sets) {
        const s = sets[k];
        for (const im of s.meshes) {
          im.count = s.n;
          if (!s.n) continue;
          im.instanceMatrix.clearUpdateRanges(); im.instanceMatrix.addUpdateRange(0, s.n * 16); im.instanceMatrix.needsUpdate = true;
          if (im.instanceColor) { im.instanceColor.clearUpdateRanges(); im.instanceColor.addUpdateRange(0, s.n * 3); im.instanceColor.needsUpdate = true; }
        }
      }
    },
    stats() { const o = {}; for (const k in sets) o[k] = sets[k].n; return o; },
  };
}

/* Detailed cars replace the shared instanced body (those matrices are scaled to 0 so the
   simple mesh does not draw on top). Copy the pre-zero matrices into a pick mesh first —
   clicks raycast that copy, because a 0-scale instance does not intersect. */
export function copyInstanceMatrices(src, dst, count) {
  const n = count | 0;
  dst.count = n;
  if (n > 0) dst.instanceMatrix.array.set(src.instanceMatrix.array.subarray(0, n * 16));
}
