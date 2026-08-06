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
          /* TomTom — hard-disabled (billing). Free TranStar / modeled traffic only. */
          server.middlewares.use("/api/tomtom", async (_req, res) => {
            res.statusCode = 503;
            res.setHeader("content-type", "application/json");
            res.setHeader("cache-control", "no-store");
            res.end(JSON.stringify({
              error: "tomtom_disabled",
              hint: "TomTom is turned off. Traffic uses free TranStar RSS / modeled flow only.",
            }));
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

          /* FlightAware AeroAPI — hard-disabled (billing). Free ADS-B/OpenSky only. */
          server.middlewares.use("/api/flightaware", async (_req, res) => {
            res.statusCode = 503;
            res.setHeader("content-type", "application/json");
            res.setHeader("cache-control", "no-store");
            res.end(JSON.stringify({
              error: "flightaware_disabled",
              hint: "FlightAware AeroAPI is turned off. Sky uses free OpenSky / ADS-B only.",
            }));
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
        "/api/nws": {
          target: "https://api.weather.gov",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nws/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader(
                "User-Agent",
                "HoustonTrafficSimulator/1.0 (edu; github.com/EJ-365/ModernReact)",
              );
              proxyReq.setHeader("Accept", "application/geo+json");
            });
          },
        },
        "/api/nhc": {
          target: "https://www.nhc.noaa.gov",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/nhc/, ""),
        },
        "/api/spc": {
          target: "https://mapservices.weather.noaa.gov",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/spc/, ""),
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
