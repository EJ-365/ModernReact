# Houston Traffic Simulator

**Created by Ejay Gabriel**

Award-ready **3D live city traffic simulator** with a full marketing website, Progressive Web App install, Windows desktop package, and developer documentation.

**Houston is live today.** More metros are on the roadmap — including **Los Angeles, New York, Austin, San Antonio, Boston**, and others — each with local freeways, weather, flights, and landmarks.

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

**Latest progress:** [docs/PROGRESS.md](docs/PROGRESS.md) — v10.16.4 (vehicles, OSM roads, sync, hotspots, ETAs).

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
| **Houston** | Live |
| Los Angeles | Coming soon |
| New York | Coming soon |
| Austin | Coming soon |
| San Antonio | Coming soon |
| Boston | Coming soon |
| More (DFW, Chicago, Miami, Seattle, …) | On the list |

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
| First visit tour in simulator | Yes (`localStorage` key `houstonSim.tour.v1`) |
| Public live feeds (weather, TranStar, ADS-B) | Netlify functions + Open-Meteo direct |
| FlightAware airport boards | Set `FLIGHTAWARE_API_KEY` in Netlify env, then redeploy |
| TomTom | Optional `TOMTOM_API_KEY` in Netlify env |
| Secrets | Keep `.env.local` local; never commit |

### Netlify env (required for boards)

1. Netlify → Site configuration → Environment variables  
2. Add `FLIGHTAWARE_API_KEY` = your AeroAPI key (same as `.env.local`)  
3. Redeploy  

Replay the tour anytime from **Replay tour** (desktop cam hint or mobile Controls).

---

## Live data

| Feature | Source | Key required? |
|---------|--------|---------------|
| Weather / forecast | Open-Meteo | No |
| Traffic incidents | Houston TranStar RSS | No |
| Aircraft | ADS-B / OpenSky | No (rate limits) |
| Airport boards | FlightAware AeroAPI | Optional |
| Flow speeds | TomTom Traffic | Optional |

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
Three.js · Vite · Open-Meteo · Houston TranStar · optional FlightAware & TomTom.

---

## License

Private project unless otherwise stated by the author. Contact Ejay Gabriel for distribution terms.
