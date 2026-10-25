/** Airport-to-airport flight phases: takeoff roll + climb, great-circle cruise, ILS approach + rollout. */
import * as THREE from 'three';
import { airliner } from './models.js';
import { gcDist, gcLerp, bearing } from './globe.js';

const D2R = Math.PI / 180;

/** Runway ends in a city scene's metres (falls back to catalog heading/length). */
export function runwayOf(cs) {
  const a = cs.apt; let A, B;
  if (a.rwy) { A = cs.geo.toW(a.rwy[0][0], a.rwy[0][1]); B = cs.geo.toW(a.rwy[1][0], a.rwy[1][1]); }
  else {
    const c = cs.geo.toW(a.lat, a.lng), h = (a.hdg || 0) * D2R, L = (a.len || 3000) / 2;
    A = { x: c.x - Math.sin(h) * L, z: c.z + Math.cos(h) * L }; B = { x: c.x + Math.sin(h) * L, z: c.z - Math.cos(h) * L };
  }
  const len = Math.hypot(B.x - A.x, B.z - A.z) || 1;
  return { A, B, len, dx: (B.x - A.x) / len, dz: (B.z - A.z) / len };
}

function pose(plane, x, y, z, dx, dz, pitch, roll) {
  plane.position.set(x, y, z);
  plane.rotation.set(0, 0, 0); plane.rotation.order = 'YXZ';
  plane.rotation.y = Math.atan2(-dx, -dz); plane.rotation.x = pitch || 0; plane.rotation.z = roll || 0;
}

export class Takeoff {
  constructor(cs, type) {
    this.cs = cs; this.rw = runwayOf(cs); this.plane = airliner(type); cs.scene.add(this.plane);
    this.v = 0; this.s = 60; this.y = this.plane.userData.gearH; this.vy = 0; this.pitch = 0; this.done = false; this.t = 0;
    this.update(0);
  }
  update(dt) {
    const r = this.rw, ud = this.plane.userData; this.t += dt;
    if (this.v < 82) this.v += dt * (this.v < 5 ? 1.2 : 2.4);
    else this.v = Math.min(140, this.v + dt * 1.4);
    if (this.v > 74) { this.pitch = Math.min(0.17, this.pitch + dt * 0.06); this.vy = Math.min(14, this.vy + dt * 3); }
    this.s += this.v * dt; this.y += this.vy * dt;
    pose(this.plane, r.A.x + r.dx * this.s, this.y, r.A.z + r.dz * this.s, r.dx, r.dz, this.pitch, 0);
    ud.beacon.visible = (this.t * 1.2) % 1 < 0.15;
    if (this.y > 1100) this.done = true;
    return this.done;
  }
  get speedKt() { return this.v * 1.944; }
  get altFt() { return Math.max(0, this.y - this.plane.userData.gearH) * 3.281; }
  dispose() { this.cs.scene.remove(this.plane); }
}

export class Approach {
  constructor(cs, type) {
    this.cs = cs; this.rw = runwayOf(cs); this.plane = airliner(type); cs.scene.add(this.plane);
    this.s = -7500; this.v = 80; /* ~7.5 km final, 3° glideslope */ this.done = false; this.t = 0; this.rolled = false;
    this.td = 320; /* touchdown zone */
    this.update(0);
  }
  update(dt) {
    const r = this.rw, ud = this.plane.userData; this.t += dt;
    let y, pitch = 0.03;
    if (this.s < this.td) {
      const d = this.td - this.s; y = ud.gearH + d * Math.tan(3 * D2R);
      if (d < 400) { y = ud.gearH + Math.max(0, d * Math.tan(3 * D2R) * (d / 400)); pitch = 0.08; } /* flare */
      this.v = Math.max(70, this.v - dt * 0.35);
    } else {
      y = ud.gearH; pitch = Math.max(0, 0.08 - (this.s - this.td) / 1200);
      const left = r.len - 150 - this.s; /* always stop with runway to spare */
      const need = this.v * this.v / (2 * Math.max(1, left));
      this.v = Math.max(0, this.v - dt * Math.max(2.4, need));
      this.rolled = true;
    }
    this.s += this.v * dt;
    pose(this.plane, r.A.x + r.dx * this.s, y, r.A.z + r.dz * this.s, r.dx, r.dz, pitch, 0);
    ud.beacon.visible = (this.t * 1.2) % 1 < 0.15;
    if (this.rolled && this.v <= 0.2) this.done = true;
    return this.done;
  }
  get speedKt() { return this.v * 1.944; }
  get altFt() { return Math.max(0, this.plane.position.y - this.plane.userData.gearH) * 3.281; }
  dispose() { this.cs.scene.remove(this.plane); }
}

export class Cruise {
  constructor(from, to) {
    this.a = { lat: from.apt.lat, lng: from.apt.lng }; this.b = { lat: to.apt.lat, lng: to.apt.lng };
    this.dist = gcDist(this.a, this.b);
    this.dur = THREE.MathUtils.clamp(this.dist / 160, 28, 95); /* time-warped */
    this.realH = this.dist / 870 + 0.4; /* real block time at ~870 km/h */
    this.t = 0; this.done = false;
  }
  get k() { return this.t / this.dur; }
  update(dt) {
    this.t = Math.min(this.dur, this.t + dt);
    const k = this.k, p = gcLerp(this.a, this.b, k), n = gcLerp(this.a, this.b, Math.min(1, k + 0.002));
    this.pos = { lat: p.lat, lng: p.lng, hdg: bearing(p, n), altKm: 11 * Math.min(1, Math.min(k, 1 - k) * 12) };
    if (this.t >= this.dur) this.done = true;
    return this.done;
  }
  get remainingKm() { return this.dist * (1 - this.k); }
}

/** Chase / cockpit camera for any plane object. */
export function planeCam(camera, plane, mode, dt, orb) {
  const ud = plane.userData; const L = ud.len || 40;
  plane.updateMatrixWorld();
  if (mode === 'cockpit') {
    const p = ud.cockpit.clone().applyMatrix4(plane.matrixWorld);
    const f = new THREE.Vector3(0, -0.05, -1).applyQuaternion(plane.quaternion).multiplyScalar(100).add(p);
    camera.position.copy(p); camera.up.set(0, 1, 0); camera.lookAt(f); return;
  }
  /* chase orbit like the Houston plane tour: drag swings around the aircraft, scroll moves in/out */
  const o = orb || { yaw: 0, pitch: 0.21, dist: 1 };
  const back = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), plane.rotation.y + o.yaw);
  const d = L * 2.15 * o.dist, el = THREE.MathUtils.clamp(o.pitch, -0.05, 1.3);
  const want = plane.position.clone().addScaledVector(back, d * Math.cos(el)).add(new THREE.Vector3(0, d * Math.sin(el), 0));
  camera.position.lerp(want, 1 - Math.exp(-dt * 4));
  camera.up.set(0, 1, 0); camera.lookAt(plane.position.x, plane.position.y + L * 0.08, plane.position.z);
}
