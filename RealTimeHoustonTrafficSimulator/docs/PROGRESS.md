# Progress log — Live Traffic Simulator

**Author:** Ejay Gabriel  
**Current build:** **v10.17.0** (2026-08-31) — multi-city live-data and road-fidelity release
**SW cache:** `hts-shell-v147`

This log captures the work from the late **v10.8.x / v10.9** baseline through the current **v10.17.0** multi-city release.

---

## Goals for this stretch

1. Restore **stable vehicle motion** (v10.8.6 feel — no teleport / grass clumps).
2. Keep **real Houston roads** (OSM freeways + streamed suburb asphalt).
3. Make **time, live feeds, and UI** stay in sync and efficient.
4. Fix misleading **hotspot rings** and **suburb→downtown ETAs**.

---

## Version highlights

| Version | Focus |
|---------|--------|
| **v10.8.6** | Traffic polling off the RAF loop (3‑min timer) — reference for vehicle motion |
| **v10.9.0** | Road data management / OSM pipeline (committed baseline) |
| **v10.14–10.15** | Live vs time-lapse traffic, flight boards, suburb GPS weather, cul-de-sac cull |
| **v10.16.0** | Restore v10.8.6 vehicle motion; OSM corridor stitch for freeways |
| **v10.16.2** | Clock/weekend sync, fresher polls, building spatial grid, rain/OSM perf |
| **v10.16.3** | Hotspot rings only when traffic is actually heavy (no fake overnight “rush”) |
| **v10.16.4** | Suburb→downtown ETA sanity (Sugar Land never shows impossible 13 min) |
| **v10.16.5** | Full weather report (brief + 12-hour strip) before deeper migrate |
| **v10.16.6** | Weather report leads with live NWS warnings (tornado/hurricane/heat/etc.) |
| **v10.16.7** | Phase 2: Vite Three 0.185 + TranStar adapter (map/RSS/apply/index) |
| **v10.16.8** | Phase 3: Austin manifest + city registry (`?city=austin`); Houston still default |
| **v10.16.9** | Austin researched pack: roads, jumps, airports, weather, TomTom-only traffic |
| **v10.17.0** | Live Traffic Simulator rebrand; free local Google News RSS; airplanes.live tracking; reconstructed metro airport boards; OSM freeway/ramp boot for Houston; interactive highway and refreshed onboarding UI |

---

## What shipped

### Vehicles (v10.16.0)

- Restored **v10.8.6-style** move loop: lane lerp, simple wrap/re-enter, soft building push.
- Removed off-screen teleport respawns that caused one-frame glitches.
- **Suburb cul-de-sac cars disabled** — OSM still draws real local streets; cars stay on freeways/arterials.

### Roads (v10.16.0–v10.17.0)

- Stitched OSM freeway fragments → `public/data/roads-corridors.json` / `.js`.
- Applied to I-10, I-45, I-610, US-59, US-290, Beltway 8, TX-99, SH-288, and related corridors.
- Script: `npm run roads:stitch` (also part of `roads:build`).
- v10.17 enables the quality-checked OSM freeway/ramp boot set; individual paths with excessive reversals or duplicate points are rejected before Three.js mesh generation.

### Multi-city live data (v10.17.0)

- Airport boards reconstruct arrivals and departures from active free ADS-B flights for each city pack's airport set.
- Flight cards and board rows link to `globe.airplanes.live` for direct aircraft/callsign tracking.
- Local-news panels use free Google News RSS through same-origin `/api/news` proxies on Vite, Netlify, and Vercel; unavailable upstreams show an offline state without blocking the app.
- The v4 onboarding tour introduces local news, interactive highways, traffic context, flights, and multi-city switching.

### Time sync & live freshness (v10.16.2)

- America/Chicago clock **cached**; weekend/date follow the **same** live or time-lapse instant.
- On tab focus: refresh weather + TranStar/TomTom/NWS.
- Polls tightened (~45s flow, ~40s incidents); TomTom corridor ETAs parallelized.
- Building hit-tests use a **spatial grid**; rain streaks stride when light.

### Hotspot rings (v10.16.3)

- Removed demand **floor** that lit rings at 4 AM.
- Rings use live mph with a free-flow deadband; overnight needs a real crawl.
- TranStar road congestion uses **median** sample mph (not skewed sums).

### Drive-time chips (v10.16.4)

- Physics floor: minutes ≥ `miles ÷ ~62 mph` for downtown trips.
- **Sugar Land:** 22 mi · usually ~30 min · min 22 min; TranStar BW8→DT stub gets **+8 min** pad into town.
- Same sanity for Katy, Cypress, Woodlands, Pearland, Baytown, Kingwood, Richmond.

---

## Live data (still in play)

| Feed | Role |
|------|------|
| Houston TranStar RSS | Freeway travel times, incidents, closures |
| Google News RSS | Metro-specific local headlines (free) |
| Open-Meteo | Weather + forecast for time-lapse |
| NWS | Regional alerts |
| airplanes.live / OpenSky | Aircraft tracking (free ADS-B)

No commercial API keys are required. TomTom is intentionally disabled; TranStar agency JSON URLs remain optional for Houston segment-speed experiments.

---

## How to verify

```bash
cd RealTimeHoustonTrafficSimulator
npm install
npm run test
npm run build
npm run dev
```

Open `http://localhost:5176/app.html`, hard-refresh, confirm console:

`build v10.17.0`

Checks:

- Overnight / early morning → few or no orange hotspot rings.
- Sugar Land → Downtown chip → **not** under ~22 minutes.
- Vehicles stay on asphalt; no rectangular grass clumps.
- LIVE vs time-lapse: clock, weekend label, and weather stay consistent.
- Weather card → **NWS weather alerts** opens live warnings only (no duplicate conditions).

---

## Multi-city migration (next)

Houston stays the production city. Planned metros (LA, NYC, Austin, San Antonio, Boston, …) should reuse:

- Corridor stitch + sanity ETA pattern  
- Live vs time-lapse clock model  
- Vehicle motion kernel from v10.8.6 / v10.16  
- OSM LOD visual layer without cul-de-sac car spam  

Keep Houston’s TranStar-specific mapping behind a city adapter so other metros plug in local feeds cleanly.

---

## Key files

| Path | Notes |
|------|--------|
| `app.html` | Main simulator |
| `src/rain.js` / `src/rain-bridge.js` | Rain system |
| `public/data/roads-corridors.*` | Stitched Houston freeways |
| `scripts/stitch-houston-corridors.mjs` | Corridor stitcher |
| `public/sw.js` | PWA shell cache version |
| `api/` | Vercel/Netlify-style proxies (TomTom) |

---

*Updated 2026-08-31 for the v10.17.0 Live Traffic Simulator release.*
