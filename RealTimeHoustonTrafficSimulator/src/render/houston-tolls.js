/**
 * Houston toll gantries from OSM (highway=toll_gantry): galvanised steel portal frames spanning the
 * carriageway, with an EZ TAG / TxTag reader and camera over every lane and an "EZ TAG ONLY" plaque.
 * Everything is instanced: four draw calls for all ~265 gantries.
 */
import * as THREE from 'three';

function plaqueTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#4b2a7b'; g.fillRect(0, 0, 256, 64);
  g.strokeStyle = '#f4f1fa'; g.lineWidth = 4; g.strokeRect(4, 4, 248, 56);
  g.fillStyle = '#ffffff'; g.font = 'bold 34px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('EZ TAG ONLY', 128, 34, 232);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function createHoustonTolls({ parent, url = '/data/houston/tolls.json', heightAt = null }) {
  const root = new THREE.Group(); root.name = 'houston-tolls'; parent.add(root);
  const steel = new THREE.MeshLambertMaterial({ color: 0xa4acb4 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x24282d });
  const plaque = new THREE.MeshBasicMaterial({ map: plaqueTex(), side: THREE.DoubleSide });
  const stats = { gantries: 0 };
  const ready = fetch(url).then((r) => r.json()).then((d) => {
    const list = (d.tolls || []).filter((t) => t.k === 'gantry');
    /* both carriageways of a freeway carry their own node: keep one frame per carriageway */
    const posts = [], beams = [], readers = [], plaques = [];
    const o = new THREE.Object3D();
    for (const t of list) {
      const w = t.l * 3.7 * (t.ow ? 1 : 2) + 3.2;
      const y = heightAt ? (heightAt(t.x, t.z, 0) || 0) : 0;
      const sx = Math.cos(t.h), sz = -Math.sin(t.h); /* across-road unit vector */
      for (const sd of [-1, 1]) posts.push([t.x + sx * sd * (w / 2 + 0.8), y, t.z + sz * sd * (w / 2 + 0.8), t.h]);
      beams.push([t.x, y, t.z, t.h, w + 2.2]);
      for (let i = 0; i < t.l * (t.ow ? 1 : 2); i++) {
        const off = -w / 2 + 1.6 + 3.7 * (i + 0.5);
        readers.push([t.x + sx * off, y, t.z + sz * off, t.h]);
      }
      plaques.push([t.x, y, t.z, t.h]);
    }
    const mk = (geo, mat, rows, place) => {
      if (!rows.length) return;
      const im = new THREE.InstancedMesh(geo, mat, rows.length);
      rows.forEach((r, i) => { place(r); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
      im.castShadow = true; im.frustumCulled = false; root.add(im);
    };
    /* 7.6 m posts (US DOT clearance ≥ 5.2 m), twin-chord truss beam, reader heads under the beam */
    mk(new THREE.BoxGeometry(0.55, 7.6, 0.55), steel, posts, ([x, y, z, h]) => { o.position.set(x, y + 3.8, z); o.rotation.set(0, h, 0); o.scale.set(1, 1, 1); });
    mk(new THREE.BoxGeometry(1, 1.1, 1.3), steel, beams, ([x, y, z, h, w]) => { o.position.set(x, y + 7.1, z); o.rotation.set(0, h, 0); o.scale.set(w, 1, 1); });
    mk(new THREE.BoxGeometry(0.45, 0.4, 0.7), dark, readers, ([x, y, z, h]) => { o.position.set(x, y + 6.3, z); o.rotation.set(0, h, 0); o.scale.set(1, 1, 1); });
    mk(new THREE.PlaneGeometry(3.6, 0.9), plaque, plaques, ([x, y, z, h]) => {
      o.position.set(x - Math.sin(h) * 0.68, y + 7.1, z - Math.cos(h) * 0.68); o.rotation.set(0, h, 0); o.scale.set(1, 1, 1);
    });
    stats.gantries = list.length;
    return stats;
  });
  return { root, ready, stats };
}
