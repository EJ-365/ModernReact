/**
 * Instance culler — the biggest speed win for big metro scenes.
 *
 * Houston draws hundreds of thousands of instanced objects (trees, houses, oil tanks, water towers,
 * airport lights, road props). Each InstancedMesh spans the whole metro, so Three.js can only cull it
 * as one block and the GPU draws every copy, even ones 30 miles away or smaller than a pixel.
 *
 * This packs only the instances that can actually be seen to the front of the buffer and lowers
 * `count`, so the GPU skips the rest:
 *   - beyond the fog → hidden (you can't see it anyway)
 *   - smaller than ~1 pixel on screen → hidden (lights get a 4x allowance so night glints stay)
 *
 * Safety:
 *   - only meshes whose instances have not changed for a while are touched (static props)
 *   - if any other code writes to a culled mesh (setMatrixAt, count, raw array), it is restored and left alone
 *   - getMatrixAt / getColorAt / raycast keep working with the ORIGINAL instance ids, so picking and cards still work
 *   - set mesh.userData.noCull = true to opt a mesh out
 */
import * as THREE from 'three';

const _m = new THREE.Matrix4();
const _wm = new THREE.Matrix4();
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _sphere = new THREE.Sphere();
const _hits = [];
const _probe = new THREE.Mesh();

export function createInstanceCuller({ scene, camera, minCount = 120, settleMs = 8000, budgetMs = 2.5, scanEveryMs = 4000 } = {}) {
  const regs = new Map();      // mesh -> record
  const pending = new Map();   // mesh -> {v, n, t}
  const banned = new WeakSet();
  let lastScan = 0;
  let queue = [];
  const lastCam = new THREE.Vector3(1e9, 1e9, 1e9);
  let lastFog = 0, lastH = 0;
  const stats = { meshes: 0, total: 0, drawn: 0, restored: 0 };

  function isGlow(o) {
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m) return false;
    return m.isMeshBasicMaterial || m.blending === THREE.AdditiveBlending || (m.emissiveIntensity > 0.5);
  }

  function register(o) {
    const g = o.geometry;
    if (!g || !g.attributes || !g.attributes.position) return;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const N = o.count;
    const mat = o.instanceMatrix.array.slice(0, N * 16);
    const col = o.instanceColor ? o.instanceColor.array.slice(0, N * 3) : null;
    const cx = new Float32Array(N), cy = new Float32Array(N), cz = new Float32Array(N), rr = new Float32Array(N);
    const bc = g.boundingSphere.center, br = g.boundingSphere.radius;
    for (let i = 0; i < N; i++) {
      _m.fromArray(mat, i * 16);
      _m.decompose(_v, _q, _s);
      _sphere.center.copy(bc).applyMatrix4(_m);
      cx[i] = _sphere.center.x; cy[i] = _sphere.center.y; cz[i] = _sphere.center.z;
      rr[i] = br * Math.max(Math.abs(_s.x), Math.abs(_s.y), Math.abs(_s.z));
    }
    const rec = {
      o, N, mat, col, cx, cy, cz, rr, idx: new Uint32Array(N), glow: isGlow(o),
      myVersion: -1, myColorVersion: -1, myCount: N,
      orig: { getMatrixAt: o.getMatrixAt, getColorAt: o.getColorAt, setMatrixAt: o.setMatrixAt, setColorAt: o.setColorAt, raycast: o.raycast },
    };
    for (let i = 0; i < N; i++) rec.idx[i] = i;
    /* original-id access for everyone else */
    o.getMatrixAt = (i, m) => m.fromArray(rec.mat, i * 16);
    if (col) o.getColorAt = (i, c) => c.fromArray(rec.col, i * 3);
    o.setMatrixAt = function (i, m) { release(rec, true); return this.setMatrixAt(i, m); };
    o.setColorAt = function (i, c) { release(rec, true); return this.setColorAt(i, c); };
    o.raycast = (raycaster, intersects) => raycastCompact(rec, raycaster, intersects);
    regs.set(o, rec);
    queue.push(rec);
  }

  /** put everything back exactly as it was and stop touching this mesh */
  function release(rec, ban) {
    const { o, N } = rec;
    if (!regs.has(o)) return;
    regs.delete(o);
    o.getMatrixAt = rec.orig.getMatrixAt; o.getColorAt = rec.orig.getColorAt;
    o.setMatrixAt = rec.orig.setMatrixAt; o.setColorAt = rec.orig.setColorAt; o.raycast = rec.orig.raycast;
    /* cast restored props back to the prototype ones when they were inherited */
    for (const k of ['getMatrixAt', 'getColorAt', 'setMatrixAt', 'setColorAt', 'raycast']) {
      if (o[k] === Object.getPrototypeOf(o)[k]) delete o[k];
    }
    if (o.instanceMatrix.array.length >= N * 16) {
      o.instanceMatrix.array.set(rec.mat);
      o.instanceMatrix.clearUpdateRanges && o.instanceMatrix.clearUpdateRanges();
      o.instanceMatrix.needsUpdate = true;
    }
    if (rec.col && o.instanceColor) { o.instanceColor.array.set(rec.col); o.instanceColor.needsUpdate = true; }
    o.count = N;
    o.boundingSphere = null;
    o.boundingBox = null;
    if (ban) banned.add(o);
    stats.restored++;
  }

  function raycastCompact(rec, raycaster, intersects) {
    const o = rec.o;
    if (o.material === undefined || o.count === 0 || !o.boundingSphere || o.boundingSphere.isEmpty()) return;
    _sphere.copy(o.boundingSphere).applyMatrix4(o.matrixWorld);
    if (!raycaster.ray.intersectsSphere(_sphere)) return;
    _probe.geometry = o.geometry; _probe.material = o.material;
    const arr = o.instanceMatrix.array;
    for (let k = 0; k < o.count; k++) {
      _m.fromArray(arr, k * 16);
      _wm.multiplyMatrices(o.matrixWorld, _m);
      _probe.matrixWorld = _wm;
      _probe.raycast(raycaster, _hits);
      for (const h of _hits) { h.instanceId = rec.idx[k]; h.object = o; intersects.push(h); }
      _hits.length = 0;
    }
  }

  function cull(rec, cam, fogFar, pxK) {
    const { o, N } = rec;
    if (!o.parent) { regs.delete(o); return; }
    /* someone else changed the buffers or count since our last write → hand it back */
    if ((rec.myVersion >= 0 && o.instanceMatrix.version !== rec.myVersion) || o.count !== rec.myCount
      || (rec.col && o.instanceColor && rec.myColorVersion >= 0 && o.instanceColor.version !== rec.myColorVersion)) {
      release(rec, true);
      return;
    }
    o.updateMatrixWorld();
    /* camera in the mesh's local space (meshes are usually in world space, but be exact) */
    _v.copy(cam).applyMatrix4(_m.copy(o.matrixWorld).invert());
    const sx = o.matrixWorld.getMaxScaleOnAxis() || 1;
    const px = _v.x, py = _v.y, pz = _v.z;
    const far = fogFar / sx, k = pxK * (rec.glow ? 4 : 1);
    const a = o.instanceMatrix.array, src = rec.mat, c = rec.col, ca = o.instanceColor && o.instanceColor.array;
    const cx = rec.cx, cy = rec.cy, cz = rec.cz, rr = rec.rr, idx = rec.idx;
    let n = 0;
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    for (let i = 0; i < N; i++) {
      const dx = cx[i] - px, dy = cy[i] - py, dz = cz[i] - pz;
      const r = rr[i];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
      if (d > far) continue;
      if (d > 0 && r * k < d) continue; /* below ~1 px on screen */
      /* Always rewrite from the snapshot. A previous cull may have compacted a later
         instance into this slot; skipping the copy when n === i leaves that duplicate
         in place and the real instance never comes back. src is a copy, so this is safe
         even when the write overlaps a slot already filled earlier in this pass. */
      const so = i * 16, dn = n * 16;
      a.set(src.subarray(so, so + 16), dn);
      if (c) ca.set(c.subarray(i * 3, i * 3 + 3), n * 3);
      idx[n] = i;
      n++;
      const X = cx[i], Y = cy[i], Z = cz[i];
      if (X - r < x0) x0 = X - r; if (X + r > x1) x1 = X + r;
      if (Y - r < y0) y0 = Y - r; if (Y + r > y1) y1 = Y + r;
      if (Z - r < z0) z0 = Z - r; if (Z + r > z1) z1 = Z + r;
    }
    if (n === 0 && o.count === 0) return;
    o.count = n; rec.myCount = n;
    const im = o.instanceMatrix;
    if (im.clearUpdateRanges) { im.clearUpdateRanges(); im.addUpdateRange(0, Math.max(16, n * 16)); }
    im.needsUpdate = true; rec.myVersion = im.version;
    if (c && o.instanceColor) {
      const ic = o.instanceColor;
      if (ic.clearUpdateRanges) { ic.clearUpdateRanges(); ic.addUpdateRange(0, Math.max(3, n * 3)); }
      ic.needsUpdate = true; rec.myColorVersion = ic.version;
    }
    /* bounds of the visible instances only → whole-mesh frustum culling works again.
       (three's computeBoundingSphere would read through our original-id getMatrixAt, so set them here) */
    if (!o.boundingBox) o.boundingBox = new THREE.Box3();
    if (!o.boundingSphere) o.boundingSphere = new THREE.Sphere();
    if (n) { o.boundingBox.min.set(x0, y0, z0); o.boundingBox.max.set(x1, y1, z1); o.boundingBox.getBoundingSphere(o.boundingSphere); }
    else { o.boundingBox.makeEmpty(); o.boundingSphere.makeEmpty(); }
    stats.drawn += n;
  }

  function scan(now) {
    scene.traverse((o) => {
      if (!o.isInstancedMesh || regs.has(o) || banned.has(o) || (o.userData && o.userData.noCull)) return;
      if (o.count < minCount || o.morphTexture || o.isBatchedMesh) return;
      const v = o.instanceMatrix.version, n = o.count;
      const p = pending.get(o);
      if (!p) { pending.set(o, { v, n, t: now }); return; }
      if (p.v !== v || p.n !== n) { p.v = v; p.n = n; p.t = now; return; }
      if (now - p.t >= settleMs) { pending.delete(o); register(o); }
    });
  }

  /**
   * Call once per frame before rendering.
   * @param {number} fogFar — anything past this is invisible
   */
  function update(fogFar) {
    const now = performance.now();
    if (now - lastScan >= scanEveryMs) { lastScan = now; scan(now); }
    if (!regs.size) return;
    camera.updateMatrixWorld();
    const cp = camera.getWorldPosition(_v.set(0, 0, 0)).clone();
    const H = (typeof innerHeight !== "undefined" && innerHeight) || 800;
    const pxK = H / (Math.tan((camera.fov || 55) * Math.PI / 360) * 1.1); /* keep if projected size ≥ ~1.1 px */
    const moveTol = Math.max(6, Math.abs(cp.y) * 0.02);
    const camMoved = cp.distanceTo(lastCam) > moveTol || Math.abs(fogFar - lastFog) > lastFog * 0.08 || H !== lastH;
    if (camMoved) {
      lastCam.copy(cp); lastFog = fogFar; lastH = H;
      /* Keep unfinished meshes at the front and append the ones already culled this pass.
         Rebuilding from scratch on every camera move (the camera moves every flight frame)
         spent the whole budget redoing mesh 0, so houses, roofs and lights stayed frozen
         on the last parked view. */
      const live = [];
      const seen = new Set();
      for (const rec of queue) {
        if (regs.get(rec.o) === rec && !seen.has(rec)) { live.push(rec); seen.add(rec); }
      }
      for (const rec of regs.values()) if (!seen.has(rec)) live.push(rec);
      queue = live;
      stats.drawn = 0;
    }
    /* spread the work over frames so there is never a hitch */
    const t0 = performance.now();
    while (queue.length && performance.now() - t0 < budgetMs) cull(queue.shift(), cp, fogFar * 1.02, pxK);
    stats.meshes = regs.size;
  }

  function disable() { for (const rec of Array.from(regs.values())) release(rec, false); queue = []; }

  function info() {
    let total = 0, drawn = 0;
    for (const rec of regs.values()) { total += rec.N; drawn += rec.o.count; }
    return { meshes: regs.size, pending: pending.size, instances: total, drawn, restored: stats.restored };
  }

  return { update, disable, info, get size() { return regs.size; } };
}
