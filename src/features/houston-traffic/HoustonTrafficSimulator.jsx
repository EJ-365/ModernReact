import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function useAnimationFrame(callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      cbRef.current(dt, now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}

function formatClock(d) {
  return d.toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function fetchHoustonWeather() {
  const url =
    "/api/openmeteo/v1/forecast?latitude=29.7604&longitude=-95.3698" +
    "&current=temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,relative_humidity_2m" +
    "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago";
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`weather ${r.status}`);
  const j = await r.json();
  return j?.current ?? null;
}

async function fetchOpenSkyAroundHouston() {
  // Houston-ish bounding box. OpenSky may throttle; proxy keeps this same-origin.
  const lamin = 28.7;
  const lamax = 30.6;
  const lomin = -96.6;
  const lomax = -94.3;
  const url = `/api/opensky/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`opensky ${r.status}`);
  const j = await r.json();
  return Array.isArray(j?.states) ? j.states : [];
}

function wmoLabel(code) {
  // minimal labels for UI
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Drizzle / rain";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Severe storm";
  return "—";
}

export default function HoustonTrafficSimulator() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [weather, setWeather] = useState(null);
  const [wxErr, setWxErr] = useState(null);
  const [flights, setFlights] = useState([]);
  const [flightErr, setFlightErr] = useState(null);

  const palette = useMemo(
    () => ({
      panel: "rgba(16, 20, 26, 0.94)",
      panelLine: "rgba(42, 50, 64, 1)",
      ink: "#f2f4ef",
      dim: "#98a2ad",
      green: "#00693e",
      amber: "#ffb400",
    }),
    [],
  );

  useEffect(() => {
    const t = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const c = await fetchHoustonWeather();
        if (!cancelled) {
          setWeather(c);
          setWxErr(null);
        }
      } catch (e) {
        if (!cancelled) setWxErr(String(e?.message ?? e));
      }
    };
    run();
    const t = setInterval(run, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const states = await fetchOpenSkyAroundHouston();
        if (cancelled) return;
        // OpenSky state vector fields:
        // [0]icao24 [1]callsign [2]origin_country [5]lon [6]lat [7]baro_alt(m) [9]vel(m/s) [10]true_track
        const items = states
          .map((s) => ({
            icao24: s?.[0],
            callsign: String(s?.[1] ?? "").trim(),
            country: s?.[2],
            lon: s?.[5],
            lat: s?.[6],
            altM: s?.[7],
            vel: s?.[9],
            track: s?.[10],
          }))
          .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon))
          .slice(0, 18);
        setFlights(items);
        setFlightErr(null);
      } catch (e) {
        if (!cancelled) setFlightErr(String(e?.message ?? e));
      }
    };
    run();
    const t = setInterval(run, 15 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x05070c, 1);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0f18, 140, 2300);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      5000,
    );
    camera.position.set(-260, 220, 340);

    const hemi = new THREE.HemisphereLight(0xbcd6ff, 0x33291d, 0.95);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(-3, 5, 2);
    scene.add(sun);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(5000, 5000),
      new THREE.MeshLambertMaterial({ color: 0x22311f }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // A simple “loop freeway” ribbon.
    const loop = new THREE.Mesh(
      new THREE.RingGeometry(220, 250, 64),
      new THREE.MeshLambertMaterial({ color: 0x2f343b }),
    );
    loop.rotation.x = -Math.PI / 2;
    loop.position.y = 0.06;
    scene.add(loop);

    // Cars (instanced boxes).
    const carCount = 240;
    const carGeo = new THREE.BoxGeometry(6, 2.2, 3);
    const carMat = new THREE.MeshLambertMaterial({ color: 0xe8e8ea });
    const cars = new THREE.InstancedMesh(carGeo, carMat, carCount);
    cars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(cars);

    const dummy = new THREE.Object3D();
    const speeds = new Float32Array(carCount);
    const angles = new Float32Array(carCount);
    for (let i = 0; i < carCount; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.4 + Math.random() * 1.6;
    }

    // Simple orbit controls (minimal: drag rotates, wheel zoom).
    let isDown = false;
    let lastX = 0;
    let lastY = 0;
    let theta = -0.8;
    let phi = 0.85;
    let radius = 520;
    const target = new THREE.Vector3(0, 0, 0);

    const applyCam = () => {
      const sp = Math.sin(phi);
      const y = Math.cos(phi);
      camera.position.set(
        target.x + radius * sp * Math.sin(theta),
        target.y + radius * y,
        target.z + radius * sp * Math.cos(theta),
      );
      camera.lookAt(target);
    };
    applyCam();

    const onDown = (e) => {
      isDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      isDown = false;
    };
    const onMove = (e) => {
      if (!isDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      theta -= dx * 0.005;
      phi = clamp(phi - dy * 0.004, 0.12, 1.45);
      applyCam();
    };
    const onWheel = (e) => {
      e.preventDefault();
      radius = clamp(radius * Math.pow(1.0016, e.deltaY), 180, 1500);
      applyCam();
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let accT = 0;
    const animate = (dt) => {
      accT += dt;
      for (let i = 0; i < carCount; i++) {
        const congest = 0.35 + 0.25 * Math.sin(accT * 0.35 + i * 0.12);
        const v = speeds[i] * (1 - 0.65 * congest);
        angles[i] += v * dt * 0.55;
        const a = angles[i];
        const r = 235 + 5 * Math.sin(i * 0.8);
        dummy.position.set(Math.cos(a) * r, 1.1, Math.sin(a) * r);
        dummy.rotation.set(0, -a + Math.PI / 2, 0);
        dummy.updateMatrix();
        cars.setMatrixAt(i, dummy.matrix);
      }
      cars.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    let raf = 0;
    let last = performance.now();
    const loopFn = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      animate(dt);
      raf = requestAnimationFrame(loopFn);
    };
    raf = requestAnimationFrame(loopFn);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("wheel", onWheel);

      mount.removeChild(renderer.domElement);
      renderer.dispose();
      carGeo.dispose();
      carMat.dispose();
      ground.geometry.dispose();
      ground.material.dispose();
      loop.geometry.dispose();
      loop.material.dispose();
    };
  }, []);

  useAnimationFrame(() => {
    // keep react renders minimal; actual rendering is imperative inside three loop
  });

  const wx = weather
    ? {
        temp: Math.round(weather.temperature_2m),
        feels: Math.round(weather.apparent_temperature),
        hum: Math.round(weather.relative_humidity_2m),
        wind: Math.round(weather.wind_speed_10m),
        code: weather.weather_code,
        precip: Number(weather.precipitation ?? 0),
        cloud: Math.round((weather.cloud_cover ?? 0) * 1),
      }
    : null;

  return (
    <div className="h-full w-full">
      <div ref={mountRef} className="fixed inset-0" />

      <div
        className="fixed left-4 top-4 z-10 w-[min(340px,calc(100vw-32px))] rounded-2xl border p-4 shadow-2xl"
        style={{
          background: palette.panel,
          borderColor: palette.panelLine,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/60">
          SPACE CITY · LIVE (FOUNDATION)
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <div className="text-lg font-black tracking-wide">
            Houston Traffic Simulator
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black tracking-[0.12em] text-emerald-200">
            v-next
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="font-mono text-3xl font-bold">{clock}</div>
          <a
            href="/"
            className="text-xs font-bold text-white/60 hover:text-white"
          >
            Back
          </a>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="text-[10px] font-extrabold tracking-[0.18em] text-white/60">
            WEATHER (OPEN-METEO)
          </div>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold">
                {wx ? `${wx.temp}°` : "—"}
              </div>
              <div className="text-xs font-bold text-white/70">
                {wx ? wmoLabel(wx.code) : "Connecting…"}
              </div>
              <div className="mt-1 text-[11px] text-white/60">
                feels like {wx ? `${wx.feels}°` : "—"}
              </div>
            </div>
            <div className="text-right text-[11px] text-white/70">
              <div>
                <span className="text-white/50">Humidity</span>{" "}
                <span className="font-mono font-bold">{wx ? `${wx.hum}%` : "—"}</span>
              </div>
              <div>
                <span className="text-white/50">Wind</span>{" "}
                <span className="font-mono font-bold">
                  {wx ? `${wx.wind} mph` : "—"}
                </span>
              </div>
              <div>
                <span className="text-white/50">Precip/hr</span>{" "}
                <span className="font-mono font-bold">
                  {wx ? `${wx.precip.toFixed(2)}"` : "—"}
                </span>
              </div>
            </div>
          </div>
          {wxErr ? (
            <div className="mt-2 text-[11px] font-semibold text-amber-200">
              Weather fallback active: {wxErr}
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="text-[10px] font-extrabold tracking-[0.18em] text-white/60">
            LIVE FLIGHTS (OPENSKY · BEST-EFFORT)
          </div>
          {flightErr ? (
            <div className="mt-2 text-[11px] font-semibold text-amber-200">
              Flight feed unavailable: {flightErr}
            </div>
          ) : null}
          <div className="mt-2 space-y-2">
            {flights.length ? (
              flights.map((f) => (
                <div
                  key={f.icao24}
                  className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-1 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[12px] font-bold text-white/90">
                      {f.callsign || f.icao24}
                    </div>
                    <div className="truncate text-[11px] text-white/55">
                      {f.country || "—"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-[11px] font-bold text-white/70">
                    {Number.isFinite(f.altM)
                      ? `${Math.round(f.altM * 3.28084).toLocaleString("en-US")} ft`
                      : "—"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-white/60">Loading…</div>
            )}
          </div>
        </div>

        <div className="mt-4 text-[11px] leading-relaxed text-white/55">
          Real TxDOT traffic + richer flight data usually require API keys.
          This build is set up so you can add them without exposing secrets by
          routing calls through `/api/*`.
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-10 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/70 backdrop-blur">
        drag: rotate · scroll: zoom
      </div>
    </div>
  );
}

