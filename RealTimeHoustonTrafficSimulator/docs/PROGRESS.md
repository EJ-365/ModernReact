# Progress log — Live Traffic Simulator

**Author:** Ejay Gabriel  
**Current build:** **v10.53.0** — C-130 tail rebuilt; airliner parts share materials and gear is batched (default view 1,002 → 838 draw calls).
**SW cache:** `hts-shell-v155`

This log captures the work from the late **v10.8.x / v10.9** baseline through the current **v10.18.0** real-3D-city release.

## v10.53.0

- **C-130 tail:** the fin used to sit behind the end of the fuselage as a flat slab with a forward-leaning trailing edge. It now rises from the aft body with a dorsal fillet, a ~25° swept leading edge, a rounded tip, a near-vertical trailing edge and a rudder hinge line. The aft body keeps a level top line while the belly sweeps up to the ramp, and the tailplane (16 m span) sits at the fin root.
- **Speed:** airliner fin/winglets and both engine intakes share one material each, so `batchStaticChildren` merges them; the landing-gear group is batched too (it animates as a whole). Default Houston view: 1,002 → 838 draw calls, 1,264 → 656 geometries since v10.51.0.
- `?debug` now also exposes `HTS_DEBUG.makers` (aircraft constructors) for isolated model renders.

## v10.52.0

- **Sound:** measured the Web Audio output per vehicle. The car bed was much quieter than the aircraft and sat low in pitch (hard for laptop speakers to play); it is now −40 dBFS at idle / −34 dBFS flat-out with the growl moved up into the speaker range. Aircraft beds measure −36…−24 dBFS from idle to full power. The audio context also resumes on the next tap/key if a tour started it outside a click.
- **Speed:** each airliner (live flights, tour jet, parked jets) merged its ~60 static parts into one draw per material via `batchStaticChildren`; road work-zone cones/barriers share materials and merge (7 → 2 draws each). Default Houston view: 1,522 → 1,002 draw calls, 6,135 → 4,849 meshes.

## v10.51.0

- **Car dashboards:** the music player measures the left gauge cluster (`.dLeft`) and sits in the gap beside it, or just above it when the screen is too narrow; it re-places on window resize. Fixes the player covering the SUV/van screen and the pickup fuel/temp dials.
- **Speed:** `nearestWeatherZone` keeps a one-entry memo (repeat calls for the same spot within 1 s skip the zone scan).

## v10.50.0

- **Speed:** road deck `heightAt` (called per car per frame) uses numeric grid keys instead of string concatenation; place labels skip the DOM pass when the camera is still and read the canvas size once per frame (was a layout read per label); rain lookup memoised per 60 m / 1 s; freeway hotspot congestion cached 2 s instead of 0.5 s.

## v10.49.0

- **Aircraft paint:** Tour Houston aircraft now have a *Main* palette (whole airframe) and a separate *Accent* palette with a *None* swatch. The accent paints a fuselage cheat-line, tail fin, nose and engines (jet: fin, winglets, engines, cheat-line, nose crown; Cessna: cheat-line, wingtips, fin; helicopter: tail, nose cap, cabin/boom stripes; F-16: radome, fin, stabilators; C-130: nose, fin, nacelles, cheat-line). The choice is remembered.

## v10.48.0

- **Route planner → Drive it:** corridor tiles are released after the drive starts; live-traffic speed target refreshed twice a second instead of every frame.
- **ETA:** static drive-time table per route (limits, curves, cruise) + a live-traffic factor resampled every 3 s and eased; computed at most 4×/s; resets on route change.
- **Car dashboards:** sedan twin dials, SUV/van digital screens, pickup rugged dials with fuel/temp + 4WD, coupe sport tach; dashboard height follows screen width so laptops no longer crop it.
- **Aircraft:** optional *Taxi to park* after landing (nearest OSM apron), runway designators from OSM refs (e.g. 15L), centreline and green threshold lights, brighter edge lights; Cessna panel re-spaced below the glare shield; helicopter nose (frames, chin bubbles, landing light, pitot); helicopter panel re-spaced.
- **Tour panel:** "Aircraft" label for aircraft, more accent colours for cars and planes; locate-me button re-placed after the side panel finishes sliding.
- **Music:** 65 dead YouTube IDs removed, 66 verified tracks added (Afrobeats, gospel, pop, hip-hop/rap, new Country genre).

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
| **v10.47.1** | About and Docs pages rewritten for the Houston-only release: current nav/footer, what's inside, Tour Houston (cars, five aircraft, cockpits, sound, gear), open-data note, v10.47 update list and src/ project map; doc titles renamed to Houston Traffic Simulation; download page nav fixed. |
| **v10.47.0** | Aircraft: jet engines take the chosen colour; every model sits on its wheels/skids (no more sinking into runways — tour, live ADS-B, runway-cycle and parked planes); retractable gear animates (down on ground and ~5 nm out, up after ~200 ft). F-16: swept tail with rudder, tinted bubble canopy with seat, HUD and frame. New `src/cockpit-dash.js`: Cessna six-pack + tach, Bell 407 panel (NR/TRQ/MGT), airliner/C-130 EICAS with live N1/TRQ, EGT, fuel flow, gear lights, flaps, F-16 HUD + engine/HSD MFDs. Engine sound per type (car, piston prop, turboprop, heli rotor thump, jet cabin rumble + fan whine, fighter roar) driven by flight-phase power. Clicked building cards show a Wikipedia button from the nearest OSM wikipedia tag. |
| **v10.46.0** | Fly to district search: suggestion dropdown under the box (up to 10 matches, names starting with your text first, match highlighted, area shown on the right); click, or ↑/↓ + Enter, flies there; Esc closes. |
| **v10.45.0** | Car tour ETA smoothed (eases toward the live route/traffic estimate, resets on big route changes) so it counts down instead of jumping; cruise options add 100 mph. Tour aircraft: rebuilt helicopter (lathe-shaped cabin, tinted canopy, tapered boom, skids with cross tubes, 4-blade rotor, tail rotor), new F-16 fighter and C-130 Hercules (4 spinning props, retractable gear); both fly the jet profile and cockpit. Footer redesigned as a full-width band; homepage mobile layout fixes (single-column preview, tighter cards). |
| **v10.44.0** | Loading screen: bright orange fill replaced by the homepage's dark theme (near-black to deep umber) with a soft orange horizon glow behind a single-tone dark skyline. |
| **v10.43.0** | Jet landing gear shown whenever the aircraft is on the ground after landing (below 12 m, any phase except climb). Fly to district gets a search box (filters places as you type, Enter flies to the first match). Loading screen uses a light-only skyline (dark front layer removed); homepage keeps the layered art. Footer links 13 → 16 px. |
| **v10.42.0** | Homepage rebuilt as a product page: kicker + "All of Houston, live in 3D." headline, plain-English lede, stats strip (671 sq mi, 2.3M / 7.5M people, 14 airports, live feeds), four feature cards (Live traffic, Tour Houston, Route planner, Live flights), live map preview, 3-step How it works, Built on open data, Houston-only FAQ, centred CTA; nav = Features / Live map / How it works / FAQ. New dusk skyline art (sun glow, layered towers, bayou reflection) on the homepage and loading screen. Removed the dated Updates and Cities blocks. |
| **v10.41.0** | Owner's home lot cleared: the OSM building at 16623 Red Gully Dr is skipped (custom model replaces it), generated houses are kept 24 m away (keep-out now defined at startup, before land tiles stream — it used to be set only after the road network loaded), and when GPS puts you within 250 m of the house the stand-in bungalow is hidden and the single home pin sits on the modelled house. |
| **v10.40.0** | Locate-me no longer re-shows the generic pin when the home pin is present (one icon); home pin smaller and just above the roof. Plane colours: second off-white replaced by silver. Homepage: skyline inset with side margins and object-fit contain (same layered art as the loading screen); hero/intro/preview text sizes raised (lede 18–22 px, body 16–18 px). Street life: real-coordinate pedestrian hubs for downtown Main St, Discovery Green, the Galleria, Post Oak and the Waterwall; pool 820 → 1,100 people. |
| **v10.39.0** | 16623 Red Gully Dr model rebuilt: real hip-roof geometry (the old 4-sided cones were skewed into loose diagonal slabs), lower hip over the garage side, garage-bay hip, frieze board, porch + walk, fence tied to the house corners. Headlights: every moving car lights up at night (no longer dropped when FPS dips), ~30% run daytime running lights when zoomed in; ground beams still FPS/zoom gated. Compass rose rotated the wrong way (−theta); now +theta so N points to true north. |
| **v10.38.0** | Branding "Houston Traffic Simulation" (loading screen, nav, titles, hero); new two-layer Houston skyline (Williams Tower, Heritage Plaza, Wells Fargo Plaza, JPMorgan Chase Tower, Pennzoil Place, Bank of America Center, 609 Main, TC Energy Center); homepage peek switches to golden hour when it is dark in Houston; star field follows the camera (no giant dotted dome when zoomed out); jet colour paints fuselage, wings and tail; jet glass cockpit (PFD + EICAS + ND, clear windscreen); jet gear retracts at ~60 ft AGL on climb and extends ~5 nm / 2–3 min before touchdown (Cessna/heli fixed gear); plane HUD ETA now measures the same leg as "mi to go"; the Land-at airport is no longer replaced by the airport nearest the sightseeing stop, and the HUD selector stays in sync; OSM building hover hints "Click for directions" (card has Fly there / Directions). |
| **v10.37.0** | Stadium rebuilt: elliptical plan, grey-white fabric wings with the nrg stadium wordmark, central vaulted retractable roof panels, twin grey supertrusses running past both ends to pylons, glass end walls; label "Reliant Stadium (NRG)" (smaller). Tour: Helicopter option (Bell 407-class, spinning rotors); plane colour paints the whole Cessna/jet body; driver view hides the exterior model so SUV/pickup/van hoods never block the road; Radio (ATC) only in plane tours, Sound = engine. Greenery: three-lobe live-oak crowns with baked shading, deeper olive Houston greens for trees, parks, grass and woods. One location pin (generic pin hidden when the home pin shows). Route planner: corridor tile preload now awaits each load (it used to be skipped while another tile was loading) and pins the corridor so the far end isn't evicted before routing; planner / car tour wait up to 90 s / 60 s for the road network instead of failing with "Roads not ready" on slower PCs. Homepage: plane actually crosses the sky (keyframes used % of its own width), silver with blinking nav light, keeps moving with reduced-motion; nav says Houston. |
| **v10.36.0** | Houston-only: `activeCityId()` always returns houston, Metro picker hidden, homepage city list removed; location halo removed and home pin ~3× smaller; stadium label "NRG Stadium (Reliant)"; Astrodome moved to its real spot ~285 m east of NRG at real size (≈216 m across, ~60 m tall); high cirrus streak sprites removed; followed-plane trail fades from the aircraft back (last ~160 samples), thinner at all zoom levels, and old trail geometry is disposed each rebuild (fixes a GPU memory leak); WebGL context loss auto-reloads if the context is not restored within 4 s. |
| **v10.35.0** | Loading screen silhouette redrawn as Houston (Williams Tower, Heritage Plaza, Wells Fargo Plaza, JPMorgan Chase Tower, Pennzoil Place, Bank of America Center, 609 Main); cloud sprites fade at their edges (no white squares); cirrus hidden at night and fainter by day; location pin/halo ~3× smaller; rain 3,200 finer grey streaks; planned route drawn thicker, lifted and always on top; street lights on all trunk/primary/secondary/tertiary roads; music player: icon controls, one-row genre chips, **Radio** button streams live stations for the chosen genre from radio-browser.info. |
| **v10.34.0** | Dotted altocumulus removed (mid deck drawn as flat cumulus, still live Open-Meteo); sun ~40% smaller, weaker glare/horizon glow; night towers dimmer (fewer lit floors); suburb houses get warm night windows and streamed residential/collector streets get street lights; airliner paint neutral white; hover an iconic OSM building with a `wikipedia` tag → Wikipedia summary + photo (379 buildings, CC BY-SA); locate button redesigned; custom model of 16623 Red Gully Dr with generated houses kept off the lot. |
| **v10.33.0** | Clouds follow Open-Meteo `cloud_cover_low/mid/high` (cumulus only with a real low deck, altocumulus mid, cirrus high; thin cirrus barely dims the sun); shadows with hysteresis + 2 s sun refresh + wider frustum (no popping/uneven light); sun glare only when looking at the sun; streetlight pools above road decks (no z-fight flicker); at-grade junctions pinned to the ground + steeper short ramps + vertical retaining walls (no humped/merged roads); denser evening office/home windows + blue moonlight ambient; rain now slows traffic (`window.wxBlend` exposed); locate button sits left of the side panel; larger Houston facts |
| **v10.32.0** | Route planner Drive it starts at the chosen From point on the planned route; Take off from / Land at any of 14 Houston-area airfields with OSM runways; cumulus/altocumulus (dotted sunset)/cirrus/stratus layers driven by live cloud cover + rain; NOAA sunrise/sunset for Houston; legacy mis-scaled lakes removed + matte water (no aerial glare); PBR tour-car paint; music genres; Houston fun facts |
| **v10.18.0** | Real OSM 3D buildings (true footprints/heights, batched + LOD), static batching, OSM street cell merge, adaptive SSAO, feed/CORS fixes |

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

### Real 3D cities (v10.18.0)

- **Real buildings:** `npm run buildings:fetch[:all]` (`scripts/fetch-osm-buildings.mjs`) pulls OSM building ways, `building:part`s and multipolygons (with courtyards) for researched downtown/district tiles of every city → compact v2 packs `public/data/cities/<id>/buildings.json` + `src/cities/osm-coverage.js`. Heights from `height` / `building:levels`, `min_height` for podium/tower parts, `building:colour` / `roof:colour` / material for façades.
- **Coverage (v10.18.0):** 15 of 16 cities ship packs — Houston, Austin, San Antonio, Dallas, Los Angeles, Boston, Chicago, Miami, Seattle, Denver, Atlanta, Phoenix, Philadelphia, Minneapolis, New Orleans. New York (dense Manhattan tiles) repeatedly timed out on the public Overpass mirrors; it keeps the procedural skyline until `node scripts/fetch-osm-buildings.mjs missing` succeeds.
- **Renderer:** `src/render/osm-city.js` extrudes footprints off the main thread budget (22 ms slices), merges walls + roofs per 520-unit chunk and façade class (glass / stone / low-rise) → a few dozen draw calls for thousands of buildings; canvas window textures with night emissive; distance LOD hides far chunks; AABB picking so hover/click tooltips show name, height and floors without triangle raycasts.
- **No double skyline:** procedural towers/pockets skip OSM-covered tiles; hand-modelled icons (Capitol, UT Tower, Congress Bridge, attractions) keep a small clearance via `HTS_OSM_SKIP`. Buildings overlapping roads/water are dropped (`nearRoadFast` spatial grid).
- **Draw calls:** `src/render/static-batch.js` merges static road meshes (1,679 → 734) and procedural towers per material/spatial cell; OSM streets merged per cell; canopy LOD; SSAO composer only when the FPS budget allows (otherwise direct render). Houston wide view ~7.2k → ~2.7k calls.
- **Filters tuned:** real footprints are only dropped when their centroid sits on a carriageway (`nearRoadFast(x,z,-24)`); the coarse water polygons no longer cull them (Chicago Loop 973 → 4,083, New Orleans 1,033 → 2,637). Procedural fill towers next to real skylines use real-world proportions (`POCKET_K`).
- **Batching safety:** `batchStaticChildren` iterates to a fixpoint so a multi-material mesh is never removed when one of its buckets collapses to a single entry.
- **Debug hook:** `window.HTS_DEBUG` (renderer/scene/camera) only exists with `?debug` in the URL.
- **Bugs fixed:** `fa is not defined` flight HUD error; Sugar Land BW8 corridor padding (`tsPadMin: 10`); deprecated `PCFSoftShadowMap`; CORS-blocked direct flight hosts are remembered and skipped (`CORS_DEAD_HOSTS`) instead of retried every poll; feeds answering 403/429 rest per host+route (`FEED_COOLDOWN`, 15 / 5 min) — airplanes.live 403s 5 → 1, OpenSky 429s 4 → 1 per session start; `/api/*` middleware + proxies now work under `vite preview` too (news 404).

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

`build v10.18.0`

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

*Updated 2026-10-14 for the v10.18.0 real-3D-city release.*

## Houston v2 (case study, true metre scale)

Houston now runs at real scale (`unitsPerMile: 1609.344` in `src/cities/houston/manifest.js`). Legacy layout
literals authored at 210 units/mile are mapped with `W()` / `WS` in `src/app-main.js`; other cities are unchanged (WS = 1).

- **Data**: `scripts/extract-houston-osm.py` reads a Geofabrik Texas PBF (clip first with
  `osmium extract -b -95.98,29.28,-94.75,30.22 texas-latest.osm.pbf -o houston.osm.pbf`) and writes
  `public/data/houston/roads-major.json` plus land cover; `scripts/tile-houston-osm.py` splits minor/local roads and
  land cover into 4 km tiles (`public/data/houston/tiles/`). © OpenStreetMap contributors (ODbL).
- **Roads** (`src/render/houston-roads.js`): every OSM way as a lane-width ribbon with lane paint; bridges and
  overpasses from OSM `bridge`/`layer` tags (6.8 m per layer), approaches ramp at 4.5 % on earth berms, piers only under
  real bridges. Minor streets stream within 9 km, local streets within 3.6 km. `?roads1` shows the legacy roads.
- **Land** (`src/render/houston-land.js`): parks, woods, scrub, water, wetlands, parking, commercial, industrial and
  residential polygons; trees/bushes instanced; houses placed along real residential streets (kept off roads with a
  4 m occupancy grid, never inside parks/commercial/industrial/water).
- **Signs** (`src/render/houston-signs.js`): green exit guide signs (ramp → named destination road), route shields,
  and street-name blades at named intersections, built lazily near the camera.
- **Sky**: cloud deck 1.3–2.9 km over the metro, altitude-aware haze, sky dome and ground sized for aerial views;
  live flights shown within the metro with real ADS-B altitude (grown with distance so they stay visible).

## v10.20.0 — Houston traffic v2, airports, aircraft
- **Traffic v2** (`src/render/houston-traffic.js`): cars live on the real OSM major-road ways (directed carriageways from `oneway` + `lanes`), keep per-lane order with IDM car-following, change lanes only with safe gaps, hand over between connected ways (no popping on bridges), and ride the same bridge/ramp deck profile as the rendered road. Speeds follow fresh TranStar live speeds via the legacy corridor bridge; jams pack cars tighter. `?traffic1` restores the old system.
- **Paint mix**: mostly white, black, grey and silver, with a few blue/red/earth tones.
- **Hotspot rings** now follow what the simulated cars inside them are doing: shown only when they crawl, hidden once flow recovers.
- **Airports** (`scripts/extract-houston-aeroway.py` → `public/data/houston/airports.json`, `src/render/houston-airports.js`): 19 aerodromes, 65 runways with threshold/centre/edge paint, 1,067 taxiways with yellow centrelines, aprons, terminals and hangars from OSM, flush on the ground. No trees or houses inside airfields; legacy floating pads are off in metre mode.
- **Aircraft**: airline liveries by callsign prefix, small round red/green nav lights, white strobes and landing lights at night.
- **Hover**: named buildings without a curated blurb pull a Wikipedia summary (only when the article's coordinates match the building).
- Legacy Downtown Aquarium box (blocked Bagby St at the old scale) is skipped in metre mode.

## v10.21.0 — Houston street lights
- `scripts/extract-houston-streetlights.py` → `public/data/houston/streetlights.json`: 8,750 mapped `highway=street_lamp` nodes, 13,790 `lit=yes` major-road ways, 1,542 `lit=yes` neighbourhood streets (OSM).
- `src/render/houston-streetlights.js`: ~55k poles only where OSM says the road is lit — cobra-heads on arterial/freeway edges, twin-arm median poles on divided freeways, standing on the rendered deck (bridges included), post-top lamps at mapped nodes. Instanced per 2 km cell, built lazily within ~5 km of the view; heads warm up and light pools appear at night.

## v10.22.0 — East Houston industry from real data
- Removed legacy random ship-channel tanks, flare stacks, container cranes and container stacks that sat on East End / EaDo streets at the old scale (gated off in metre-scale Houston).
- Added 5,089 real OpenStreetMap storage tanks and silos (`scripts/extract-houston-tanks.py` → `public/data/houston/tanks.json`, rendered by `src/render/houston-tanks.js` in 2 instanced draw calls) at their mapped position and diameter.

## v10.22.1 — Street light pools sized to real lamps
- Light pools shrunk to real cobra-head footprints (freeway ~11 m, median ~12 m, streets ~8 m, post-top ~6 m) and dimmed; softer falloff.
- Legacy corridor lamps (32 m pools) disabled in metre-scale Houston so they no longer double up with the OSM street lights.

## v10.31.0 — Better-looking aircraft
- Tour/GA plane (`makeProp`) rebuilt as a Cessna 172-class model: tapered fuselage, cabin glass, high strut-braced wing, two-tone livery, spinner, fixed gear.
- Live airliners (`makeAirliner`): smoother fuselage, elongated nose, PBR (metal/rough) paint, dark engine intakes.

## v10.30.0 — Tour landing on real runways, NRG Stadium scale
- Plane tour landing picks only runways whose midpoint lies inside the chosen airport's OSM aerodrome outline, and holds the 3° glide path tightly on final so the wheels meet the ground on the runway (it could sink to the minimum height early and skim over roads).
- NRG Stadium model is built as one group and scaled/rotated to the real stadium (~290 m N–S × ~235 m, roof ~70 m) in metre-scale Houston; it was legacy-sized (~96 m).

## v10.28.0 — Tour Houston
- New **Tour Houston** panel (Controls → Go): pick *By car* or *By plane* and a place (16 landmarks + 112 OSM cities/towns/suburbs), then *Start tour*; or *Free drive* / *Free flight*.
- Starts from the user's location (browser permission; falls back to the map centre if denied or outside the map).
- Car: fastest-time route (Dijkstra) over the simulated OSM carriageway graph, driven in-lane with IDM car-following against the simulated cars ahead and stopping for red/amber OSM signals. Cruise selector: speed limit +5 or 30–90 mph. ETA uses the remaining route at the speed you'd hold; trip odometer from distance actually driven.
- Plane (Cessna-class): takeoff roll on the nearest airport's OSM runway, rotate at 55 kt, ~700 ft/min climb to 1,500 ft, 110 kt cruise, standard-rate (3°/s) turns with matching bank, descend to 1,000 ft and circle the destination.
- Round trips: the car drives back to its start on the real road graph after a short stop at the destination; the plane circles ~2.5 min (or *Land now*), then flies to a final-approach fix 9 km out on the extended centreline of the longest runway at the chosen *Land at* airport (default: where it took off), flies a 3° glide to the touchdown zone, and brakes to a stop.
- Views: chase / driver or cockpit / side or wing / top / free look; drag to look around, scroll to zoom (driver/cockpit zoom = field of view), right-drag pans in top view. Driver view: dashboard with speedometer, tachometer (6-speed auto), gear, trip, speed-limit sign, road name and a steering wheel turned by the car's real yaw rate. Cockpit: airspeed, altitude, vertical speed, heading and artificial horizon.
- Flight cards: progress bar = share of the origin→destination distance flown from the live position (or real departure/arrival times); hidden when the route is unknown instead of guessing from altitude.
- Selected-plane line now traces the positions the aircraft was actually drawn at, plus a descent line only for a verified Houston arrival.
- Houses no longer appear on major roads/frontage roads: the house occupancy grid now includes the major OSM network.
- Airport labels/landing positions use real lat/lng in metre-scale Houston (the conversion was gated on the wrong scale flag).

## v10.27.0 — Plane camera, airport views, toll gantries
- Following a plane: right-drag/shift-drag pans an offset from the aircraft instead of snapping back; zoom out to the normal map limit and look almost straight up or down.
- Airport board buttons (IAH/HOU/EFD/SGR/DWH) and airport fly-to views frame the whole OSM aerodrome (centre of its outline, radius from its size) instead of the reference point at a fixed close zoom.
- 265 real toll gantries from OSM `highway=toll_gantry` (Sam Houston Tollway, Westpark, Fort Bend, Hardy, Grand Parkway TX-99, TX-288/249 toll lanes, I-10 managed lanes): steel portal frame across the carriageway at deck height, EZ TAG/TxTag reader over every lane, purple EZ TAG ONLY plaque. Four instanced draw calls total. Data: `scripts/extract-houston-tolls.py` → `public/data/houston/tolls.json`.

## v10.26.0 — Regional airfields, smoother movement
- Suburb tiles (houses, yards, trees) now start only after the OSM airfield outlines load. Before, tiles built first could not see `inAerodrome`, so subdivisions filled SGR, DWH and other regional fields and hid their runways, hangars, towers and parked planes.
- Parked GA aircraft sit on their gear above the apron slab instead of half-sunk into it.
- While the camera is moving, suburb detail tiles are not built (ground tiles still stream); they catch up when it settles, and only one tile builds per tick.
- Fixed a timer that read `followPlane` before it was declared (console errors on load).

## v10.25.0 — Nuclear physics, flight paths, board sync
- Nuclear radii rescaled to Glasstone & Dolan / NUKEMAP airburst values (5 psi 0.49 km·kt^⅓, 1 psi 1.34 km·kt^⅓, thermal 0.62 km·kt^0.41, fireball 0.068 km·kt^0.4; old values were ~3× too large).
- Drop animation: RV terminal dive at 2.9 km/s, detonation at optimum burst height, thermal flash timed from t_max = 0.0417·W^0.44 s, Sedov–Taylor shock → 345 m/s front revealing rings as it passes, live psi readout, fireball cooling/rise and mushroom cloud to 5.76·W^0.194 km. Real-time / ¼ speed / ×10 controls.
- Selected flights draw their flown ADS-B track, a line back to the origin and a descent line to the destination; when the feed has no route, the likely airport is inferred from heading and climb/descent and labelled "Likely". Line refreshes every 1.5 s.
- Flight board: clicking a card finds the flight by id (not list index) and flies to it; clicking a plane highlights and scrolls its card.

## v10.24.0 — Airport positions, hazard animation, flight routes, live-speed fix
- Airport labels, approach paths and landings use each airport's real lat/lng in the metre world (SGR, DWH, IWS, CXO were on neighbourhoods).
- Nuclear prediction: warhead falls onto the target, then a fireball flash and shock ring; damage rings appear at impact.
- Selecting a flight draws its route: dashed origin → aircraft, solid aircraft → destination (when the route is known).
- Flight card: larger airport codes, progress bar with aircraft marker. Live planes no longer fog to haze-blue at range.
- Traffic Flow panel: TranStar corridor hints were legacy 210-u/mi coordinates, so travel-time speeds collapsed to the 8 mph floor; hints now map to metres and segments without a known length are skipped.

## v10.23.0 — Local traffic, real traffic lights, suburbs, airports, place labels
- Cars on arterials and neighbourhood streets (secondary → residential) at lighter densities than freeways; streamed with the local road tiles (`houston-roads.js` `onTile` → traffic `addTile/removeTile`).
- 28,598 OSM traffic signals (`scripts/extract-houston-signals.py` → `public/data/houston/signals.json`). Signals become stop lines on the carriageways that pass through them; a 72 s two-phase cycle (31 s green, 3.5 s amber) shared per junction. Cars brake for red/amber, queue and go on green. Heads drawn near the camera (`houston-signals.js`). OSM has locations, not live phase timing, so phases are simulated.
- Suburbs: houses on residential/living/unclassified streets with garages, driveways, back fences and some pools; up to 7,000 houses per tile.
- Airports: OSM control towers (`aeroway=tower` / `tower:type=aircraft_control`, 4 after de-dup incl. IAH 102 m) plus a placed tower at HOU/EFD; detailed tower model; glazed terminal facades and ribbed hangars; 134 OSM jet bridges; airliners at ~60 % of OSM stands next to terminals (United at IAH, Southwest at HOU); light aircraft tied down on GA aprons; runway edge lights at night. Old procedural airport props are off for metre-scale Houston.
- Place-name labels (`scripts/extract-houston-places.py` → `places.json`, 740 OSM places) appear when zoomed out, decluttered, and fade out as you zoom in (`houston-places.js`).

