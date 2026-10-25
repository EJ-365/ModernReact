import * as THREE from 'three';
/* Sharp close-up imagery on the globe: free Sentinel-2 cloudless tiles (EOX, CC BY 4.0, 2016 mosaic) on a curved patch under the camera. */
const TILE = (z, x, y) => `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/${z}/${y}/${x}.jpg`;
const lon2x = (lng, z) => (lng + 180) / 360 * 2 ** z;
const lat2y = (lat, z) => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z; };
const y2lat = (y, z) => 180 / Math.PI * Math.atan(Math.sinh(Math.PI - 2 * Math.PI * y / 2 ** z));
export function createTilePatch({ scene, R, llToVec, sunDir }) {
  const N = 6, TS = 256, SEG = 48;
  const cv = document.createElement('canvas'); cv.width = cv.height = N * TS; const g2 = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const V = (SEG + 1) * (SEG + 1), pos = new Float32Array(V * 3), uv = new Float32Array(V * 2), idx = [];
  for (let j = 0; j < SEG; j++) for (let i = 0; i < SEG; i++) { const a = j * (SEG + 1) + i; idx.push(a, a + SEG + 1, a + 1, a + 1, a + SEG + 1, a + SEG + 2); }
  for (let j = 0; j <= SEG; j++) for (let i = 0; i <= SEG; i++) { const k = j * (SEG + 1) + i; uv[k * 2] = i / SEG; uv[k * 2 + 1] = 1 - j / SEG; }
  const geo = new THREE.BufferGeometry(); geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, sunDir: { value: sunDir }, op: { value: 0 } }, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
    vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 sunDir; uniform float op; varying vec2 vUv; varying vec3 vN;
      void main(){ vec3 col=texture2D(map,vUv).rgb; float d=dot(normalize(vN),sunDir); float dayK=smoothstep(-0.10,0.16,d);
        vec3 c=mix(col*0.03,col*(0.10+0.95*max(d,0.0)),dayK);
        vec2 e=min(vUv,1.0-vUv); float a=op*smoothstep(0.0,0.12,min(e.x,e.y));
        gl_FragColor=vec4(c,a);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 1; mesh.visible = false; scene.add(mesh);
  const cache = new Map(); let key = '', gen = 0, ready = false;
  const _v = new THREE.Vector3();
  function tile(z, x, y) {
    const k = z + '/' + x + '/' + y; let p = cache.get(k);
    if (!p) {
      p = new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = TILE(z, x, y); });
      cache.set(k, p); if (cache.size > 360) cache.delete(cache.keys().next().value);
    }
    return p;
  }
  function build(z, x0, y0, alt) {
    const n = 2 ** z, r = R + Math.min(0.05, alt * 0.00002);
    for (let j = 0; j <= SEG; j++) {
      const lat = y2lat(y0 + N * j / SEG, z);
      for (let i = 0; i <= SEG; i++) { const lng = (x0 + N * i / SEG) / n * 360 - 180; llToVec(lat, lng, r, _v); _v.toArray(pos, (j * (SEG + 1) + i) * 3); }
    }
    geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
  }
  function update(lat, lng, alt) {
    const op = mat.uniforms.op;
    if (alt > 2400 || Math.abs(lat) > 78) { op.value = Math.max(0, op.value - 0.06); mesh.visible = op.value > 0; return; }
    const z = Math.max(3, Math.min(13, Math.round(Math.log2(40075 * Math.cos(lat * Math.PI / 180) * 2.2 / Math.max(1, alt)))));
    const n = 2 ** z, x0 = Math.floor(lon2x(lng, z)) - N / 2 + 1, y0 = Math.max(0, Math.min(n - N, Math.floor(lat2y(lat, z)) - N / 2 + 1));
    const k = z + '/' + x0 + '/' + y0;
    if (k !== key) {
      key = k; const my = ++gen;
      const jobs = [];
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) jobs.push(tile(z, ((x0 + i) % n + n) % n, y0 + j).then((im) => [i, j, im]));
      Promise.all(jobs).then((L) => {
        if (my !== gen) return;
        if (L.filter((q) => q[2]).length < N * N * 0.5) return; /* tiles service unavailable: keep the NASA globe */
        g2.fillStyle = '#21324a'; g2.fillRect(0, 0, cv.width, cv.height);
        for (const [i, j, im] of L) if (im) g2.drawImage(im, i * TS, j * TS, TS, TS);
        tex.needsUpdate = true; build(z, x0, y0, alt); ready = true;
      });
    }
    if (ready) { op.value = Math.min(1, op.value + 0.08); mesh.visible = true; }
  }
  return { update };
}
