/**
 * Traffic signal heads at the real OSM highway=traffic_signals stop lines the v2 traffic sim uses:
 * pole on the right kerb, mast arm over the lanes, a 3-aspect head facing approaching drivers.
 * The lit aspect is the live phase the simulated cars obey. Instanced; only near the camera.
 */
import * as THREE from 'three';

const COL = { r: new THREE.Color(1, 0.12, 0.08), y: new THREE.Color(1, 0.72, 0.1), g: new THREE.Color(0.15, 1, 0.55) };
const DY = { r: 0.42, y: 0, g: -0.42 };

export function createHoustonSignals({ parent, traffic, max = 1600, range = 1500, showBelow = 3200 }) {
  const metal = new THREE.MeshStandardMaterial({ color: 0x8a8f94, metalness: 0.6, roughness: 0.45 });
  const housing = new THREE.MeshStandardMaterial({ color: 0x1d1f1a, roughness: 0.7 });
  const lampMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const poleGeo = new THREE.CylinderGeometry(0.11, 0.15, 6.4, 8); poleGeo.translate(0, 3.2, 0);
  const armGeo = new THREE.BoxGeometry(0.12, 0.14, 1); armGeo.translate(0, 0, 0.5);
  const headGeo = new THREE.BoxGeometry(0.42, 1.34, 0.32);
  const lampGeo = new THREE.SphereGeometry(0.15, 10, 6);
  const mk = (g, m) => { const o = new THREE.InstancedMesh(g, m, max); o.count = 0; o.frustumCulled = false; o.castShadow = false; o.receiveShadow = false; return o; };
  const pole = mk(poleGeo, metal), arm = mk(armGeo, metal), head = mk(headGeo, housing), lamp = mk(lampGeo, lampMat);
  lamp.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
  const root = new THREE.Group(); root.name = 'houston-signals';
  root.add(pole, arm, head, lamp); parent.add(root);
  const d = new THREE.Object3D();
  const stats = { heads: 0 };

  function update(camX, camZ, camDist) {
    root.visible = camDist < showBelow;
    if (!root.visible) return;
    let n = 0;
    traffic.signalsNear(camX, camZ, range, (px, py, pz, ix, iz, tx, tz, st, hw) => {
      if (n >= max) return;
      const L = Math.min(Math.max(2.5, hw * 1.1), 9);
      d.rotation.set(0, 0, 0); d.scale.set(1, 1, 1);
      d.position.set(px, py, pz); d.updateMatrix(); pole.setMatrixAt(n, d.matrix);
      d.position.set(px, py + 6.1, pz); d.rotation.y = Math.atan2(ix, iz); d.scale.set(1, 1, L); d.updateMatrix(); arm.setMatrixAt(n, d.matrix);
      const hx = px + ix * L, hz = pz + iz * L, hy = py + 5.25;
      d.position.set(hx, hy, hz); d.rotation.y = Math.atan2(tx, tz); d.scale.set(1, 1, 1); d.updateMatrix(); head.setMatrixAt(n, d.matrix);
      d.position.set(hx - tx * 0.17, hy + DY[st], hz - tz * 0.17); d.updateMatrix(); lamp.setMatrixAt(n, d.matrix);
      lamp.setColorAt(n, COL[st]);
      n++;
    });
    for (const o of [pole, arm, head, lamp]) { o.count = n; o.instanceMatrix.needsUpdate = true; }
    lamp.instanceColor.needsUpdate = true;
    stats.heads = n;
  }
  return { root, update, stats };
}
