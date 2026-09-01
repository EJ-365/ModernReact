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

          server.middlewares.use("/api/news", async (req, res) => {
            try {
              const city = String(new URL(req.url || "/", "http://local").searchParams.get("city") || "Houston").slice(0, 80);
              const target = new URL("https://news.google.com/rss/search");
              target.searchParams.set("q", `${city} local news when:1d`);
              target.searchParams.set("hl", "en-US"); target.searchParams.set("gl", "US"); target.searchParams.set("ceid", "US:en");
              const upstream = await fetch(target, { headers: { accept: "application/rss+xml", "user-agent": "TrafficSimulator/1.0" } });
              const xml = await upstream.text();
              const decode = (value = "") => String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">" ).replace(/&quot;/g, '"').replace(/&#39;/g, "'");
              const tag = (item, name) => decode(item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"))?.[1] || "").trim();
              const articles = upstream.ok ? [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 6).map((match) => ({ title: tag(match[1], "title"), url: tag(match[1], "link"), domain: tag(match[1], "source"), published: tag(match[1], "pubDate") })).filter((item) => item.title && item.url) : [];
              res.statusCode = upstream.ok ? 200 : 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify(upstream.ok ? { articles } : { error: "news_unavailable" }));
            } catch {
              res.statusCode = 502;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: "news_unavailable" }));
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
