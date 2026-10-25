/**
 * Satellite-map style place-name labels (OSM place=city…hamlet) for the Houston metre world.
 * Labels show when zoomed out and fade away as the camera comes down, so they never cover the
 * street-level view. Decluttered in screen space (bigger places win), positioned with one
 * transform per visible label each frame.
 */
import * as THREE from 'three';

/* rank: 0 city, 1 town, 2 suburb, 3 neighbourhood/village, 4 hamlet */
const SHOW = [[5200, 1e9], [3200, 70000], [1700, 26000], [1100, 9000], [900, 5000]];
const FONT = ['600 17px', '600 14px', '600 12.5px', '500 11.5px', '500 10.5px'];
const MAXV = 70;

export function createHoustonPlaces({ camera, dom, getView, url = '/data/houston/places.json' }) {
  const host = document.createElement('div');
  host.id = 'houPlaces';
  host.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2;font-family:system-ui,-apple-system,Segoe UI,sans-serif';
  (dom.parentElement || document.body).appendChild(host);
  let P = [], els = [], shown = [];
  const v = new THREE.Vector3();
  const pool = (i) => {
    if (els[i]) return els[i];
    const e = document.createElement('div');
    e.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap;color:#fff;letter-spacing:.02em;text-shadow:0 0 3px #000,0 0 6px rgba(0,0,0,.85),0 1px 2px #000;will-change:transform,opacity;transition:opacity .35s';
    host.appendChild(e); els[i] = e; return e;
  };
  function layout() {
    const { x: cx, z: cz, r } = getView();
    const W = dom.clientWidth, H = dom.clientHeight, boxes = [];
    shown = [];
    for (const p of P) {
      const [mn, far] = SHOW[p[2]];
      if (r < mn || Math.hypot(p[0] - cx, p[1] - cz) > Math.max(far, r * 1.6)) continue;
      v.set(p[0], 0, p[1]).project(camera);
      if (v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05) continue;
      const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H, w = p[3].length * (11 - p[2]) * 0.62 + 8, h = 20 - p[2] * 2;
      const b = [sx - w / 2, sy - h / 2, sx + w / 2, sy + h / 2];
      if (boxes.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1])) continue;
      boxes.push(b);
      shown.push([p, Math.min(1, (r - mn) / (mn * 0.6))]);
      if (shown.length >= MAXV) break;
    }
    shown.forEach(([p], i) => { const e = pool(i); if (e._p !== p) { e._p = p; e.textContent = p[3]; e.style.font = FONT[p[2]] + ' system-ui,-apple-system,Segoe UI,sans-serif'; e.style.textTransform = p[2] <= 1 ? 'uppercase' : 'none'; } });
    for (let i = shown.length; i < els.length; i++) { els[i].style.opacity = '0'; els[i]._op = '0'; }
  }
  /* skip the label pass when the camera and label set haven't changed; read the canvas size once per frame, not per label */
  const lastM = new Float64Array(17); let lastShown = null;
  function frame() {
    requestAnimationFrame(frame);
    const me = camera.matrixWorld.elements, pe = camera.projectionMatrix.elements;
    let same = lastShown === shown && lastM[16] === pe[0] + pe[5];
    for (let i = 0; i < 16 && same; i++) if (lastM[i] !== me[i]) same = false;
    if (same) return;
    for (let i = 0; i < 16; i++) lastM[i] = me[i];
    lastM[16] = pe[0] + pe[5]; lastShown = shown;
    const W = dom.clientWidth, H = dom.clientHeight;
    for (let i = 0; i < shown.length; i++) {
      const [p, a] = shown[i], e = els[i];
      v.set(p[0], 0, p[1]).project(camera);
      e.style.transform = `translate(${((v.x + 1) / 2 * W).toFixed(1)}px,${((1 - v.y) / 2 * H).toFixed(1)}px) translate(-50%,-50%)`;
      const op = v.z > 1 ? '0' : String(a);
      if (e._op !== op) { e._op = op; e.style.opacity = op; }
    }
  }
  const ready = fetch(url).then((r) => r.json()).then((d) => {
    P = (d.p || []).slice().sort((a, b) => a[2] - b[2]);
    setInterval(layout, 300); layout(); requestAnimationFrame(frame);
    return P.length;
  });
  return { ready, host, get count() { return shown.length; } };
}
