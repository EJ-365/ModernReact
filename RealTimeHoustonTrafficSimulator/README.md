# Live Traffic Simulator

**Created by Ejay Gabriel**

Award-ready **3D live city traffic simulator** with a full marketing website, Progressive Web App install, Windows desktop package, and developer documentation.

**Sixteen metros live today** — Houston, Austin, San Antonio, Dallas–Fort Worth, Los Angeles, New York, Boston, Chicago, Miami, Seattle, Denver, Atlanta, Phoenix, Philadelphia, Minneapolis–St. Paul, and New Orleans — each with local freeways, weather, flights, and landmarks.

The project is **updated often** with **continuous integration** (GitHub Actions on every push/PR): install, verify surfaces, production build, and Windows package artifacts on main.

---

## Quick start

```bash
cd RealTimeHoustonTrafficSimulator
npm install
npm run dev
```

| URL | What you get |
|-----|----------------|
| [http://localhost:5176/](http://localhost:5176/) | Marketing site (Home · About · Download · Docs) |
| [http://localhost:5176/app.html](http://localhost:5176/app.html) | Full 3D simulator |
| [http://localhost:5176/download.html](http://localhost:5176/download.html) | Web install + Windows download |
| [http://localhost:5176/docs/](http://localhost:5176/docs/) | Developer handbook |

**Latest progress:** [docs/PROGRESS.md](docs/PROGRESS.md) — v10.17.0  
**Platform transition:** [docs/TECH_TRANSITION.md](docs/TECH_TRANSITION.md) — Vite + city packs + feed adapters (cities after platform).

---

## Website

- **Home** — hero, features, **multi-city roadmap**, live-data story, CTAs  
- **About** — creator page for **Ejay Gabriel** + city expansion vision  
- **Download** — Chrome/Edge **web app install** + **Windows standalone zip**  
- **Docs** — getting started, architecture, API keys, desktop packaging, contributing  

Visual language: deep navy, teal, sun, and coral — flexible, cute, and mobile-ready.

### City roadmap

| City | Status |
|------|--------|
| Houston, Austin, San Antonio, Dallas–Fort Worth | Live |
| Los Angeles, New York, Boston, Chicago | Live |
| Miami, Seattle, Denver, Atlanta | Live |
| Phoenix, Philadelphia, Minneapolis–St. Paul, New Orleans | Live |

---

## Continuous integration & updates

This software ships on a continuous cadence.

| Pipeline | What runs |
|----------|-----------|
| Pull requests & pushes | `npm ci` · page checks · `npm run build` · upload `dist/` |
| Pushes to `main` / `master` | Also packages `HoustonTrafficSimulator-Setup-win-x64.zip` |

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml) · Docs: [`docs/ci.html`](docs/ci.html)

Local parity:

```bash
npm run ci              # npm ci && npm run build
npm run package:win     # optional desktop zip
```

---

## Install options

### 1. Web app (recommended)
Open the site in Chrome or Edge → **Install web app** on the Download page (or the browser’s Install menu). Works on Windows, macOS, ChromeOS, and Android.

### 2. Windows desktop zip
```bash
npm run build
npm run package:win
```
Produces `downloads/HoustonTrafficSimulator-Setup-win-x64.zip` (linked from the Download page).

### 3. From source
```bash
npm run dev          # development
npm run build        # static site → dist/
npm run preview      # preview production build
```

---

## Deploy

```bash
npm run build          # output → dist/
```

Deploy the **`dist/`** folder (or connect the repo to Netlify / Vercel; configs are in `netlify.toml` and `vercel.json`).

| Ready | Notes |
|------|--------|
| Marketing site + PWA | Yes |
| First visit tour in simulator | Yes (`localStorage` key `liveTrafficSim.tour.v4.<city>`) |
| Public live feeds (weather, traffic, news, ADS-B) | Netlify/Vercel proxies + public sources |
| Aircraft tracking (airplanes.live) | Yes — free, open-source ADS-B |
| TomTom traffic | **Disabled** — do not set `TOMTOM_API_KEY` |
| Secrets | Keep `.env.local` local; never commit |

### Netlify env

1. Netlify → Site configuration → Environment variables  
2. **Delete** `TOMTOM_API_KEY` if present  
3. Redeploy when you push the free-feeds release 

Replay the tour anytime from **Replay tour** (desktop cam hint or mobile Controls).

---

## Live data

| Feature | Source | Key required? |
|---------|--------|---------------|
| Weather / forecast | Open-Meteo | No |
| Traffic incidents | Houston TranStar RSS | No |
| Aircraft | airplanes.live / OpenSky / ADS-B | No (rate limits) |
| Aircraft tracking links | globe.airplanes.live | No |
| Airport boards | Reconstructed from live ADS-B flights | No |
| Local news | Google News RSS by active metro | No |
| Flow speeds | Houston TranStar / modeled elsewhere | No |

Copy `.env.example` → `.env.local` for optional keys. **Never commit secrets.**

---

## Project layout

```
├── index.html / about.html / download.html   # Marketing
├── app.html                                  # 3D simulator
├── public/site/                              # Site CSS/JS
├── public/manifest.webmanifest + sw.js       # PWA
├── docs/                                     # Developer docs (HTML)
├── downloads/                                # Desktop zip output
├── scripts/package-win.mjs                   # Windows packager
└── vite.config.js                            # MPA build + API proxies
```

---

## Documentation

- [Getting started](docs/getting-started.html)
- [Architecture](docs/architecture.html)
- [API keys](docs/api-keys.html)
- [Desktop packaging](docs/desktop.html)
- [Contributing](docs/contributing.html)

When the Vite server is running, the same pages are at `/docs/`.

---

## Hazard predictions

Educational overlays (not official alerts): hurricane, wildfire, **certain flood corridors**, and **yield-scaled nuclear drill rings** (1 kt → 1 Mt).

---

## Credits

**Created by Ejay Gabriel.**  
Three.js · Vite · Open-Meteo · Houston TranStar · Google News RSS · OSM · airplanes.live / free ADS-B.

---

## License

Private project unless otherwise stated by the author. Contact Ejay Gabriel for distribution terms.
