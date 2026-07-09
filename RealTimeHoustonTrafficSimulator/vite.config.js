import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    appType: "mpa",
    plugins: [
      {
        name: "tomtom-proxy",
        configureServer(server) {
          server.middlewares.use("/api/tomtom", async (req, res) => {
            try {
              const key = env.TOMTOM_API_KEY || process.env.TOMTOM_API_KEY;
              if (!key) {
                res.statusCode = 500;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({ error: "TOMTOM_API_KEY missing" }));
                return;
              }
              const url = new URL(req.url || "/", "http://local");
              const targetPath = url.pathname.replace(/^\/+/, "");
              const target = new URL(`https://api.tomtom.com/${targetPath}`);
              url.searchParams.forEach((v, k) => target.searchParams.set(k, v));
              if (!target.searchParams.has("key")) target.searchParams.set("key", key);

              const upstream = await fetch(target.toString(), {
                method: req.method || "GET",
                headers: { accept: req.headers.accept || "*/*" },
              });
              res.statusCode = upstream.status;
              res.setHeader(
                "content-type",
                upstream.headers.get("content-type") || "application/json",
              );
              res.end(await upstream.text());
            } catch {
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "tomtom_proxy_failed" }));
            }
          });

          server.middlewares.use("/api/transtar", async (req, res) => {
            try {
              const url = new URL(req.url || "/", "http://local");
              const path = url.pathname.replace(/^\/+/, "");
              let target;
              if (path === "speed.json" && (env.TRANSTAR_SPEED_URL || process.env.TRANSTAR_SPEED_URL)) {
                target = new URL(env.TRANSTAR_SPEED_URL || process.env.TRANSTAR_SPEED_URL);
              } else if (path === "incidents.json" && (env.TRANSTAR_INCIDENT_URL || process.env.TRANSTAR_INCIDENT_URL)) {
                target = new URL(env.TRANSTAR_INCIDENT_URL || process.env.TRANSTAR_INCIDENT_URL);
              } else if (path === "closures.json" && (env.TRANSTAR_CLOSURE_URL || process.env.TRANSTAR_CLOSURE_URL)) {
                target = new URL(env.TRANSTAR_CLOSURE_URL || process.env.TRANSTAR_CLOSURE_URL);
              } else {
                target = new URL(`https://traffic.houstontranstar.org/${path}`);
              }
              url.searchParams.forEach((v, k) => target.searchParams.set(k, v));
              const upstream = await fetch(target.toString(), {
                method: "GET",
                headers: {
                  accept: req.headers.accept || "*/*",
                  "user-agent": "HoustonTrafficSimulator/1.0",
                },
              });
              res.statusCode = upstream.status;
              res.setHeader(
                "content-type",
                upstream.headers.get("content-type") || "application/xml",
              );
              res.setHeader("cache-control", "no-store");
              res.end(await upstream.text());
            } catch {
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "transtar_proxy_failed" }));
            }
          });

          /* Path form: /api/flightaware/aeroapi/...  (also accepts legacy ?path=) */
          server.middlewares.use("/api/flightaware", async (req, res) => {
            try {
              const key = env.FLIGHTAWARE_API_KEY || process.env.FLIGHTAWARE_API_KEY;
              if (!key) {
                res.statusCode = 500;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({
                  error: "FLIGHTAWARE_API_KEY_missing",
                  hint: "Set FLIGHTAWARE_API_KEY in .env.local",
                }));
                return;
              }
              const url = new URL(req.url || "/", "http://local");
              let aeroPath = url.searchParams.get("path") || url.pathname.replace(/^\/+/, "");
              aeroPath = String(aeroPath).replace(/^\/+/, "")
                .replace(/^api\/flightaware\/?/i, "")
                .replace(/^flightaware\/?/i, "");
              if (!aeroPath.startsWith("aeroapi")) {
                res.statusCode = 400;
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify({
                  error: "missing_upstream_path",
                  hint: "Use /api/flightaware/aeroapi/airports/KIAH/flights/departures",
                  debug: { pathname: url.pathname, aeroPath },
                }));
                return;
              }
              const target = new URL(`https://aeroapi.flightaware.com/${aeroPath}`);
              url.searchParams.forEach((v, k) => {
                if (k !== "path") target.searchParams.set(k, v);
              });
              if (!target.searchParams.has("max_pages")) target.searchParams.set("max_pages", "1");
              const upstream = await fetch(target.toString(), {
                method: "GET",
                headers: {
                  accept: req.headers.accept || "application/json,*/*",
                  "x-apikey": key,
                  "user-agent": "HoustonTrafficSimulator/1.0 (local)",
                },
              });
              res.statusCode = upstream.status;
              res.setHeader(
                "content-type",
                upstream.headers.get("content-type") || "application/json",
              );
              res.end(await upstream.text());
            } catch {
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "flightaware_proxy_failed" }));
            }
          });
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          about: resolve(__dirname, "about.html"),
          download: resolve(__dirname, "download.html"),
          app: resolve(__dirname, "app.html"),
          docs: resolve(__dirname, "docs/index.html"),
          docsStart: resolve(__dirname, "docs/getting-started.html"),
          docsArch: resolve(__dirname, "docs/architecture.html"),
          docsKeys: resolve(__dirname, "docs/api-keys.html"),
          docsDesktop: resolve(__dirname, "docs/desktop.html"),
          docsContrib: resolve(__dirname, "docs/contributing.html"),
          docsCi: resolve(__dirname, "docs/ci.html"),
        },
      },
    },
    server: {
      proxy: {
        "/api/openmeteo": {
          target: "https://api.open-meteo.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openmeteo/, ""),
        },
        "/api/nominatim": {
          target: "https://nominatim.openstreetmap.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nominatim/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader(
                "User-Agent",
                "HoustonTrafficSimulator/1.0 (local weather place labels)",
              );
              proxyReq.setHeader("Accept", "application/json");
            });
          },
        },
        "/api/opensky": {
          target: "https://opensky-network.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/opensky/, ""),
        },
        "/api/airplanes": {
          target: "https://api.airplanes.live",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/airplanes/, ""),
        },
        "/api/adsblol": {
          target: "https://api.adsb.lol",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/adsblol/, ""),
        },
        "/api/adsbdb": {
          target: "https://api.adsbdb.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/adsbdb/, ""),
        },
        "/api/hexdb": {
          target: "https://hexdb.io",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hexdb/, ""),
        },
      },
    },
  };
});
