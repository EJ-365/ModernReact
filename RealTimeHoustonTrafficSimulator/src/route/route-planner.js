/**
 * Route planner — A→B on Houston OSM roads with traffic-aware ETA + alternate avoiding jams.
 */
import * as THREE from 'three';
import { planRoutesWithAlt, estimateRouteEta, nearestCw } from './houston-route.js';
import { attachPlaceSearch } from '../ui/place-search.js';

function fmtMin(m) {
  if (!Number.isFinite(m) || m < 0.5) return '<1 min';
  if (m < 60) return Math.round(m) + ' min';
  const h = Math.floor(m / 60), r = Math.round(m % 60);
  return h + ' hr' + (r ? ' ' + r + ' min' : '');
}

function tubeFor(path, col, op, radScale) {
  if (!path || path.length < 2) return null;
  const step = Math.max(1, Math.floor(path.length / 280));
  const pts = [];
  for (let i = 0; i < path.length; i += step) {
    const p = path[i];
    pts.push(new THREE.Vector3(p.x, (p.y || 0.3) + 1.8, p.z));
  }
  const last = path[path.length - 1];
  pts.push(new THREE.Vector3(last.x, (last.y || 0.3) + 1.8, last.z));
  if (pts.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(pts);
  const len = path[path.length - 1].s;
  const rad = Math.min(14, Math.max(3.2, len / 900)) * (radScale || 1);
  const segs = Math.min(500, Math.max(24, pts.length * 3));
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, segs, rad, 6, false),
    new THREE.MeshBasicMaterial({
      color: col, transparent: true, opacity: op, depthWrite: false, fog: false,
    }),
  );
  mesh.renderOrder = 7;
  return mesh;
}

export function createRoutePlanner({
  scene, cam, camGoal, geoToWorld, $,
  getTraffic, getRoads, getUserGeo, requestGeo,
  getCamViews, startTourDrive,
}) {
  const places = [];
  let placeId = 0;
  const state = {
    path: null, altPath: null, from: null, to: null, eta: null, altEta: null,
    line: null, planning: false, useAlt: false, jamRefs: [],
  };

  function push(g, n, x, z, key) {
    places.push({ id: key || ('r' + (placeId++)), g, n, x, z });
  }

  /** Exact same targets as Fly-to district — highest accuracy for named places */
  function syncFromCamViews() {
    const views = typeof getCamViews === 'function' ? getCamViews() : null;
    const sel = $('locSelect');
    if (!views || !sel) return;
    const seen = new Set(places.map((p) => p.id));
    for (const opt of sel.querySelectorAll('option')) {
      const id = opt.value;
      if (!id || id === 'city' || id === 'freeway' || !views[id]) continue;
      if (seen.has('v:' + id)) continue;
      const t = views[id].target;
      if (!t || t.length < 2) continue;
      const grp = (opt.parentElement && opt.parentElement.label) || 'Places';
      push(grp, opt.textContent.trim(), t[0], t[1], 'v:' + id);
      seen.add('v:' + id);
    }
  }

  fetch('/data/houston/places.json').then((r) => r.json()).then((d) => {
    for (const [x, z, rk, n] of d.p || []) if (rk <= 2) {
      push(rk <= 1 ? 'Cities & towns' : 'Neighbourhoods', n, x, z);
    }
    syncFromCamViews();
    fillSelects();
  }).catch(() => { syncFromCamViews(); fillSelects(); });
  /* CAM_VIEWS fills after airports/POIs boot — refresh once more */
  setTimeout(() => { syncFromCamViews(); fillSelects(); }, 2500);

  function fillSelects() {
    syncFromCamViews();
    const groups = {};
    places.forEach((p) => { (groups[p.g] || (groups[p.g] = [])).push(p); });
    const body = Object.entries(groups).map(([g, l]) =>
      '<optgroup label="' + g + '">'
      + l.slice().sort((a, b) => a.n.localeCompare(b.n))
        .map((p) => '<option value="' + p.id + '">' + p.n + '</option>').join('')
      + '</optgroup>').join('');
    const head = '<option value="me">My location (GPS)</option>'
      + '<option value="cam">Map centre (camera)</option>';
    for (const id of ['routeFrom', 'routeTo']) {
      const sel = $(id);
      if (!sel) continue;
      const keep = sel.value;
      sel.innerHTML = head + body;
      if (id === 'routeFrom') sel.value = keep && [...sel.options].some((o) => o.value === keep) ? keep : 'me';
      else {
        const gall = places.find((p) => /galleria/i.test(p.n));
        sel.value = keep && [...sel.options].some((o) => o.value === keep) ? keep
          : (gall ? gall.id : (places.find((p) => /downtown/i.test(p.n)) || places[0] || {}).id || 'cam');
      }
      attachPlaceSearch(sel, {
        placeholder: id === 'routeFrom' ? 'Search from…' : 'Search destination…',
        ariaLabel: id === 'routeFrom' ? 'Search route from' : 'Search route to',
        size: 8,
      });
    }
  }

  function resolvePoint(val) {
    if (val === 'cam') return { x: cam.target.x, z: cam.target.z, n: 'Map centre' };
    if (val === 'me') {
      const g = getUserGeo && getUserGeo();
      if (g && Number.isFinite(g.lat)) {
        const w = geoToWorld(g.lat, g.lng);
        if (Math.hypot(w.x - 60, w.z - 60) < 90000) {
          return { x: w.x, z: w.z, n: 'Your location', lat: g.lat, lng: g.lng };
        }
      }
      return { x: cam.target.x, z: cam.target.z, n: 'Map centre (no GPS)' };
    }
    const p = places.find((q) => q.id === val);
    return p ? { x: p.x, z: p.z, n: p.n } : null;
  }

  /** Snap pin to the real carriageway used for routing — cuts off-road start/end error */
  function snapToRoad(T, pt, label) {
    if (!T || !pt) return pt;
    const hit = nearestCw(T.carriageways, pt.x, pt.z, 12000, true)
      || nearestCw(T.carriageways, pt.x, pt.z, 28000, false);
    if (!hit) return pt;
    const f = hit.c.f, i = hit.i;
    const road = hit.c.ref || hit.c.h || 'road';
    return {
      x: f.pts[2 * i],
      z: f.pts[2 * i + 1],
      n: pt.n,
      snap: road,
      snapD: Math.hypot(f.pts[2 * i] - pt.x, f.pts[2 * i + 1] - pt.z),
      label,
    };
  }

  function setStatus(t) {
    const el = $('routeEta');
    if (el) el.textContent = t;
  }

  function clearLine() {
    if (state.line) {
      scene.remove(state.line);
      state.line.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      state.line = null;
    }
  }

  function drawRoutes(primary, alt, activeAlt) {
    clearLine();
    if (!primary || primary.length < 2) return;
    const g = new THREE.Group();
    g.name = 'hts-drive-route';
    if (alt && alt.length > 1) {
      const dim = tubeFor(alt, 0x3dd68c, activeAlt ? 0.9 : 0.35, activeAlt ? 1 : 0.75);
      if (dim) { dim.renderOrder = activeAlt ? 8 : 5; g.add(dim); }
    }
    const main = tubeFor(primary, 0xe8a838, activeAlt ? 0.28 : 0.9, activeAlt ? 0.75 : 1);
    if (main) { main.renderOrder = activeAlt ? 5 : 8; g.add(main); }
    const path = activeAlt && alt ? alt : primary;
    const a = path[0], b = path[path.length - 1];
    const rad = Math.min(14, Math.max(3.5, path[path.length - 1].s / 900));
    const mkPin = (p, col) => {
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(rad * 2.4, 12, 10),
        new THREE.MeshBasicMaterial({ color: col, depthWrite: false, fog: false }),
      );
      pin.position.set(p.x, (p.y || 0.3) + 3.5, p.z);
      pin.renderOrder = 9;
      g.add(pin);
    };
    mkPin(a, 0x3dd68c);
    mkPin(b, 0xff6b5e);
    scene.add(g);
    state.line = g;
  }

  function fitCamera(path) {
    if (!path || !camGoal) return;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < path.length; i += Math.max(1, (path.length / 40) | 0)) {
      const p = path[i];
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z);
    }
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const span = Math.max(x1 - x0, z1 - z0, 800);
    camGoal.target.set(cx, 0, cz);
    camGoal.radius = Math.min(14000, Math.max(900, span * 0.85));
    camGoal.phi = 0.95;
  }

  async function waitTraffic(ms) {
    const t0 = performance.now();
    while (performance.now() - t0 < (ms || 14000)) {
      const T = getTraffic && getTraffic();
      if (T && T.carriageways && T.carriageways.length > 40) return T;
      setStatus('Loading Houston roads…');
      await new Promise((r) => setTimeout(r, 250));
    }
    return getTraffic && getTraffic();
  }

  /** Stream tiles along the corridor so both ends share one connected graph */
  function preloadCorridor(R, from, to) {
    if (!R || !R.update) return;
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      R.update(from.x + (to.x - from.x) * t, from.z + (to.z - from.z) * t, 0);
    }
    R.update(from.x, from.z, 0);
    R.update(to.x, to.z, 0);
  }

  function refreshStatus() {
    const path = state.useAlt && state.altPath ? state.altPath : state.path;
    const eta = state.useAlt && state.altEta ? state.altEta : state.eta;
    if (!path || !eta || !state.from || !state.to) return;
    const via = eta.refs.length ? ' via ' + eta.refs.slice(0, 3).join(' · ') : '';
    const delay = eta.delayMin >= 2 ? ' · +' + Math.round(eta.delayMin) + ' min traffic' : '';
    const mode = state.useAlt ? 'Alt (avoids traffic)' : 'Fastest';
    let jam = '';
    if (!state.useAlt && state.jamRefs.length) {
      jam = ' · Traffic on ' + state.jamRefs.slice(0, 2).join(' / ') + ' — tap Avoid traffic';
    }
    const snap = (state.from.snap ? ' from ' + state.from.snap : '')
      + (state.to.snap ? ' to ' + state.to.snap : '');
    setStatus(mode + ' · ' + eta.miles.toFixed(1) + ' mi · ' + fmtMin(eta.minutes) + delay + via
      + ' · ' + state.from.n + ' → ' + state.to.n + snap + jam);
  }

  async function plan() {
    if (state.planning) return;
    state.planning = true;
    state.useAlt = false;
    const driveBtn = $('routeDrive');
    const altBtn = $('routeAlt');
    if (driveBtn) driveBtn.disabled = true;
    if (altBtn) { altBtn.disabled = true; altBtn.style.display = 'none'; }
    try {
      const fromSel = $('routeFrom'), toSel = $('routeTo');
      if (fromSel && fromSel.value === 'me' && typeof requestGeo === 'function') {
        setStatus('Getting your GPS…');
        await new Promise((res) => {
          let done = false;
          const fin = () => { if (!done) { done = true; res(); } };
          requestGeo(fin);
          setTimeout(fin, 4500);
        });
      }
      let from = resolvePoint(fromSel && fromSel.value);
      let to = resolvePoint(toSel && toSel.value);
      if (!from || !to) { setStatus('Pick a From and To place.'); return; }
      if (Math.hypot(from.x - to.x, from.z - to.z) < 80) {
        setStatus('From and To are too close — pick different places.');
        return;
      }
      setStatus('Loading roads for ' + from.n + ' → ' + to.n + '…');
      const R = getRoads && getRoads();
      preloadCorridor(R, from, to);
      await new Promise((r) => setTimeout(r, 400));
      const T = await waitTraffic(16000);
      if (!T || !T.carriageways || T.carriageways.length < 10) {
        setStatus('Roads not ready yet — wait a moment and try again.');
        return;
      }
      /* Warm traffic sim near both ends so cong is real before we cost the edges */
      if (typeof T.tick === 'function') {
        T.tick(0.05, from.x, from.z, 4000);
        T.tick(0.05, to.x, to.z, 4000);
        T.tick(0.05, (from.x + to.x) / 2, (from.z + to.z) / 2, 5000);
      }
      from = snapToRoad(T, from, 'A');
      to = snapToRoad(T, to, 'B');
      setStatus('Routing ' + from.n + ' → ' + to.n + '…');
      const pack = planRoutesWithAlt(T, from.x, from.z, to.x, to.z);
      if (!pack || !pack.primary) {
        clearLine();
        state.path = state.altPath = null;
        setStatus('No driveable route found. Try places closer to freeways, or wait for more roads.');
        return;
      }
      state.from = from;
      state.to = to;
      state.path = pack.primary.path;
      state.eta = estimateRouteEta(state.path, T);
      state.altPath = pack.alt ? pack.alt.path : null;
      state.altEta = state.altPath ? estimateRouteEta(state.altPath, T) : null;
      state.jamRefs = pack.jamRefs || [];
      state.useAlt = false;
      drawRoutes(state.path, state.altPath, false);
      fitCamera(state.path);
      refreshStatus();
      if (driveBtn) driveBtn.disabled = false;
      if (altBtn && state.altPath) {
        altBtn.style.display = '';
        altBtn.disabled = false;
        const save = Math.round(state.eta.minutes - state.altEta.minutes);
        altBtn.textContent = save >= 1
          ? ('Avoid traffic (−' + save + ' min)')
          : ('Avoid traffic (+' + Math.round(state.altEta.minutes - state.eta.minutes) + ' min, clearer)');
      }
      console.log('%cRoute: ' + state.eta.miles.toFixed(1) + ' mi, ~' + Math.round(state.eta.minutes) + ' min'
        + (state.altPath ? ' · alt available' : ''), 'color:#e8a838');
    } finally {
      state.planning = false;
    }
  }

  function toggleAlt() {
    if (!state.altPath) return;
    state.useAlt = !state.useAlt;
    drawRoutes(state.path, state.altPath, state.useAlt);
    fitCamera(state.useAlt ? state.altPath : state.path);
    const altBtn = $('routeAlt');
    if (altBtn) altBtn.textContent = state.useAlt ? 'Use fastest route' : 'Avoid traffic';
    refreshStatus();
  }

  function clear() {
    clearLine();
    state.path = state.altPath = null;
    state.from = state.to = null;
    state.eta = state.altEta = null;
    state.useAlt = false;
    state.jamRefs = [];
    setStatus('Pick From / To, then Plan route.');
    const driveBtn = $('routeDrive');
    const altBtn = $('routeAlt');
    if (driveBtn) driveBtn.disabled = true;
    if (altBtn) { altBtn.disabled = true; altBtn.style.display = 'none'; }
  }

  function driveIt() {
    const path = state.useAlt && state.altPath ? state.altPath : state.path;
    if (!state.to || !path) {
      setStatus('Plan a route first, then Drive it.');
      return;
    }
    if (typeof startTourDrive === 'function') {
      startTourDrive({ n: state.to.n, x: state.to.x, z: state.to.z });
      setStatus('Starting car tour to ' + state.to.n + '…');
    } else {
      setStatus('Tour not ready — try Start tour in Tour Houston.');
    }
  }

  const planBtn = $('routePlan');
  if (planBtn) planBtn.addEventListener('click', () => { plan(); });
  const clearBtn = $('routeClear');
  if (clearBtn) clearBtn.addEventListener('click', () => clear());
  const driveBtn = $('routeDrive');
  if (driveBtn) {
    driveBtn.disabled = true;
    driveBtn.addEventListener('click', () => driveIt());
  }
  const altBtn = $('routeAlt');
  if (altBtn) {
    altBtn.style.display = 'none';
    altBtn.disabled = true;
    altBtn.addEventListener('click', () => toggleAlt());
  }
  fillSelects();
  setStatus('Pick From / To, then Plan route.');

  return {
    plan, clear, driveIt, toggleAlt,
    get path() { return state.useAlt && state.altPath ? state.altPath : state.path; },
    get eta() { return state.useAlt && state.altEta ? state.altEta : state.eta; },
  };
}
