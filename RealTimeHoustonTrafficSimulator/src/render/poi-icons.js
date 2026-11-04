/**
 * Popular places / attractions as map icons (OSM tourism/leisure/historic… with a Wikipedia/Wikidata tag, or any
 * museum / zoo / theme park / aquarium). DOM badges projected from the 3D camera, decluttered in screen space
 * (famous places win), re-laid out a few times a second and only moved when the camera moves. Click → onPick(p).
 */
import * as THREE from 'three';

const I = (d) => `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
/* category → [svg icon, colour, label]; inline SVG so icons render the same on every device (no emoji font needed) */
export const POI_CAT = {
  theme: [I('<circle cx="12" cy="10" r="7"/><path d="M12 3v14M5 10h14M7 5l10 10M17 5L7 15M8 21l4-4 4 4"/>'), '#d93f78', 'Theme / water park'],
  zoo: [I('<circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="4.5" cy="13" r="1.6"/><circle cx="19.5" cy="13" r="1.6"/><path d="M12 12c-3 0-5 4-5 6s2 3 5 3 5-1 5-3-2-6-5-6z"/>'), '#4a9a2a', 'Zoo'],
  aquarium: [I('<path d="M3 12c3-5 9-6 13-2l5-3v10l-5-3c-4 4-10 3-13-2z"/><circle cx="8" cy="11" r=".6" fill="#fff"/>'), '#1f8fd6', 'Aquarium'],
  stadium: [I('<ellipse cx="12" cy="9" rx="9" ry="4"/><path d="M3 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9"/><ellipse cx="12" cy="9" rx="4" ry="1.6"/>'), '#d9822b', 'Stadium / arena'],
  museum: [I('<path d="M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>'), '#8a5bd6', 'Museum'],
  sight: [I('<path d="M12 2l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 16.7 6.1 20l1.4-6.6-5-4.5 6.6-.7z"/>'), '#d9a62b', 'Attraction'],
  monument: [I('<path d="M12 2l2 4v13H10V6zM7 22h10M8 19h8"/>'), '#9a7b4f', 'Monument / memorial'],
  theatre: [I('<path d="M4 4h16v6a8 8 0 0 1-16 0z"/><path d="M8 9h.01M16 9h.01M8.5 13.5c2 1.5 5 1.5 7 0"/>'), '#c2408a', 'Theatre / performing arts'],
  art: [I('<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>'), '#d6564c', 'Art gallery'],
  mall: [I('<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>'), '#3a7bd5', 'Shopping'],
  park: [I('<path d="M12 2l6 9h-3l4 6H5l4-6H6zM12 17v5"/>'), '#2e8b57', 'Park / garden'],
  beach: [I('<path d="M4 20h16M12 20V9M5 9a7 7 0 0 1 14 0z"/>'), '#d9a04c', 'Beach'],
  /* HCCS / universities — same circular badge style as theatre/park (white ring + glyph) */
  campus: [I('<path d="M3 10l9-5 9 5-9 5-9-5z"/><path d="M7 12v4.5c2.5 1.8 7.5 1.8 10 0V12"/><path d="M21 10v5"/><circle cx="21" cy="16" r="1" fill="#fff"/>'), '#c9a227', 'College / university'],
  view: [I('<circle cx="7" cy="15" r="4"/><circle cx="17" cy="15" r="4"/><path d="M7 11l3-7h4l3 7M11 15h2"/>'), '#3f9b9b', 'Viewpoint'],
  worship: [I('<path d="M12 2v5M10 4h4M6 22V12l6-5 6 5v10zM10 22v-5h4v5"/>'), '#7d8590', 'Historic place of worship'],
};
const ORDER = Object.keys(POI_CAT);

export function createPoiIcons({ dom, getCamera, getView, onPick, maxV = 48, y = 0 }) {
  const host = document.createElement('div');
  host.className = 'poiLayer';
  host.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3;font:600 11.5px system-ui,-apple-system,Segoe UI,sans-serif';
  (dom.parentElement || document.body).appendChild(host);
  let P = [], els = [], shown = [], on = true, lastLay = 0, dead = false;
  const v = new THREE.Vector3();
  const pool = (i) => {
    if (els[i]) return els[i];
    const e = document.createElement('div');
    e.style.cssText = 'position:absolute;left:0;top:0;display:flex;align-items:center;gap:4px;white-space:nowrap;pointer-events:auto;cursor:pointer;will-change:transform;transition:opacity .25s';
    e.innerHTML = '<span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;line-height:1;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.55)"></span><span style="color:#fff;text-shadow:0 0 3px #000,0 1px 2px #000,0 0 6px rgba(0,0,0,.8)"></span>';
    e.addEventListener('click', (ev) => { ev.stopPropagation(); if (e._p && onPick) onPick(e._p, ev.clientX, ev.clientY); });
    e.addEventListener('pointerdown', (ev) => ev.stopPropagation());
    host.appendChild(e); els[i] = e; return e;
  };
  function layout() {
    const cam = getCamera();
    if (!cam) { if (shown.length) { shown = []; for (const e of els) { e.style.opacity = '0'; e.style.visibility = 'hidden'; e._p = null; } } return; }
    const { x: cx, z: cz, r } = getView();
    const W = dom.clientWidth, H = dom.clientHeight, boxes = [];
    shown = [];
    if (on && r > 180) for (const p of P) {
      if (r > 11000 && !(p.w >= 2 || (p.w && /^(theme|zoo|aquarium|sight|monument)$/.test(p.c)))) continue; /* zoomed out: headline attractions only */
      if (r > 70000) break;
      if (Math.hypot(p.x - cx, p.z - cz) > Math.max(2500, r * 1.9)) continue;
      v.set(p.x, y, p.z).project(cam);
      if (v.z > 1 || Math.abs(v.x) > 1.02 || Math.abs(v.y) > 1.02) continue;
      const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H, lab = r < 16000 || boxes.length < 14;
      const w = 26 + (lab ? p.n.length * 6.3 : 0), b = [sx - 13, sy - 13, sx - 13 + w, sy + 13];
      if (boxes.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1])) continue;
      boxes.push(b); shown.push([p, lab]);
      if (shown.length >= maxV) break;
    }
    shown.forEach(([p, lab], i) => {
      const e = pool(i), [ic, col, cl] = POI_CAT[p.c] || POI_CAT.sight;
      if (e._p !== p) { e._p = p; e.title = p.n + ' · ' + cl; e.firstChild.innerHTML = ic; e.firstChild.style.background = col; e.lastChild.textContent = p.n; }
      e.lastChild.style.display = lab ? '' : 'none'; e.style.opacity = '1'; e.style.visibility = 'visible';
    });
    for (let i = shown.length; i < els.length; i++) { els[i].style.opacity = '0'; els[i].style.visibility = 'hidden'; els[i]._p = null; }
  }
  const lastM = new Float64Array(17); let lastShown = null;
  function frame(t) {
    if (dead) return;
    requestAnimationFrame(frame);
    if (t - lastLay > 300) { lastLay = t; layout(); }
    const cam = getCamera(); if (!cam) return;
    const me = cam.matrixWorld.elements, pe = cam.projectionMatrix.elements;
    let same = lastShown === shown && lastM[16] === pe[0] + pe[5];
    for (let i = 0; i < 16 && same; i++) if (lastM[i] !== me[i]) same = false;
    if (same) return;
    for (let i = 0; i < 16; i++) lastM[i] = me[i];
    lastM[16] = pe[0] + pe[5]; lastShown = shown;
    const W = dom.clientWidth, H = dom.clientHeight;
    for (let i = 0; i < shown.length; i++) {
      const p = shown[i][0];
      v.set(p.x, y, p.z).project(cam);
      els[i].style.transform = `translate(${((v.x + 1) / 2 * W - 13).toFixed(1)}px,${((1 - v.y) / 2 * H - 13).toFixed(1)}px)`;
    }
  }
  requestAnimationFrame(frame);
  return {
    /** list: [{x, z, c, n, w}] in the scene's metres */
    setData(list) { P = list.slice().sort((a, b) => (b.w - a.w) || (ORDER.indexOf(a.c) - ORDER.indexOf(b.c))); lastShown = null; layout(); },
    setVisible(b) { on = !!b; host.style.display = on ? '' : 'none'; },
    get count() { return P.length; },
    dispose() { dead = true; host.remove(); },
  };
}

export async function loadPois(url, toXZ) {
  const r = await fetch(url); if (!r.ok) return [];
  const d = await r.json();
  return (d.p || []).map(([lat, lng, c, n, w]) => { const p = toXZ(lat, lng); return { x: p.x, z: p.z, c, n, w: w || 0, lat, lng }; });
}
