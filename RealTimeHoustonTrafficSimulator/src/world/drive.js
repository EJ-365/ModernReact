/** Self-driving tour car on a world city's OSM road graph (Americas: keep right). */
import * as THREE from 'three';
import { sedan } from './models.js';

const W = [24, 19, 14, 12, 10, 7.5];
const VMAX = [29, 25, 17, 15, 13, 11]; /* m/s ≈ 65, 55, 38, 34, 29, 25 mph */
const key = (x, z) => Math.round(x * 2) + ',' + Math.round(z * 2);

export function buildGraph(roads) {
  const nodes = new Map();
  const node = (x, z) => { const k = key(x, z); let n = nodes.get(k); if (!n) { n = { x, z, out: [] }; nodes.set(k, n); } return n; };
  for (const r of roads) {
    const p = r.pts; let prev = node(p[0], p[1]);
    for (let i = 2; i + 1 < p.length; i += 2) {
      const n = node(p[i], p[i + 1]); if (n === prev) continue;
      prev.out.push({ to: n, r }); if (!r.oneway) n.out.push({ to: prev, r });
      prev = n;
    }
  }
  return nodes;
}

export class Drive {
  constructor(cs, near) {
    this.cs = cs; this.nodes = cs._graph || (cs._graph = buildGraph(cs.graph));
    let best = null, bd = Infinity;
    for (const n of this.nodes.values()) {
      if (!n.out.length) continue;
      const cls = Math.min(...n.out.map((e) => e.r.cls)); if (cls > 4) continue;
      const d = Math.hypot(n.x - near.x, n.z - near.z) + cls * 120;
      if (d < bd) { bd = d; best = n; }
    }
    if (!best) throw new Error('no drivable road here');
    this.car = sedan(); cs.scene.add(this.car);
    this.a = best; this.e = best.out.reduce((m, e) => (e.r.cls < m.r.cls ? e : m), best.out[0]);
    this.s = 0; this.v = 0; this.turn = null; this.speedK = 1; this.hdg = null; this.view = 'chase';
    this.lat = 0; this.update(0);
  }
  get road() { return this.e.r; }
  pick(at, from) {
    const ox = at.x - from.x, oz = at.z - from.z, oh = Math.atan2(ox, -oz);
    let c = at.out.filter((e) => e.to !== from); if (!c.length) c = at.out;
    const scored = c.map((e) => {
      let d = Math.atan2(e.to.x - at.x, -(e.to.z - at.z)) - oh;
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      return { e, d };
    });
    if (this.turn) {
      const want = scored.filter((s) => (this.turn === 'left' ? s.d < -0.5 : s.d > 0.5));
      if (want.length) { this.turn = null; return want.sort((a, b) => Math.abs(a.d) - Math.abs(b.d))[0].e; }
    }
    return scored.sort((a, b) => (Math.abs(a.d) + a.e.r.cls * 0.08) - (Math.abs(b.d) + b.e.r.cls * 0.08))[0].e;
  }
  update(dt) {
    const e = this.e, A = this.a, B = e.to;
    const L = Math.hypot(B.x - A.x, B.z - A.z) || 0.01;
    const vmax = VMAX[e.r.cls] * this.speedK;
    this.v += THREE.MathUtils.clamp(vmax - this.v, -6 * dt, 2.5 * dt);
    this.s += this.v * dt;
    let guard = 0;
    while (this.s >= L && guard++ < 8) {
      const Lc = Math.hypot(this.e.to.x - this.a.x, this.e.to.z - this.a.z) || 0.01;
      this.s -= Lc; const prev = this.a; this.a = this.e.to; this.e = this.pick(this.a, prev);
      if (this.e.to === prev) this.v *= 0.4;
    }
    const a2 = this.a, b2 = this.e.to, L2 = Math.hypot(b2.x - a2.x, b2.z - a2.z) || 0.01;
    const dx = (b2.x - a2.x) / L2, dz = (b2.z - a2.z) / L2, t = Math.min(1, this.s / L2);
    const lane = this.e.r.oneway ? 0 : W[this.e.r.cls] / 4; /* centre of the right-hand lane */
    this.lat += (lane - this.lat) * Math.min(1, dt * 2);
    const x = a2.x + (b2.x - a2.x) * t - dz * this.lat, z = a2.z + (b2.z - a2.z) * t + dx * this.lat;
    const h = Math.atan2(-dx, -dz);
    if (this.hdg === null) this.hdg = h;
    let dh = h - this.hdg; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
    this.hdg += dh * Math.min(1, dt * 5);
    this.car.position.set(x, 0.35 + (this.e.r.cls <= 5 ? (5 - this.e.r.cls) * 0.04 : 0), z);
    this.car.rotation.y = this.hdg;
    this.car.userData.beam.intensity = this.cs.night > 0.4 ? 60 : 0;
  }
  camera(cam, dt) {
    const c = this.car; const back = new THREE.Vector3(Math.sin(c.rotation.y), 0, Math.cos(c.rotation.y));
    if (this.view === 'driver') {
      const p = c.position.clone().addScaledVector(back, -0.2).add(new THREE.Vector3(0, 1.25, 0)).addScaledVector(new THREE.Vector3(back.z, 0, -back.x), -0.35);
      cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(p.x - back.x * 30, p.y - 0.6, p.z - back.z * 30); return;
    }
    /* chase camera you can orbit (drag) and zoom (wheel / pinch), like the Houston tour car */
    const o = this.orb || { yaw: 0, pitch: 0.36, dist: 1 }, d = 11.5 * o.dist, yw = c.rotation.y + o.yaw, cp = Math.cos(o.pitch);
    const want = new THREE.Vector3(c.position.x + Math.sin(yw) * d * cp, c.position.y + 1.2 + d * Math.sin(o.pitch), c.position.z + Math.cos(yw) * d * cp);
    cam.position.lerp(want, 1 - Math.exp(-dt * 6)); cam.up.set(0, 1, 0);
    cam.lookAt(c.position.x - back.x * 3 * (o.yaw ? 0 : 1), c.position.y + 1.2, c.position.z - back.z * 3 * (o.yaw ? 0 : 1));
  }
  get mph() { return this.v * 2.237; }
  dispose() { this.cs.scene.remove(this.car); }
}
