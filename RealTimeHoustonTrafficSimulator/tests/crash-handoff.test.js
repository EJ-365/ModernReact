/**
 * Crash sim owns horizontal motion (S._ownMove). Starting a normal flight or tour
 * must release that, or the aircraft climbs in place and never crosses the map.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

function installDom() {
  const listeners = [];
  function matches(node, sel) {
    sel = sel.trim();
    if (sel.startsWith('#')) return node.id === sel.slice(1);
    if (sel.startsWith('.')) return node.classList.contains(sel.slice(1));
    const attr = /^\[([^\]=]+)(?:="([^"]*)")?\]$/.exec(sel);
    if (attr) {
      if (!(attr[1] in node.attributes)) return false;
      return attr[2] == null || node.attributes[attr[1]] === attr[2];
    }
    return node.tagName === sel.toUpperCase();
  }
  function walk(n, fn) {
    for (const c of n.children) { fn(c); walk(c, fn); }
  }
  function query(root, sel) {
    const parts = sel.trim().split(/\s+/);
    let cur = [root];
    for (const p of parts) {
      const next = [];
      for (const n of cur) walk(n, (c) => { if (matches(c, p)) next.push(c); });
      cur = next;
    }
    return cur;
  }
  function el(tag) {
    const node = {
      tagName: String(tag || 'DIV').toUpperCase(),
      id: '',
      textContent: '',
      value: '',
      style: {},
      children: [],
      parentNode: null,
      attributes: {},
      dataset: {},
      offsetWidth: 120,
      offsetHeight: 40,
    };
    node.classList = {
      add(...xs) { for (const x of xs) if (x) node.classList._c.add(x); },
      remove(...xs) { for (const x of xs) node.classList._c.delete(x); },
      toggle(x, force) {
        const on = force != null ? !!force : !node.classList._c.has(x);
        if (on) node.classList._c.add(x); else node.classList._c.delete(x);
        return on;
      },
      contains(x) { return node.classList._c.has(x); },
      _c: new Set(),
    };
    node.setAttribute = (k, v) => {
      node.attributes[k] = String(v);
      if (k === 'id') node.id = String(v);
      if (k === 'value') node.value = String(v);
      if (k === 'class') String(v).split(/\s+/).forEach((c) => c && node.classList.add(c));
    };
    node.getAttribute = (k) => (k in node.attributes ? node.attributes[k] : null);
    node.hasAttribute = (k) => k in node.attributes;
    node.addEventListener = () => {};
    node.removeEventListener = () => {};
    node.remove = () => {
      if (!node.parentNode) return;
      node.parentNode.children = node.parentNode.children.filter((c) => c !== node);
      node.parentNode = null;
    };
    node.appendChild = (c) => { c.parentNode = node; node.children.push(c); return c; };
    node.insertBefore = (c, ref) => {
      c.parentNode = node;
      const i = node.children.indexOf(ref);
      if (i < 0) node.children.push(c); else node.children.splice(i, 0, c);
      return c;
    };
    node.setPointerCapture = () => {};
    node.getBoundingClientRect = () => ({ left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40 });
    node.closest = () => null;
    node.querySelector = (sel) => query(node, sel)[0] || null;
    node.querySelectorAll = (sel) => query(node, sel);
    Object.defineProperty(node, 'innerHTML', {
      set(html) {
        node.children = [];
        const re = /<([a-zA-Z0-9]+)([^>]*)>/g;
        let m;
        while ((m = re.exec(String(html)))) {
          const child = el(m[1]);
          const ar = /([:@\w-]+)(?:\s*=\s*"([^"]*)")?/g;
          let a;
          while ((a = ar.exec(m[2] || ''))) child.setAttribute(a[1], a[2] ?? '');
          if ('value' in child.attributes) child.value = child.attributes.value;
          node.appendChild(child);
        }
      },
      get() { return ''; },
    });
    return node;
  }
  const head = el('head');
  const body = el('body');
  const document = {
    head,
    body,
    createElement: (tag) => el(tag),
    createDocumentFragment: () => el('fragment'),
    getElementById: (id) => query(body, '#' + id)[0] || query(head, '#' + id)[0] || null,
    querySelector: (sel) => query(body, sel)[0] || null,
    querySelectorAll: (sel) => query(body, sel),
    addEventListener: (type, fn) => listeners.push([type, fn]),
  };
  const store = new Map();
  globalThis.document = document;
  globalThis.window = globalThis;
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  localStorage.setItem('hts-tour-veh', JSON.stringify({ soundOn: false, musicOn: false, radioOn: false }));
  globalThis.addEventListener = (type, fn) => listeners.push([type, fn]);
  globalThis.removeEventListener = () => {};
  globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  globalThis.innerWidth = 1280;
  globalThis.innerHeight = 800;
  globalThis.fetch = () => Promise.reject(new Error('offline'));
  /* Node's navigator has no geolocation, so locate() resolves immediately. */
  return { el, document };
}

const savedGlobals = {
  document: globalThis.document,
  window: globalThis.window,
  localStorage: globalThis.localStorage,
  fetch: globalThis.fetch,
  addEventListener: globalThis.addEventListener,
  removeEventListener: globalThis.removeEventListener,
  matchMedia: globalThis.matchMedia,
  innerWidth: globalThis.innerWidth,
  innerHeight: globalThis.innerHeight,
};
installDom();
const { createTour } = await import('../src/tour.js');
test.after(() => {
  for (const [k, v] of Object.entries(savedGlobals)) {
    if (v === undefined) delete globalThis[k];
    else globalThis[k] = v;
  }
});

function harness() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50000);
  const camGoal = { radius: 60, phi: 1.2, theta: 0.4, target: new THREE.Vector3() };
  const cam = { theta: 0.4, phi: 1.2, target: new THREE.Vector3(120, 0, 80) };
  const controls = {
    tourAc: Object.assign(document.createElement('select'), { value: 'b737' }),
    crashApt: Object.assign(document.createElement('select'), { value: 'IAH' }),
  };
  const airports = [{
    code: 'IAH', n: 'Bush Intercontinental', x: 0, z: 0,
    rws: [{ p: [0, 0, 0, 3600], w: 45, ref: '15L/33R' }],
  }];
  const tour = createTour({
    scene,
    camera,
    cam,
    camGoal,
    geoToWorld: (lat, lng) => ({ x: lng, z: lat }),
    getTraffic: () => null,
    getRoads: () => null,
    airports: () => airports,
    makePlane: () => new THREE.Group(),
    makeJet: () => new THREE.Group(),
    makeHeli: () => new THREE.Group(),
    makeMil: () => new THREE.Group(),
    stopFollow: () => {},
    isFollowing: () => false,
    $: (id) => controls[id] || null,
  });
  return tour;
}

test('starting a free flight after the crash sim moves the aircraft again', async () => {
  const tour = harness();
  tour.crash('dual', false);
  assert.equal(tour.state.mode, 'crash');
  assert.equal(tour.state._ownMove, true, 'crash sim must own horizontal motion while it runs');

  await tour.start('plane', 'free', null);

  assert.equal(tour.state.mode, 'free');
  assert.equal(tour.state._ownMove, false, 'a new flight must release crash-sim motion ownership');
  assert.equal(tour.state.cr, null);
  const x0 = tour.state.p.x, z0 = tour.state.p.z;
  tour.update(0.1);
  const moved = Math.hypot(tour.state.p.x - x0, tour.state.p.z - z0);
  assert.ok(moved > 0.5, 'free flight should translate, moved ' + moved.toFixed(3) + ' m');
});
