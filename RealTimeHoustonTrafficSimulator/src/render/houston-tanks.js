/**
 * Houston tank farms and silos at their real OSM positions/sizes (public/data/houston/tanks.json):
 * instanced cylinders with shallow cone roofs in the white / aluminium / beige mix seen along the
 * Ship Channel. Two draw calls (shells + roofs) for ~5k tanks.
 */
import * as THREE from 'three';

const SHELL = [0xeef0f1, 0xe4e6e8, 0xd5d8db, 0xc9cdd1, 0xe8e2d4, 0xd9d2c0, 0xb9bec2];

export function createHoustonTanks({ parent, baseY = 0, url = '/data/houston/tanks.json' }) {
  const root = new THREE.Group(); root.name = 'houston-tanks'; parent.add(root);
  const shellG = new THREE.CylinderGeometry(1, 1, 1, 18, 1); shellG.translate(0, 0.5, 0);
  const roofG = new THREE.ConeGeometry(1, 1, 18, 1); roofG.translate(0, 0.5, 0);
  const ready = fetch(url).then((r) => r.json()).then((d) => {
    const n = d.t.length;
    const shells = new THREE.InstancedMesh(shellG, new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
    const roofs = new THREE.InstancedMesh(roofG, new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
    const o = new THREE.Object3D(), c = new THREE.Color();
    d.t.forEach(([x, z, r, h, kind], i) => {
      const hash = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
      o.position.set(x, baseY, z); o.scale.set(r, h, r); o.updateMatrix(); shells.setMatrixAt(i, o.matrix);
      c.setHex(kind ? 0xb8bcc0 : SHELL[Math.floor(hash * SHELL.length)]); shells.setColorAt(i, c);
      const rh = kind ? r * 0.6 : Math.max(0.4, r * 0.12);
      o.position.set(x, baseY + h, z); o.scale.set(r * 1.01, rh, r * 1.01); o.updateMatrix(); roofs.setMatrixAt(i, o.matrix);
      c.multiplyScalar(0.92); roofs.setColorAt(i, c);
    });
    for (const m of [shells, roofs]) { m.castShadow = m.receiveShadow = true; m.computeBoundingSphere(); root.add(m); }
    return { tanks: n };
  });
  return { root, ready };
}
