/**
 * OSM CBD building extrusion — mid-rise fabric only around hand landmarks.
 * Tall iconic towers are placed in app-main (Houston-style landmark meshes).
 */
import * as THREE from 'three';

function makeFacadeCanvas(opts) {
  const {
    w = 512,
    h = 1024,
    base = '#3a4552',
    winA = '#6a849c',
    winB = '#5a748c',
    mullion = 'rgba(0,0,0,0.35)',
    band = '#2a323c',
    litP = 0.34,
    night = false,
  } = opts || {};
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  if (night) {
    x.fillStyle = '#000';
    x.fillRect(0, 0, w, h);
  } else {
    x.fillStyle = base;
    x.fillRect(0, 0, w, h);
  }
  const cols = 10;
  const rows = 36;
  const cw = (w - 20) / cols;
  const ch = (h - 24) / rows;
  for (let r = 0; r < rows; r++) {
    if (!night) {
      x.fillStyle = band;
      x.fillRect(0, 12 + r * ch - 1.5, w, 2.5);
    }
    let lit = false;
    let run = 0;
    for (let cix = 0; cix < cols; cix++) {
      const x0 = 10 + cix * cw;
      const y0 = 12 + r * ch;
      if (night) {
        if (run <= 0) {
          lit = Math.random() < litP;
          run = 1 + ((Math.random() * 3) | 0);
        }
        run--;
        if (lit) {
          x.fillStyle = Math.random() < 0.75 ? '#e8c878' : '#a8c0d8';
          x.globalAlpha = 0.45 + Math.random() * 0.4;
          x.fillRect(x0 + 2, y0 + 2, cw - 5, ch - 6);
          x.globalAlpha = 1;
        }
      } else {
        x.fillStyle = Math.random() < 0.5 ? winA : winB;
        x.fillRect(x0 + 2, y0 + 2, cw - 5, ch - 6);
        x.fillStyle = mullion;
        x.fillRect(x0, y0, 1.5, ch);
      }
    }
  }
  return c;
}

function canvasTex(canvas, aniso) {
  const t = new THREE.CanvasTexture(canvas);
  t.anisotropy = aniso || 4;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export function createOsmFacadeMaterials(aniso) {
  const skins = [
    { base: '#33414f', winA: '#6f8ba6', winB: '#597c96', band: '#22303c', litP: 0.38 },
    { base: '#3f444c', winA: '#1f242c', winB: '#2b303a', band: '#15181e', litP: 0.32 },
    { base: '#93897a', winA: '#5d6a78', winB: '#4d5a68', band: '#7c7263', litP: 0.4 },
    { base: '#a9abaf', winA: '#5f7188', winB: '#516074', band: '#8e9094', litP: 0.36 },
  ];
  const walls = skins.map((s) => {
    const day = canvasTex(makeFacadeCanvas({ ...s, night: false }), aniso);
    const em = canvasTex(makeFacadeCanvas({ ...s, night: true }), aniso);
    return new THREE.MeshPhongMaterial({
      map: day,
      emissiveMap: em,
      emissive: new THREE.Color(0xe0cca8),
      emissiveIntensity: 0,
      shininess: 55,
      specular: 0x445566,
    });
  });
  const low = skins.slice(0, 3).map((s) => {
    const day = canvasTex(makeFacadeCanvas({ ...s, night: false }), aniso);
    const em = canvasTex(makeFacadeCanvas({ ...s, night: true, litP: s.litP * 0.5 }), aniso);
    return new THREE.MeshLambertMaterial({
      map: day,
      emissiveMap: em,
      emissive: new THREE.Color(0xd0b888),
      emissiveIntensity: 0,
    });
  });
  const roof = new THREE.MeshLambertMaterial({ color: 0x6a727c });
  const roofLite = new THREE.MeshLambertMaterial({ color: 0x8a9098 });
  return { walls, low, roof, roofLite };
}

function remapFacadeUVs(geo, hWorld, floors, span) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const pos = geo.attributes.position;
  const nrm = geo.attributes.normal;
  const uv = geo.attributes.uv;
  if (!pos || !uv || !nrm) return;
  const uRepeat = Math.max(2, Math.round(span / 14));
  const vRepeat = Math.max(2, floors);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const ny = Math.abs(nrm.getY(i));
    if (ny > 0.55) {
      uv.setXY(i, 0.05, 0.05);
    } else {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const nx = Math.abs(nrm.getX(i));
      const u =
        nx > 0.5
          ? (z - bb.min.z) / Math.max(1e-3, bb.max.z - bb.min.z)
          : (x - bb.min.x) / Math.max(1e-3, bb.max.x - bb.min.x);
      const v = (y - bb.min.y) / Math.max(1e-3, hWorld);
      uv.setXY(i, u * uRepeat, v * vRepeat);
    }
  }
  uv.needsUpdate = true;
}

/**
 * Load OSM CBD as mid-rise fabric. Skip landmark parcels + water.
 * Does NOT place skyscrapers — those are hand landmarks in app-main.
 */
export async function loadOsmCbdBuildings(opts) {
  const { parent, geoToWorld, cityId, registerFoot, skipNear } = opts;
  if (!parent || !geoToWorld || !cityId) return { count: 0, group: null };

  const url = `/data/cities/${cityId}/buildings-cbd.json`;
  let pack;
  try {
    const r = await fetch(url, { cache: 'force-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    pack = await r.json();
  } catch (e) {
    console.warn('[HTS] OSM buildings missing for', cityId, e && e.message);
    return { count: 0, group: null };
  }
  if (!pack || !Array.isArray(pack.buildings) || !pack.buildings.length) {
    return { count: 0, group: null };
  }

  /* Mid-rise fabric scale only — keep below hand landmark skyline */
  const M_TO_WORLD = 210 / 1609.34 * 2.4;
  const group = new THREE.Group();
  group.name = 'osm-cbd-buildings';
  const mats = createOsmFacadeMaterials();
  if (typeof window !== 'undefined') {
    window.HTS_OSM_FACADE_MATS = [...mats.walls, ...mats.low];
  }

  function nearSkip(x, z) {
    if (!skipNear || !skipNear.length) return false;
    for (let i = 0; i < skipNear.length; i++) {
      const s = skipNear[i];
      if (Math.hypot(x - s.x, z - s.z) < (s.r || 40)) return true;
    }
    return false;
  }
  function inWaterOpt(x, z) {
    return typeof opts.inWater === 'function' && !!opts.inWater(x, z);
  }

  let count = 0;
  const maxN = Math.min(pack.buildings.length, 1200);
  for (let i = 0; i < maxN; i++) {
    const b = pack.buildings[i];
    const ring = b.ring;
    if (!ring || ring.length < 4) continue;

    const shape = new THREE.Shape();
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    let ok = true;
    for (let k = 0; k < ring.length - 1; k++) {
      const w = geoToWorld(ring[k][0], ring[k][1]);
      if (!Number.isFinite(w.x) || !Number.isFinite(w.z)) {
        ok = false;
        break;
      }
      if (k === 0) shape.moveTo(w.x, -w.z);
      else shape.lineTo(w.x, -w.z);
      if (w.x < minX) minX = w.x;
      if (w.x > maxX) maxX = w.x;
      if (w.z < minZ) minZ = w.z;
      if (w.z > maxZ) maxZ = w.z;
    }
    if (!ok) continue;

    const cx = (minX + maxX) * 0.5,
      cz = (minZ + maxZ) * 0.5;
    if (nearSkip(cx, cz)) continue;
    if (inWaterOpt(cx, cz)) continue;

    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    const span = Math.hypot(spanX, spanZ);
    const area = spanX * spanZ;
    if (span < 10 || spanX < 5 || spanZ < 5 || area < 70) continue;

    const kind = String(b.building || '');
    if (/^(ruins|roof|garage|garages|shed|carport|kiosk|container|construction)$/i.test(kind))
      continue;
    const nm = String(b.name || '');
    if (/state capitol|texas state capitol|capitol building|ut tower|main building/i.test(nm)) continue;
    /* Unnamed parcels on Capitol grounds still get skipped via skipNear */

    let hM = Number(b.h) || 10;
    if (b.levels) hM = Math.max(hM, Number(b.levels) * 3.2);
    if (hM > 280 && !b.levels) hM = hM / 3.28084;
    /* Fabric only — skip real skyscrapers (hand landmarks own those parcels) */
    if (hM >= 55 || (b.levels && b.levels >= 18)) continue;
    if (!b.name && !b.levels && hM <= 12 && area < 200) continue;
    if (!b.levels && hM <= 14) {
      hM = Math.min(28, 10 + span * 0.12);
    }
    hM = Math.min(Math.max(hM, 6), 48);
    const hWorld = Math.min(hM * M_TO_WORLD, 90);
    const floors = Math.max(2, Math.round(hM / 3.2));

    let geo;
    try {
      geo = new THREE.ExtrudeGeometry(shape, {
        depth: hWorld,
        bevelEnabled: false,
        curveSegments: 1,
        steps: 1,
      });
      geo.rotateX(-Math.PI / 2);
      geo.computeVertexNormals();
      remapFacadeUVs(geo, hWorld, floors, span);
    } catch {
      continue;
    }

    const seed = (nm + String(b.h) + String(ring[0])).length;
    const wall = hM < 22 ? mats.low[seed % mats.low.length] : mats.walls[seed % mats.walls.length];
    const roof = mats.roofLite;
    const mesh = new THREE.Mesh(geo, [wall, roof]);
    mesh.position.y = 0.02;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.osm = true;
    group.add(mesh);

    if (registerFoot) {
      registerFoot(cx, cz, Math.max(6, spanX), Math.max(6, spanZ));
    }
    count++;
  }

  parent.add(group);
  console.log('%cOSM CBD fabric · ' + cityId + ': ' + count + ' mid-rises', 'color:#7fd6a0');
  return { count, group, pack, mats };
}

export default loadOsmCbdBuildings;
