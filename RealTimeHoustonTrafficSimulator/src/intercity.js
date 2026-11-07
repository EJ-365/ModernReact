/**
 * Intercity flights on the flat Houston map: the Houston plane tour keeps flying the whole trip.
 * Everything uses Houston's linear projection (metres), longitude unwrapped to the short way round.
 * Other cities are embedded at their projected spot with their own true-scale local layout, and a
 * far-ground plane under the camera shows the land/sea between cities (no globe curvature).
 */
import * as THREE from 'three';
import { earthTexture, nightTexture, gcDist, loadNasaTex } from './world/globe.js';
import WORLD_CAT from './world/catalog.json';

const KX = 59.9 * 1609.344, KZ = 69 * 1609.344, LNG0 = -95.3698, LAT0 = 29.7604, D2R = Math.PI / 180;
export function unwrap(lng) { let d = lng - LNG0; while (d > 180) d -= 360; while (d < -180) d += 360; return LNG0 + d; }
/** Houston-map metres for a lat/lng (same numbers as core/geo houstonGeo). */
export function hw(lat, lng) { return { x: (unwrap(lng) - LNG0) * KX + 60, z: -(lat - LAT0) * KZ + 60 }; }

const MAXC = 3;
let land = null, tex = null, ground = null, U = null;
const embeds = new Map(); /* id -> { city, scene, cs, w, kx, kz } */

/** Point (lat,lng) near an embedded city -> Houston metres, consistent with that city's own layout. */
export function cityPt(city, lat, lng) {
  if (city.full) return hw(lat, lng);
  const w = hw(city.lat, city.lng), kx = 111320 * Math.cos(city.lat * D2R), kz = 110574;
  let dl = lng - city.lng; while (dl > 180) dl -= 360; while (dl < -180) dl += 360;
  return { x: w.x + dl * kx, z: w.z - (lat - city.lat) * kz };
}

/** Synthetic tour airport for a catalog city: longest real runway from its pack (or the catalog heading). */
export function tourAirport(city) {
  const a = city.apt, c = cityPt(city, a.lat, a.lng);
  let p;
  if (a.rwy && a.rwy.length === 2) { const p0 = cityPt(city, a.rwy[0][0], a.rwy[0][1]), p1 = cityPt(city, a.rwy[1][0], a.rwy[1][1]); p = [p0.x, p0.z, p1.x, p1.z]; }
  else { const h = (a.hdg || 90) * D2R, L = (a.len || 3000) / 2; p = [c.x - Math.sin(h) * L, c.z + Math.cos(h) * L, c.x + Math.sin(h) * L, c.z - Math.cos(h) * L]; }
  return { code: a.code, n: a.name, x: (p[0] + p[2]) / 2, z: (p[1] + p[3]) / 2, rws: [{ p, w: a.w || 45, ref: a.ref }], world: city.id, tz: city.tz, lat: a.lat, lng: a.lng };
}
export function realKm(a, b) { return gcDist(a, b); }

/* cloud deck between cities: world-fixed puffs wrapped around the camera, so you see them slide past below */
let clouds = null, cloudSeed = null, sunRef = null, cloudFog = null;
const CN = 170, CL = 3, CR = 48000;
function ensureClouds(scene) {
  if (clouds) { if (!clouds.parent) scene.add(clouds); if (cloudFog && !cloudFog.parent) scene.add(cloudFog); return; }
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  for (let i = 0; i < 16; i++) {
    const x = 28 + Math.random() * 72, y = 34 + Math.random() * 60, r = 16 + Math.random() * 26, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: true });
  /* each puff is 3 stacked layers (grey base, bright top) so it reads as a volume from the side and above */
  clouds = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), m, CN * CL);
  for (let i = 0; i < CN * CL; i++) { const l = i % CL; clouds.setColorAt(i, new THREE.Color().setScalar(0.72 + 0.14 * l)); }
  /* inside a cloud: white-out that fades in as the camera enters a puff */
  cloudFog = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { k: { value: 0 }, c: { value: new THREE.Color(1, 1, 1) } }, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vU; void main(){ vU=position.xy; gl_Position=vec4(position.xy,0.0,1.0); }',
    fragmentShader: 'uniform float k; uniform vec3 c; varying vec2 vU; void main(){ gl_FragColor=vec4(c,k*(0.75+0.25*length(vU)*0.7)); }',
  }));
  cloudFog.frustumCulled = false; cloudFog.renderOrder = 999; cloudFog.visible = false; cloudFog.name = 'intercityCloudFog';
  scene.add(cloudFog);
  clouds.frustumCulled = false; clouds.name = 'intercityClouds'; clouds.visible = false;
  cloudSeed = Array.from({ length: CN }, (_, i) => [Math.random() * 2 * CR, Math.random() * 2 * CR, i % 4 === 0 ? 9200 + Math.random() * 2600 : 1700 + Math.random() * 2600, 2200 + Math.random() * 6000, Math.random() * 6.28]);
  scene.add(clouds);
}
let cloudK = 0, cloudIn = 0;
const _cm = new THREE.Matrix4(), _cq = new THREE.Quaternion(), _cs = new THREE.Vector3(), _cp = new THREE.Vector3(), _cy = new THREE.Vector3(0, 1, 0);
function updateClouds(camera, light) {
  if (!clouds) return;
  const cx = camera.position.x, cz = camera.position.z, cy = camera.position.y;
  /* near home Houston's own sky supplies the clouds; the deck fades in beyond ~80 km */
  const far = Math.hypot(cx - 60, cz - 60);
  cloudK += ((far > 80000 ? 1 : 0) - cloudK) * 0.03;
  clouds.visible = cloudK > 0.02; clouds.material.opacity = cloudK;
  if (!clouds.visible) { if (cloudFog) cloudFog.visible = false; cloudIn = 0; return; }
  const W = 2 * CR, wrap = (s, c) => c + ((((s - c) % W) + W * 1.5) % W) - CR;
  let inK = 0;
  for (let i = 0; i < CN; i++) {
    const q = cloudSeed[i], px = wrap(q[0], cx), pz = wrap(q[1], cz), sz = q[3], th = sz * 0.09;
    /* puffs close to the camera shrink away (no pop) while the white-out takes over */
    const dx = (px - cx) / (sz * 0.5), dz = (pz - cz) / (sz * 0.35), dh = Math.hypot(dx, dz), dy = cy - q[2];
    if (dh < 1 && dy > -th * 0.4 && dy < th * 1.4) inK = Math.max(inK, (1 - dh) * 1.6);
    const near = Math.min(1, Math.max(0.05, Math.hypot(px - cx, q[2] + th * 0.5 - cy, pz - cz) / (sz * 0.6)));
    _cq.setFromAxisAngle(_cy, q[4]);
    for (let l = 0; l < CL; l++) {
      const f = (1 - l * 0.22) * near;
      _cp.set(px + l * 60, q[2] + l * th * 0.5, pz - l * 40); _cs.set(sz * f, 1, sz * 0.7 * f);
      clouds.setMatrixAt(i * CL + l, _cm.compose(_cp, _cq, _cs));
    }
  }
  clouds.instanceMatrix.needsUpdate = true;
  cloudIn += (Math.min(1, inK) * cloudK - cloudIn) * 0.12;
  if (cloudFog) { cloudFog.visible = cloudIn > 0.01; cloudFog.material.uniforms.k.value = cloudIn * 0.92; if (light) cloudFog.material.uniforms.c.value.copy(light).multiplyScalar(0.95); }
  if (light) { const C = clouds.material.color.copy(light).multiplyScalar(1.05); C.r = Math.max(C.r, 0.2); C.g = Math.max(C.g, 0.22); C.b = Math.max(C.b, 0.28); }
}

async function ensureGround(scene) {
  ensureClouds(scene);
  if (ground) { if (!ground.parent) scene.add(ground); return; }
  if (!land) { const r = await fetch('/data/world/land.json?r=1', { cache: 'force-cache' }); land = await r.json(); }
  const mobile = matchMedia('(pointer:coarse)').matches;
  tex = earthTexture(land, 1024, 512);
  tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 8; tex.needsUpdate = true;
  const ntex = nightTexture(WORLD_CAT.cities || [], 1024, 512); ntex.wrapS = THREE.RepeatWrapping;
  /* real satellite land/sea colour and night lights (NASA, public domain) replace the painted stand-ins */
  loadNasaTex(mobile ? '2k' : '4k', 4096, (d, n) => { U.map.value = d; U.nmap.value = n; tex.dispose(); ntex.dispose(); tex = d; });
  U = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    map: { value: null }, nmap: { value: null }, nightK: { value: 0 }, uT: { value: 0 }, sunD: { value: new THREE.Vector3(0, 1, 0) }, camY: { value: 0 }, light: { value: new THREE.Color(1, 1, 1) },
    cW: { value: Array.from({ length: MAXC }, () => new THREE.Vector2(1e12, 1e12)) },
    cLL: { value: Array.from({ length: MAXC }, () => new THREE.Vector2()) },
    cK: { value: Array.from({ length: MAXC }, () => new THREE.Vector2(1, 1)) },
  }]);
  U.map.value = tex; U.nmap.value = ntex;
  const mat = new THREE.ShaderMaterial({
    uniforms: U, fog: true, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 4,
    /* fog is computed per pixel: this ground is one 1,200 km quad, so per-vertex fog depth painted it all fog-white */
    vertexShader: `varying vec3 vW;
      void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform sampler2D map; uniform sampler2D nmap; uniform float nightK; uniform float uT; uniform vec3 sunD; uniform float camY; uniform vec3 light; uniform vec2 cW[${MAXC}]; uniform vec2 cLL[${MAXC}]; uniform vec2 cK[${MAXC}]; varying vec3 vW; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
      void main(){
        float lng=(vW.x-60.0)/${KX.toFixed(3)}+${LNG0.toFixed(4)}, lat=${LAT0.toFixed(4)}-(vW.z-60.0)/${KZ.toFixed(3)};
        for(int i=0;i<${MAXC};i++){ vec2 d=vW.xz-cW[i]; float r=length(d); float k=1.0-smoothstep(60000.0,140000.0,r);
          if(k>0.0){ float ln=cLL[i].y+d.x/cK[i].x, la=cLL[i].x-d.y/cK[i].y; lng=mix(lng,ln,k); lat=mix(lat,la,k); } }
        vec2 uv=vec2(fract((lng+180.0)/360.0),(lat+90.0)/180.0); vec4 t=texture2D(map,uv);
        /* field / woodland patches so the land between cities isn't one flat smear (water stays smooth) */
        vec3 c=t.rgb; float land=step(c.b*1.12,max(c.r,c.g));
        float h=fract(sin(dot(floor(vW.xz/430.0),vec2(12.9898,78.233)))*43758.5453);
        float h2=fract(sin(dot(floor(vW.xz/61.0),vec2(39.3468,11.1351)))*24634.6345);
        c*=mix(1.0,0.8+0.3*h+0.07*h2,land);
        /* low down: a patchwork of crop, pasture and fallow fields with darker hedgerow edges, like the view from a window seat */
        float lowK=land*(1.0-smoothstep(5000.0,20000.0,camY));
        float h3=fract(sin(dot(floor(vW.xz/430.0)+7.0,vec2(26.651,4.123)))*15731.7);
        vec3 crop=h3<0.3?vec3(1.13,1.05,0.8):h3<0.6?vec3(0.86,1.07,0.84):h3<0.75?vec3(1.05,0.95,0.86):vec3(1.0);
        vec2 fe=abs(fract(vW.xz/430.0)-0.5); float edge=smoothstep(0.484,0.5,max(fe.x,fe.y))*(1.0-smoothstep(3000.0,10000.0,camY));
        c*=mix(vec3(1.0),crop*(1.0-0.3*edge),lowK);
        /* moonlight floor, ocean swell texture (so you can see it slide by) and city lights at night */
        vec3 lit=c*max(light,vec3(0.07,0.085,0.12));
        /* open ocean: wind swell normals, Fresnel sky reflection and the sun's glitter path */
        if(land<0.5){
          vec2 p=vW.xz; float dist=length(vW-cameraPosition), fade=1.0-smoothstep(4000.0,60000.0,dist);
          vec2 g=vec2(0.0);
          g+=vec2(0.8,0.6)*cos(dot(p,vec2(0.8,0.6))*0.012+uT*0.9)*0.5;
          g+=vec2(-0.4,0.9)*cos(dot(p,vec2(-0.4,0.9))*0.027+uT*1.4)*0.3;
          g+=vec2(0.95,-0.3)*cos(dot(p,vec2(0.95,-0.3))*0.061+uT*2.1)*0.18;
          g+=vec2(0.2,0.98)*cos(dot(p,vec2(0.2,0.98))*0.13+uT*3.0)*0.1;
          vec3 n=normalize(vec3(-g.x*0.35*fade,1.0,-g.y*0.35*fade));
          vec3 v=normalize(cameraPosition-vW); float fr=0.02+0.98*pow(1.0-max(dot(n,v),0.0),5.0);
          vec3 deep=vec3(0.015,0.07,0.11)*max(light,vec3(0.05,0.06,0.09)), sky=mix(fogColor,vec3(0.32,0.5,0.72)*light,0.35);
          vec3 r=reflect(-v,n); float sp=pow(max(dot(r,normalize(sunD)),0.0),380.0)*8.0+pow(max(dot(r,normalize(sunD)),0.0),24.0)*0.12;
          lit=mix(mix(lit,deep,0.65),sky,clamp(fr,0.0,0.85))+vec3(1.0,0.93,0.8)*sp*(1.0-nightK)*step(0.0,sunD.y);
        }
        lit+=texture2D(nmap,uv).rgb*nightK*0.9*smoothstep(1500.0,9000.0,camY); /* city-light glow is for the view from altitude; low down it painted the ground tan */
        gl_FragColor=vec4(lit,1.0);
        #include <colorspace_fragment>
        gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,smoothstep(fogNear,fogFar,length(vW-cameraPosition)));
      }`,
  });
  /* subdivided: a single 1,200 km quad broke depth testing on some GPUs, so it painted over the city, the road and your car */
  ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 48, 48), mat);
  ground.rotation.x = -Math.PI / 2; ground.scale.set(1.2e6, 1.2e6, 1); ground.position.y = -12;
  ground.frustumCulled = false; ground.name = 'intercityGround';
  scene.add(ground);
}

/** Embed a catalog city (not Houston) into the Houston scene at its projected spot. */
export async function embedCity(city, { scene, renderer }) {
  if (!city || city.full) return null;
  if (embeds.has(city.id)) return embeds.get(city.id);
  const rec = { city, cs: null, w: hw(city.lat, city.lng), ready: null };
  embeds.set(city.id, rec);
  await ensureGround(scene).catch((e) => console.warn('[intercity] ground', e));
  rec.ready = import('./world/city-scene.js').then((m) => m.createCityScene({ city, renderer, mobile: matchMedia('(pointer:coarse)').matches })).then((cs) => {
    if (!embeds.has(city.id)) { cs.dispose(); return null; }
    rec.cs = cs;
    const s = cs.scene; s.fog = null; s.background = null;
    /* the Houston scene supplies sky, sun, clouds and rain: hide the city's own */
    for (const o of s.children) {
      if (o.userData.embedKeep) continue;
      if (o.isLight || o.frustumCulled === false || (o.isGroup && o.children[0] && o.children[0].isSprite)) o.visible = false;
    }
    s.position.set(rec.w.x, 0, rec.w.z); s.matrixWorldNeedsUpdate = true;
    scene.add(s);
    rec.cam = new THREE.PerspectiveCamera();
    return rec;
  }).catch((e) => { console.warn('[intercity] city', city.id, e); embeds.delete(city.id); return null; });
  await rec.ready;
  return rec;
}

/* road deck height under (x, z) in an embedded city (null if not on one of its roads): the Houston tour car
   rides on it instead of the bare ground, so it never sinks into raised arterials or flyovers */
export function cityRoadY(x, z, cur = 0) {
  let best = null;
  for (const [, r] of embeds) {
    const cs = r.cs; if (!cs || !cs.graph) continue;
    const lx = x - r.w.x, lz = z - r.w.z, C = 60;
    if (!cs._rgrid) {
      const m = new Map();
      cs.graph.forEach((g, gi) => { const p = g.pts; for (let i = 2; i < p.length; i += 2) { /* flat [x, z, x, z, …] */
        const ax = p[i - 2], az = p[i - 1], bx = p[i], bz = p[i + 1], x0 = Math.floor(Math.min(ax, bx) / C), x1 = Math.floor(Math.max(ax, bx) / C), z0 = Math.floor(Math.min(az, bz) / C), z1 = Math.floor(Math.max(az, bz) / C);
        if ((x1 - x0 + 1) * (z1 - z0 + 1) > 400) continue;
        for (let gx = x0; gx <= x1; gx++) for (let gz = z0; gz <= z1; gz++) { const k = gx * 65536 + gz; (m.get(k) || m.set(k, []).get(k)).push(gi, i); } } });
      cs._rgrid = m;
    }
    const L = cs._rgrid.get(Math.floor(lx / C) * 65536 + Math.floor(lz / C)); if (!L) continue;
    for (let j = 0; j < L.length; j += 2) {
      const g = cs.graph[L[j]], i = L[j + 1], ax = g.pts[i - 2], az = g.pts[i - 1], dx = g.pts[i] - ax, dz = g.pts[i + 1] - az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((lx - ax) * dx + (lz - az) * dz) / l2)), ex = ax + dx * t - lx, ez = az + dz * t - lz, hw = (g.w || 8) / 2 + 0.8;
      if (ex * ex + ez * ez > hw * hw || g.y == null) continue;
      if (best == null || Math.abs(g.y - cur) < Math.abs(best - cur)) best = g.y;
    }
  }
  return best;
}
if (typeof window !== 'undefined') window.HTS_IC_ROAD_Y = cityRoadY;

export function dropCities(keep = []) {
  for (const [id, r] of embeds) {
    if (keep.includes(id)) continue;
    embeds.delete(id);
    if (r.cs) { if (r.cs.scene.parent) r.cs.scene.parent.remove(r.cs.scene); r.cs.dispose(); }
  }
  if (!embeds.size && ground && ground.parent) ground.parent.remove(ground);
  if (!embeds.size) clearHighway();
}
export function active() { return embeds.size > 0 || !!hwy; }

/** Per frame: far ground under the camera, lit like the Houston scene; embedded cities stream their buildings. */
export function update(dt, camera, sceneLight) {
  if (!embeds.size && !hwy) { if (clouds) clouds.visible = false; if (cloudFog) cloudFog.visible = false; return; }
  updateClouds(camera, sceneLight);
  if (ground && ground.parent) {
    ground.position.x = camera.position.x; ground.position.z = camera.position.z;
    /* low over open country (driving): ground right under the road; near Houston keep it below Houston's own ground */
    /* inside an embedded city's own 90 km ground keep the far ground well below it, else the two z-fight (flicker) */
    let inCity = false;
    for (const r of embeds.values()) if (Math.abs(camera.position.x - r.w.x) < 70000 && Math.abs(camera.position.z - r.w.z) < 70000) { inCity = true; break; }
    ground.position.y = !inCity && camera.position.y < 450 && Math.hypot(camera.position.x - 60, camera.position.z - 60) > 90000 ? -0.35 : -12;
    U.uT.value += dt;
    if (!sunRef || !sunRef.parent) sunRef = ground.parent.children.find((o) => o.isDirectionalLight) || null;
    if (sunRef) U.sunD.value.subVectors(sunRef.position, sunRef.target.position).normalize();
    if (sceneLight) { U.light.value.copy(sceneLight); U.camY.value = camera.position.y; const lum = sceneLight.r * 0.3 + sceneLight.g * 0.55 + sceneLight.b * 0.15; U.nightK.value = 1 - Math.min(1, Math.max(0, (lum - 0.18) / 0.35)); }
    let i = 0;
    for (const r of embeds.values()) {
      if (i >= MAXC) break;
      U.cW.value[i].set(r.w.x, r.w.z); U.cLL.value[i].set(r.city.lat, r.city.lng);
      U.cK.value[i].set(111320 * Math.cos(r.city.lat * D2R), 110574); i++;
    }
    for (; i < MAXC; i++) U.cW.value[i].set(1e12, 1e12);
  }
  if (hwy) for (const c of hwy.children) c.visible = Math.hypot(camera.position.x - c.userData.cx, camera.position.z - c.userData.cz) < (camera.position.y < 600 ? 26000 : 60000);
  for (const r of embeds.values()) {
    if (!r.cs) continue;
    const d = Math.hypot(camera.position.x - r.w.x, camera.position.z - r.w.z);
    r.cs.scene.visible = d < 260000;
    if (!r.cs.scene.visible) continue;
    r.cam.position.set(camera.position.x - r.w.x, camera.position.y, camera.position.z - r.w.z);
    r.cam.quaternion.copy(camera.quaternion); r.cam.fov = camera.fov; r.cam.aspect = camera.aspect; r.cam.far = camera.far; r.cam.near = camera.near;
    r.cam.updateProjectionMatrix(); r.cam.updateMatrixWorld();
    try { r.cs.update(dt, r.cam); } catch (e) { /* city LOD is best effort */ }
  }
}

/* ---------- intercity driving: real highway route, drawn as a divided 4-lane interstate ---------- */
let drives = null, hwy = null, laneT = null;
export async function driveData() {
  if (!drives) { const r = await fetch('/data/world/drives.json?r=1', { cache: 'force-cache' }); if (!r.ok) throw new Error('drives ' + r.status); drives = await r.json(); }
  return drives;
}
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** lat/lng on a highway -> Houston-map metres, blending into the destination city's own layout as you get close */
export function roadPt(city, lat, lng) {
  const g = hw(lat, lng); if (!city || city.full) return g;
  const w = hw(city.lat, city.lng), k = 1 - sstep(60000, 140000, Math.hypot(g.x - w.x, g.z - w.z));
  if (k <= 0) return g;
  const l = cityPt(city, lat, lng); return { x: g.x + (l.x - g.x) * k, z: g.z + (l.z - g.z) * k };
}
const TX = (la, ln) => la > 25.8 && la < 36.5 && ln > -106.7 && ln < -93.5;
/** Route points for the Houston tour car (x,y,z,ff mph,ref,name,k = map metres per real metre, rr = real metres left). */
export async function driveRoute(city) {
  const D = (await driveData())[city.id]; if (!D) return null;
  const raw = D.pts.map(([la, ln, ref]) => { const p = roadPt(city, la, ln); return { x: p.x, z: p.z, la, ln, ref: ref || '' }; });
  const out = [];
  for (let i = 0; i < raw.length - 1; i++) {
    const p0 = raw[Math.max(0, i - 1)], p1 = raw[i], p2 = raw[i + 1], p3 = raw[Math.min(raw.length - 1, i + 2)];
    const L = Math.hypot(p2.x - p1.x, p2.z - p1.z); if (L < 0.5) continue;
    const real = gcDist({ lat: p1.la, lng: p1.ln }, { lat: p2.la, lng: p2.ln }) * 1000, k = Math.min(2.2, Math.max(0.45, L / Math.max(1, real)));
    const n = Math.max(1, Math.ceil(L / 120)), smooth = L > 400;
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const cr = (a, b, c, d) => smooth ? 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3) : b + (c - b) * t;
      out.push({ x: cr(p0.x, p1.x, p2.x, p3.x), z: cr(p0.z, p1.z, p2.z, p3.z), k, la: p1.la + (p2.la - p1.la) * t, ln: p1.ln + (p2.ln - p1.ln) * t, ref: p1.ref });
    }
  }
  const e = raw[raw.length - 1]; out.push({ x: e.x, z: e.z, k: 1, la: e.la, ln: e.ln, ref: '' });
  let rr = 0; const cw = hw(city.lat, city.lng);
  for (let i = out.length - 1; i >= 0; i--) {
    const p = out[i]; if (i < out.length - 1) rr += Math.hypot(out[i + 1].x - p.x, out[i + 1].z - p.z) / p.k;
    /* city streets sit at 0.3-0.5 m (embedded scene layers): ride just above them on our own lane strip there so the car isn't swallowed; open highway deck is 0.06 */
    const gp = hw(p.la, p.ln), dc = Math.hypot(gp.x - cw.x, gp.z - cw.z);
    p.rr = rr; p.y = city.full ? 0.27 : 0.27 + 0.5 * (1 - sstep(40000, 50000, dc)); p.ln = 2; p.lw = 3.6; p.lx = 0; p.lz = 0; p.h = 'motorway';
    p.ff = rr < 2500 ? 35 : rr < 20000 ? 55 : TX(p.la, p.ln) ? 75 : p.la < 26 ? 68 : 70;
    const ref = String(p.ref || '').replace(/^I\s+(\d+)/, 'I-$1').replace(/^US\s+(\d+)/, 'US-$1').split(';')[0];
    p.ref = ref; p.name = ref ? ref + ' → ' + city.name : 'Highway';
  }
  return { pts: out, km: D.km };
}
function laneTex() {
  if (laneT) return laneT;
  const W = 128, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.fillStyle = '#6a6c70'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { const v = 88 + Math.random() * 34 | 0; g.fillStyle = `rgba(${v},${v},${v + 3},.5)`; g.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5); }
  const u = (m) => (m + 6.4) / 10.6 * W; /* metres across: -6.4 inner shoulder … +4.2 outer shoulder */
  g.fillStyle = '#85868a'; g.fillRect(u(1.95), 0, W - u(1.95), H); g.fillRect(0, 0, u(-5.5), H);
  g.fillStyle = '#e8c547'; g.fillRect(u(-5.55), 0, 2.2, H); /* yellow inner edge */
  g.fillStyle = '#f1f1ec'; g.fillRect(u(1.8), 0, 2.2, H); /* white outer edge */
  g.fillRect(u(-1.85), 0, 2, H * 0.25); /* 3 m dash, 9 m gap */
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
  return (laneT = t);
}
export function clearHighway() {
  if (!hwy) return;
  if (hwy.parent) hwy.parent.remove(hwy);
  hwy.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  hwy = null;
}
/** Draw route P[from..] as an interstate: two carriageways, grass median, shoulders, roadside trees. */
export function buildHighway(scene, P, from = 0) {
  clearHighway();
  /* 40 m of lane beyond each end: the tour car can sit a few metres off the first/last route point (it started on grass in Dallas) */
  if (P.length > 1) {
    const ext = (a, b) => { const dx = a.x - b.x, dz = a.z - b.z, L = Math.hypot(dx, dz) || 1; return { ...a, x: a.x + dx / L * 40, z: a.z + dz / L * 40 }; };
    P = [ext(P[0], P[1]), ...P.slice(Math.max(0, from)), ext(P[P.length - 1], P[P.length - 2])]; from = 0;
  }
  hwy = new THREE.Group(); hwy.name = 'intercityHighway';
  const mRoad = new THREE.MeshLambertMaterial({ map: laneTex() });
  const mGrass = new THREE.MeshLambertMaterial({ color: 0x5d6f3e }), mVerge = new THREE.MeshLambertMaterial({ color: 0x6f7a48 });
  const crown = new THREE.IcosahedronGeometry(1, 0), trunk = new THREE.CylinderGeometry(0.18, 0.26, 1, 5);
  const mCrown = new THREE.MeshLambertMaterial({ color: 0x4a6a32, flatShading: true }), mTrunk = new THREE.MeshLambertMaterial({ color: 0x5a4632 });
  let rnd = 12345; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const CH = 160, M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3();
  for (let c0 = Math.max(0, from); c0 < P.length - 1; c0 += CH) {
    const c1 = Math.min(P.length - 1, c0 + CH), o = P[c0], grp = new THREE.Group();
    grp.position.set(o.x, 0, o.z);
    const strips = [[-6.4, 4.2, mRoad, 0.06, 1], [-18.4, -29.0, mRoad, 0.06, 1], [-6.4, -18.4, mGrass, 0.035, 0], [4.2, 16, mVerge, 0.03, 0], [-29.0, -41, mVerge, 0.03, 0]];
    for (const [a, b, mat, y, tx] of strips) {
      const pos = [], uv = [], idx = []; let sv = 0;
      for (let i = c0; i <= c1; i++) {
        const p = P[i], pa = P[Math.max(0, i - 1)], pb = P[Math.min(P.length - 1, i + 1)];
        let dx = pb.x - pa.x, dz = pb.z - pa.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
        const rx = -dz, rz = dx;
        if (i > c0) sv += Math.hypot(p.x - P[i - 1].x, p.z - P[i - 1].z);
        /* your carriageway follows the route height (0.21 m under the car): in cities it rides over the OSM streets, so the car is never on bare grass or sunk into a street */
        const yy = tx && a === -6.4 ? Math.max(y, (p.y != null ? p.y : 0.27) - 0.21) : y;
        pos.push(p.x + rx * a - o.x, yy, p.z + rz * a - o.z, p.x + rx * b - o.x, yy, p.z + rz * b - o.z);
        uv.push(0, sv / 12, 1, sv / 12);
        if (i > c0) { const k = (i - c0) * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      /* winding may face down depending on side order: draw both sides */
      const m = new THREE.Mesh(geo, mat); m.material.side = THREE.DoubleSide; m.receiveShadow = !!tx; grp.add(m);
    }
    const nT = Math.round((c1 - c0) * 0.9), cr = new THREE.InstancedMesh(crown, mCrown, nT), tr = new THREE.InstancedMesh(trunk, mTrunk, nT);
    let n = 0;
    for (let i = c0; i < c1 && n < nT; i++) {
      if (R() > 0.85 || P[i].rr < 3000) continue;
      const p = P[i], q = P[i + 1]; let dx = q.x - p.x, dz = q.z - p.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const side = R() < 0.5 ? 20 + R() * 70 : -(46 + R() * 70), along = R() * 120, h = 6 + R() * 9;
      const x = p.x + dx * along - dz * side - o.x, z = p.z + dz * along + dx * side - o.z;
      Q.identity(); SC.set(h * 0.42, h * 0.55, h * 0.42); V.set(x, h * 0.62, z); M.compose(V, Q, SC); cr.setMatrixAt(n, M);
      SC.set(1, h * 0.5, 1); V.set(x, h * 0.25, z); M.compose(V, Q, SC); tr.setMatrixAt(n, M); n++;
    }
    cr.count = tr.count = n; cr.castShadow = true;
    for (const im of [cr, tr]) { im.instanceMatrix.needsUpdate = true; if (im.computeBoundingSphere) im.computeBoundingSphere(); grp.add(im); }
    const mid = P[(c0 + c1) >> 1]; grp.userData.cx = mid.x; grp.userData.cz = mid.z;
    hwy.add(grp);
  }
  scene.add(hwy);
  return hwy;
}
