/**
 * Globe view: Natural Earth land painted onto a sphere, real-time sun terminator,
 * night lights, drifting clouds, atmosphere, live aircraft near the focused city.
 * Units: kilometres. Free data only (Natural Earth is public domain).
 */
import * as THREE from 'three';

export const R_EARTH = 6371;
const D2R = Math.PI / 180;

/** lat/lng → point matching three's SphereGeometry UV layout (u=0 at lng −180). */
export function llToVec(lat, lng, r = R_EARTH, out = new THREE.Vector3()) {
  const p = lat * D2R, l = lng * D2R;
  return out.set(r * Math.cos(p) * Math.cos(l), r * Math.sin(p), -r * Math.cos(p) * Math.sin(l));
}
export function vecToLL(v) {
  const r = v.length() || 1;
  return { lat: Math.asin(THREE.MathUtils.clamp(v.y / r, -1, 1)) / D2R, lng: Math.atan2(-v.z, v.x) / D2R };
}
/** Great-circle distance in km. */
export function gcDist(a, b) {
  const p1 = a.lat * D2R, p2 = b.lat * D2R, dl = (b.lng - a.lng) * D2R;
  const h = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}
/** Point at fraction t along the great circle a→b. */
export function gcLerp(a, b, t) {
  const va = llToVec(a.lat, a.lng, 1), vb = llToVec(b.lat, b.lng, 1);
  const om = Math.acos(THREE.MathUtils.clamp(va.dot(vb), -1, 1));
  if (om < 1e-6) return { lat: a.lat, lng: a.lng };
  const s = Math.sin(om);
  const v = va.multiplyScalar(Math.sin((1 - t) * om) / s).add(vb.multiplyScalar(Math.sin(t * om) / s));
  return vecToLL(v);
}
export function bearing(a, b) {
  const p1 = a.lat * D2R, p2 = b.lat * D2R, dl = (b.lng - a.lng) * D2R;
  return (Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) / D2R + 360) % 360;
}
/** Sub-solar point for a Date (declination + hour angle, ±1°). */
export function subSolar(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const doy = (date.getTime() - start) / 864e5;
  const decl = -23.44 * Math.cos((2 * Math.PI / 365.24) * (doy + 10));
  const b = (2 * Math.PI / 364) * (doy - 81);
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); /* minutes */
  const utcH = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let lng = -15 * (utcH - 12 + eot / 60);
  lng = ((lng + 540) % 360) - 180;
  return { lat: decl, lng };
}

/* Extra metro lights for the night side (approximate centres, public knowledge). */
const LIGHTS = [
  [31.23, 121.47], [39.9, 116.4], [22.54, 114.06], [23.13, 113.26], [30.57, 104.07], [34.69, 135.5], [25.03, 121.56],
  [-6.2, 106.85], [10.82, 106.63], [21.03, 105.85], [3.14, 101.69], [24.86, 67.0], [23.81, 90.41], [13.08, 80.27], [12.97, 77.59],
  [17.39, 78.49], [22.57, 88.36], [33.69, 73.05], [31.55, 74.34], [35.69, 51.39], [41.01, 28.98], [55.75, 37.62], [59.93, 30.36],
  [50.45, 30.52], [52.23, 21.01], [48.21, 16.37], [50.08, 14.44], [47.5, 19.04], [45.46, 9.19], [41.39, 2.17], [38.72, -9.14],
  [53.35, -6.26], [53.48, -2.24], [52.37, 4.9], [50.85, 4.35], [55.68, 12.57], [59.33, 18.07], [59.91, 10.75], [60.17, 24.94],
  [37.98, 23.73], [24.71, 46.68], [21.49, 39.19], [33.31, 44.36], [-1.29, 36.82], [9.03, 38.74], [-26.2, 28.05], [-33.92, 18.42],
  [-4.44, 15.27], [14.72, -17.47], [12.0, 8.52], [9.06, 7.49], [33.57, -7.59], [36.81, 10.18], [-23.55, -46.63], [-22.91, -43.17],
  [-34.6, -58.38], [-33.45, -70.67], [-12.05, -77.04], [4.71, -74.07], [10.48, -66.9], [-15.79, -47.88], [45.5, -73.57], [45.42, -75.69],
  [51.05, -114.07], [47.61, -122.33], [37.77, -122.42], [32.72, -117.16], [33.45, -112.07], [39.74, -104.99], [44.98, -93.27],
  [38.63, -90.2], [39.1, -84.51], [42.33, -83.05], [40.44, -79.99], [39.95, -75.17], [38.9, -77.04], [42.36, -71.06], [33.75, -84.39],
  [35.23, -80.84], [36.16, -86.78], [29.95, -90.07], [28.54, -81.38], [27.95, -82.46], [32.08, -81.09], [-27.47, 153.03], [-31.95, 115.86],
  [-34.93, 138.6], [-36.85, 174.76], [43.06, 141.35], [33.59, 130.4], [35.18, 136.91], [35.1, 129.04], [14.6, 120.98], [18.79, 98.99],
];

function hash3(x, y, z) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const L = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v),
           L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w);
}

function landPath(land, W, H) {
  const q = land.q, path = new Path2D();
  for (const poly of land.rings) {
    for (const r of poly) {
      for (let i = 0; i < r.length; i += 2) {
        const x = (r[i] * q + 180) / 360 * W, y = (90 - r[i + 1] * q) / 180 * H;
        if (i) path.lineTo(x, y); else path.moveTo(x, y);
      }
      path.closePath();
    }
  }
  return path;
}

export function earthTexture(land, W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const og = g.createLinearGradient(0, 0, 0, H);
  og.addColorStop(0, '#2a4a66'); og.addColorStop(0.18, '#123e68'); og.addColorStop(0.5, '#0b3a70');
  og.addColorStop(0.82, '#123e68'); og.addColorStop(1, '#2a4a66');
  g.fillStyle = og; g.fillRect(0, 0, W, H);
  const path = landPath(land, W, H);
  /* shallow shelf glow along the coasts */
  g.save(); g.strokeStyle = 'rgba(70,150,180,0.35)'; g.lineWidth = Math.max(2, W / 900); g.stroke(path); g.restore();
  g.save(); g.clip(path, 'evenodd');
  const lg = g.createLinearGradient(0, 0, 0, H);
  const st = (lat, col) => lg.addColorStop((90 - lat) / 180, col);
  st(90, '#eef3f6'); st(72, '#e4ebee'); st(66, '#8c8f78'); st(58, '#4a6440'); st(48, '#5b7a45'); st(38, '#7f8a55');
  st(28, '#a99467'); st(18, '#8f8a58'); st(8, '#3f6b34'); st(-8, '#3d6a33'); st(-20, '#7c8650'); st(-30, '#a48d60');
  st(-42, '#6c7d4c'); st(-56, '#5b6a4c'); st(-62, '#dfe7ec'); st(-90, '#f3f6f8');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  /* the big deserts */
  const blob = (lat, lng, rx, ry, col) => {
    const x = (lng + 180) / 360 * W, y = (90 - lat) / 180 * H;
    const gr = g.createRadialGradient(x, y, 0, x, y, rx / 360 * W);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  };
  blob(23, 12, 26, 9, 'rgba(206,176,120,0.95)'); blob(24, 45, 13, 8, 'rgba(206,172,114,0.9)'); blob(-25, 132, 16, 8, 'rgba(190,130,80,0.85)');
  blob(43, 103, 14, 5, 'rgba(176,160,118,0.8)'); blob(-23, 21, 7, 6, 'rgba(176,156,104,0.7)'); blob(33, -112, 8, 5, 'rgba(170,140,100,0.65)');
  blob(40, 60, 12, 5, 'rgba(176,160,112,0.7)'); blob(27, 70, 6, 4, 'rgba(190,164,112,0.7)'); blob(-22, -69, 3, 8, 'rgba(176,150,110,0.7)');
  blob(-4, -62, 16, 8, 'rgba(40,96,40,0.7)'); blob(0, 22, 10, 6, 'rgba(36,90,38,0.7)'); blob(0, 112, 14, 6, 'rgba(36,92,44,0.6)');
  /* fine speckle so land doesn't look flat: one 256 px noise tile, repeated */
  const nc = document.createElement('canvas'); nc.width = nc.height = 256; const ng = nc.getContext('2d'); const nd = ng.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const n = vnoise(x / 9, y / 9, 0) * 0.6 + vnoise(x / 40, y / 40, 3) * 0.4; const v = 200 + n * 55, i = (y * 256 + x) * 4;
    nd.data[i] = nd.data[i + 1] = nd.data[i + 2] = v; nd.data[i + 3] = 255;
  }
  ng.putImageData(nd, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = g.createPattern(nc, 'repeat'); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
  g.restore();
  g.save(); g.strokeStyle = 'rgba(20,30,20,0.35)'; g.lineWidth = Math.max(1, W / 2400); g.stroke(path); g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function nightTexture(cities, W, H) {
  /* sharp city lights: a small bright core, highway spokes and a speckled street grid (1 px dots), no wide blurry blobs */
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const pts = cities.map((k) => [k.lat, k.lng, 1.25]).concat(LIGHTS.map((p) => [p[0], p[1], 0.85]));
  const px = W / 4096;
  for (const [lat, lng, s] of pts) {
    const x = (lng + 180) / 360 * W, y = (90 - lat) / 180 * H, r = W / 1500 * s, sx = x | 0, sy = y | 0;
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 0.55);
    gr.addColorStop(0, 'rgba(255,232,180,0.95)'); gr.addColorStop(0.45, 'rgba(255,196,120,0.35)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    const sp = 5 + (hash3(sx, sy, 1) * 4 | 0);
    for (let k = 0; k < sp; k++) { /* highways leaving town */
      const a = (k / sp + hash3(k, sx, 2) * 0.12) * Math.PI * 2, len = r * (1.8 + 2.4 * hash3(k, sy, 3));
      for (let d = r * 0.3; d < len; d += 0.9 * px + 0.4) {
        const w = Math.sin(d * 0.08 + k) * 0.6;
        g.fillStyle = 'rgba(255,' + (200 + (hash3(k, d | 0, 4) * 30 | 0)) + ',130,' + (0.85 * (1 - d / len) + 0.1) + ')';
        g.fillRect(x + Math.cos(a) * d - Math.sin(a) * w, y + Math.sin(a) * d + Math.cos(a) * w, px, px);
      }
    }
    const rot = hash3(sx, sy, 5) * 1.2, ca = Math.cos(rot), sa = Math.sin(rot), n = (220 * s) | 0, gs = 1.6 * px;
    for (let i = 0; i < n; i++) { /* street grid: dots snapped to a rotated block grid, thinning outwards */
      const rr = Math.pow(hash3(i, sx, 6), 1.7) * r * 2.2, a = hash3(i, sy, 7) * Math.PI * 2;
      let u = Math.cos(a) * rr, v = Math.sin(a) * rr;
      if (hash3(i, 8, sx) < 0.5) u = Math.round(u / gs) * gs; else v = Math.round(v / gs) * gs;
      g.fillStyle = 'rgba(255,' + (190 + (hash3(i, 9, sy) * 50 | 0)) + ',' + (110 + (hash3(i, 10, sx) * 60 | 0)) + ',' + (0.3 + 0.6 * hash3(i, 3, sx) * (1 - rr / (r * 2.4))) + ')';
      g.fillRect(x + u * ca - v * sa, y + u * sa + v * ca, px, px);
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function cloudTexture(W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const img = g.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) {
    const lat = (0.5 - y / H) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    const band = 0.55 + 0.45 * Math.abs(Math.sin(lat * 2.6)); /* ITCZ + mid-latitude storm tracks, drier subtropics */
    for (let x = 0; x < W; x++) {
      const lng = x / W * Math.PI * 2;
      const px = cl * Math.cos(lng) * 3, py = sl * 3, pz = cl * Math.sin(lng) * 3;
      let n = 0, a = 0.5, f = 1;
      for (let o = 0; o < 5; o++) { n += a * vnoise(px * f + 11, py * f * 1.6 + 5, pz * f); a *= 0.5; f *= 2.1; }
      const v = Math.max(0, Math.min(1, (n * band - 0.42) * 3.2));
      const i = (y * W + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = v * 235;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** NASA Blue Marble (day) + Black Marble 2016 (night lights) equirectangular textures. */
export function loadNasaTex(tag, maxTex, done) {
  const L = new THREE.TextureLoader(), an = Math.min(8, 16);
  const get = (u) => new Promise((res) => L.load(u, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = an; t.wrapS = THREE.RepeatWrapping; res(t); }, undefined, () => res(null)));
  if ((maxTex || 4096) < 4096) tag = '2k';
  Promise.all([get(`/data/world/earth-${tag}.jpg`), get(`/data/world/night-${tag}.jpg`)]).then(([d, n]) => { if (d && n) done(d, n); });
}
export function createGlobe({ catalog, land, mobile, maxTex }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040a);
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 200000);
  /* 4096×2048 max (2048 on phones): bigger canvases crash or stall many GPUs */
  const W = Math.min(mobile ? 2048 : 4096, maxTex || 4096), H = W / 2;
  /* small painted stand-ins, swapped for NASA Blue Marble / Black Marble (public domain) once they load */
  const dayTex = earthTexture(land, 1024, 512);
  const nightTex = nightTexture(catalog, 1024, 512);
  const tag = W >= 4096 ? '4k' : '2k';
  const sunDir = new THREE.Vector3(1, 0, 0);
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { day: { value: dayTex }, night: { value: nightTex }, sunDir: { value: sunDir }, lightK: { value: 1 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform sampler2D day; uniform sampler2D night; uniform vec3 sunDir; uniform float lightK;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 n=normalize(vN); float d=dot(n,sunDir); float dayK=smoothstep(-0.10,0.16,d);
        vec3 col=texture2D(day,vUv).rgb;
        float water=step(col.r+0.03,col.b)*step(col.g,col.b+0.02);
        vec3 v=normalize(cameraPosition-vW);
        vec3 lit=col*(0.10+0.95*max(d,0.0));
        vec3 h=normalize(sunDir+v); float spec=pow(max(dot(n,h),0.0),70.0)*water*0.55*dayK;
        vec3 nightC=col*0.03+texture2D(night,vUv).rgb*(1.0-dayK)*1.35*lightK;
        vec3 c=mix(nightC,lit,dayK)+spec;
        float rim=pow(1.0-max(dot(n,v),0.0),3.0);
        c+=vec3(0.30,0.55,1.0)*rim*0.45*max(dayK,0.12);
        gl_FragColor=vec4(c,1.0);
        #include <colorspace_fragment>
      }`,
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, mobile ? 128 : 192, mobile ? 96 : 128), earthMat);
  loadNasaTex(tag, maxTex, (d, n) => { earthMat.uniforms.day.value = d; earthMat.uniforms.night.value = n; dayTex.dispose(); nightTex.dispose(); });
  scene.add(earth);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH + 9, 96, 64),
    new THREE.MeshLambertMaterial({ map: cloudTexture(mobile ? 512 : 1024, mobile ? 256 : 512), transparent: true, depthWrite: false, opacity: 0.85 }));
  scene.add(clouds);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH * 1.035, 96, 64), new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: sunDir } }, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 sunDir; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 v=normalize(vW-cameraPosition); float k=pow(max(0.0,0.62+dot(vN,v)*-1.0+0.0),2.0);
        float i=pow(clamp(1.0-abs(dot(normalize(vN),-v)),0.0,1.0),5.0);
        float day=smoothstep(-0.35,0.35,dot(normalize(vW),sunDir));
        gl_FragColor=vec4(vec3(0.35,0.62,1.0)*i*(0.25+0.95*day),1.0); }`,
  }));
  scene.add(atmo);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); scene.add(sun);
  scene.add(new THREE.AmbientLight(0x334455, 0.35));
  /* stars */
  {
    const n = 2600, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = hash3(i, 1, 2) * 2 - 1, a = hash3(i, 5, 9) * Math.PI * 2, s = Math.sqrt(1 - u * u);
      p[i * 3] = s * Math.cos(a) * 90000; p[i * 3 + 1] = u * 90000; p[i * 3 + 2] = s * Math.sin(a) * 90000;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.75 })));
  }
  /* live aircraft (instanced arrowheads tangent to the surface) */
  const MAXF = 400;
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -1, 0.55, 0, 0.7, 0, 0, 0.35, 0, 0, -1, 0, 0, 0.35, -0.55, 0, 0.7], 3));
  fGeo.computeVertexNormals();
  const fMesh = new THREE.InstancedMesh(fGeo, new THREE.MeshBasicMaterial({ color: 0xffd34d, side: THREE.DoubleSide }), MAXF);
  fMesh.count = 0; fMesh.frustumCulled = false; scene.add(fMesh);
  /* user flight: route arc + plane marker */
  const routeMat = new THREE.LineBasicMaterial({ color: 0x7fd3ff, transparent: true, opacity: 0.9 });
  let routeLine = null;
  const plane = new THREE.Mesh(fGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
  plane.visible = false; scene.add(plane);
  const planeHalo = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 32), new THREE.MeshBasicMaterial({ color: 0x7fd3ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  planeHalo.visible = false; scene.add(planeHalo);

  const state = { lat: 29.76, lng: -95.37, alt: 9000 };
  const goal = { lat: 29.76, lng: -95.37, alt: 9000 };
  let tween = null;
  const _m = new THREE.Matrix4(), _up = new THREE.Vector3(), _n = new THREE.Vector3(), _e = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();

  function basis(lat, lng) {
    llToVec(lat, lng, 1, _up);
    _e.set(-Math.sin(lng * D2R), 0, -Math.cos(lng * D2R)); /* east = d/dlng */
    _n.crossVectors(_up, _e).normalize(); /* north */
  }
  function placeArrow(m, lat, lng, altKm, hdg, size) {
    basis(lat, lng);
    llToVec(lat, lng, R_EARTH + altKm, _p);
    const h = hdg * D2R;
    const fwd = _n.clone().multiplyScalar(Math.cos(h)).add(_e.clone().multiplyScalar(Math.sin(h)));
    const right = new THREE.Vector3().crossVectors(fwd, _up);
    /* local -z = forward, +x = right, +y = up */
    m.makeBasis(right, _up, fwd.negate());
    m.scale(_s.set(size, size, size)); m.setPosition(_p);
    return m;
  }
  function tilt() { return THREE.MathUtils.clamp(1 - state.alt / 2600, 0, 1) * 0.95; }
  function applyCam() {
    basis(state.lat, state.lng);
    const S = llToVec(state.lat, state.lng, R_EARTH);
    const t = tilt();
    const dir = _up.clone().multiplyScalar(Math.cos(t)).addScaledVector(_n, -Math.sin(t));
    camera.position.copy(S).addScaledVector(dir, state.alt);
    camera.up.copy(t > 0.02 ? _up : _n);
    camera.lookAt(S);
    camera.near = Math.max(0.05, state.alt * 0.02);
    camera.far = state.alt + R_EARTH * 3 + 100000;
    camera.updateProjectionMatrix();
  }
  function update(dt) {
    const s = subSolar(new Date());
    llToVec(s.lat, s.lng, 1, sunDir);
    sun.position.copy(sunDir).multiplyScalar(50000);
    clouds.rotation.y += dt * 0.0016;
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / tween.dur);
      const k = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2;
      const mid = gcLerp(tween.a, tween.b, k);
      const hop = Math.min(9000, gcDist(tween.a, tween.b) * 0.9);
      const altMid = Math.max(tween.a.alt, tween.b.alt, hop);
      goal.lat = state.lat = mid.lat; goal.lng = state.lng = mid.lng;
      goal.alt = state.alt = k < 0.5 ? tween.a.alt + (altMid - tween.a.alt) * Math.sin(k * Math.PI) : tween.b.alt + (altMid - tween.b.alt) * Math.sin(k * Math.PI);
      if (tween.t >= 1) { const cb = tween.cb; tween = null; cb && cb(); }
    } else {
      const f = 1 - Math.exp(-dt * 7);
      let dl = goal.lng - state.lng; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
      state.lat += (goal.lat - state.lat) * f; state.lng += dl * f; state.alt *= Math.pow(goal.alt / state.alt, f);
      if (state.lng > 180) state.lng -= 360; if (state.lng < -180) state.lng += 360;
    }
    if (!api.chaseOn) applyCam();
    earthMat.uniforms.lightK.value = THREE.MathUtils.clamp((state.alt - 300) / 3500, 0.12, 1); /* city-light texture is coarse up close */
    if (planeHalo.visible) planeHalo.material.opacity = 0.35 + 0.3 * Math.sin(performance.now() / 300);
  }
  function drag(dx, dy, h) {
    if (tween) return;
    const kmPerPx = (2 * goal.alt * Math.tan(22.5 * D2R)) / Math.max(300, h);
    const deg = Math.min(4, kmPerPx / 111.2);
    goal.lng -= dx * deg / Math.max(0.2, Math.cos(goal.lat * D2R));
    goal.lat = THREE.MathUtils.clamp(goal.lat + dy * deg, -82, 82);
    if (goal.lng > 180) goal.lng -= 360; if (goal.lng < -180) goal.lng += 360;
  }
  function zoom(f) { if (!tween) goal.alt = THREE.MathUtils.clamp(goal.alt * f, 25, 42000); }
  function flyTo(lat, lng, alt, dur, cb) {
    tween = { a: { lat: state.lat, lng: state.lng, alt: state.alt }, b: { lat, lng, alt }, t: 0, dur: dur || 2.4, cb };
  }
  function jump(lat, lng, alt) { tween = null; state.lat = goal.lat = lat; state.lng = goal.lng = lng; state.alt = goal.alt = alt; applyCam(); }
  function setFlights(list) {
    /* no arrowhead markers on the globe: planes are only shown as real models */
    if (fMesh.count) { fMesh.count = 0; fMesh.instanceMatrix.needsUpdate = true; }
    if (fMesh.count === 0) return;
    const n = Math.min(MAXF, list.length);
    const sz = THREE.MathUtils.clamp(state.alt * 0.006, 0.6, 30);
    for (let i = 0; i < n; i++) {
      const f = list[i];
      fMesh.setMatrixAt(i, placeArrow(_m, f.lat, f.lng, Math.max(0.3, (f.altFt || 0) * 0.0003048), f.hdg || 0, sz));
    }
    fMesh.count = n; fMesh.instanceMatrix.needsUpdate = true;
  }
  function setRoute(a, b) {
    if (routeLine) { scene.remove(routeLine); routeLine.geometry.dispose(); routeLine = null; }
    if (!a || !b) return;
    const pts = [];
    for (let i = 0; i <= 128; i++) { const p = gcLerp(a, b, i / 128); pts.push(llToVec(p.lat, p.lng, R_EARTH + 14 + 60 * Math.sin(Math.PI * i / 128))); }
    routeLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), routeMat);
    scene.add(routeLine);
  }
  function setPlane(p) {
    if (!p) { plane.visible = planeHalo.visible = false; return; }
    const sz = THREE.MathUtils.clamp(state.alt * 0.012, 2, 70);
    placeArrow(plane.matrix, p.lat, p.lng, 14 + (p.altKm || 10), p.hdg, sz);
    plane.matrixAutoUpdate = false; plane.visible = true;
    placeArrow(planeHalo.matrix, p.lat, p.lng, 13 + (p.altKm || 10), 0, sz * 1.5);
    planeHalo.matrix.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    planeHalo.matrixAutoUpdate = false; planeHalo.visible = true;
  }
  /** Flight camera: behind and above the aircraft at (lat,lng), looking along heading toward the horizon. */
  function chase(lat, lng, hdg, camAlt, back) {
    basis(lat, lng); const h = hdg * D2R;
    const fwd = _n.clone().multiplyScalar(Math.cos(h)).addScaledVector(_e, Math.sin(h));
    const P = llToVec(lat, lng, R_EARTH);
    camera.position.copy(P).addScaledVector(_up, camAlt).addScaledVector(fwd, -back);
    camera.up.copy(_up);
    camera.lookAt(P.clone().addScaledVector(_up, camAlt * 0.35).addScaledVector(fwd, back * 1.6));
    camera.near = Math.max(0.05, camAlt * 0.01); camera.far = camAlt + R_EARTH * 3 + 100000; camera.updateProjectionMatrix();
    earthMat.uniforms.lightK.value = 0.6;
  }
  const _v = new THREE.Vector3(), _c = new THREE.Vector3();
  /** Screen position of a lat/lng, or null when on the far side. */
  function project(lat, lng, w, h) {
    llToVec(lat, lng, R_EARTH, _v);
    _c.copy(camera.position).sub(_v);
    if (_c.dot(_v) <= 0) return null;
    _v.project(camera);
    if (_v.z > 1) return null;
    return { x: (_v.x * 0.5 + 0.5) * w, y: (-_v.y * 0.5 + 0.5) * h };
  }
  function resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function dispose() {
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { for (const k of ['map', 'day', 'night']) { const t = o.material[k] || (o.material.uniforms && o.material.uniforms[k] && o.material.uniforms[k].value); if (t && t.dispose) t.dispose(); } o.material.dispose(); } });
  }
  applyCam();
  const api = { chaseOn: false, chase, scene, camera, state, goal, update, drag, zoom, flyTo, jump, setFlights, setRoute, setPlane, project, resize, dispose, get busy() { return !!tween; } };
  return api;
}
