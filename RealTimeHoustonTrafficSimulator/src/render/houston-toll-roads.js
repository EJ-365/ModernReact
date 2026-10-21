/**
 * Houston toll roads overlay (OSM ref/name tags in roads-major.json): Sam Houston Tollway, Hardy Toll Road,
 * Westpark, Fort Bend, Grand Parkway (SH 99), Katy Managed Lanes, Tomball, SH 288 and SH 249 toll lanes.
 * One merged ribbon mesh, hidden until toggled.
 */
import * as THREE from 'three';

const TOLL_REF = /\bToll\b|^(SHT|HTR|WPT|TBT|FBP)$/i;
const TOLL_NAME = /Toll(way| Road)|Grand Parkway|Westpark|Managed Lanes|Express Lanes/i;
export function isTollRoad(r) {
  if (!r || !/^(motorway|trunk|motorway_link|trunk_link)$/.test(r.h || '')) return false;
  return TOLL_REF.test(r.r || '') || TOLL_NAME.test(r.n || '');
}
/* short, recognisable corridor names for the legend */
export function tollCorridor(r) {
  const s = (r.n || '') + ' ' + (r.r || '');
  if (/Sam Houston|SHT/i.test(s)) return 'Sam Houston Tollway (Beltway 8)';
  if (/Hardy|HTR/i.test(s)) return 'Hardy Toll Road';
  if (/Westpark|WPT/i.test(s)) return 'Westpark Tollway';
  if (/Fort Bend|FBP/i.test(s)) return 'Fort Bend Toll Road';
  if (/Grand Parkway|99/i.test(s)) return 'Grand Parkway (SH 99)';
  if (/Katy|I 10/i.test(s)) return 'Katy Managed Lanes (I-10)';
  if (/Tomball|TBT/i.test(s)) return 'Tomball Tollway';
  if (/249/.test(s)) return 'SH 249 Tollway';
  if (/288/.test(s)) return 'SH 288 Toll Lanes';
  return 'Other toll lanes';
}

export function createHoustonTollRoads({ parent, url = '/data/houston/roads-major.json', heightAt = null }) {
  const root = new THREE.Group(); root.name = 'houston-toll-roads'; root.visible = false; parent.add(root);
  const mat = new THREE.MeshBasicMaterial({ color: 0xb06cff, transparent: true, opacity: 0.85, depthWrite: false, fog: false,
    polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -16 });
  const stats = { segments: 0, miles: 0, corridors: {} };
  let built = null;
  function build() {
    if (built) return built;
    built = fetch(url).then((r) => r.json()).then((d) => {
      const P = [], I = [];
      for (const r of d.roads || []) {
        if (!isTollRoad(r)) continue;
        const p = r.p, w = Math.max(10, (r.w || 12) * 0.9);
        let len = 0;
        for (let i = 2; i < p.length; i += 2) {
          const ax = p[i - 2], az = p[i - 1], bx = p[i], bz = p[i + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
          if (L < 0.5) continue;
          len += L;
          const nx = -dz / L * w / 2, nz = dx / L * w / 2;
          const ya = (heightAt ? heightAt(ax, az, 0) || 0 : 0) + 1.6, yb = (heightAt ? heightAt(bx, bz, 0) || 0 : 0) + 1.6, b = P.length / 3;
          P.push(ax - nx, ya, az - nz, ax + nx, ya, az + nz, bx - nx, yb, bz - nz, bx + nx, yb, bz + nz);
          I.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
        }
        stats.segments++; stats.miles += len / 1609.344;
        const c = tollCorridor(r); stats.corridors[c] = (stats.corridors[c] || 0) + len / 1609.344;
      }
      if (I.length) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
        g.setIndex(P.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
        g.computeBoundingSphere();
        const m = new THREE.Mesh(g, mat); m.renderOrder = 4; m.name = 'toll-road-overlay'; root.add(m);
      }
      return stats;
    });
    return built;
  }
  return {
    root, stats,
    get visible() { return root.visible; },
    setVisible(v) { root.visible = !!v; if (v) return build(); return Promise.resolve(stats); },
    toggle() { return this.setVisible(!root.visible); }
  };
}
