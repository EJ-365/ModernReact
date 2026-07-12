# Tech transition — research & stack decision

**Status:** Phase 2 — Three unified on Vite 0.185; TranStar adapter owns map/RSS/apply/index  
**Date:** 2026-07-12  
**Do not rewrite the vehicle kernel** — it already works (v10.8.6 / v10.16.x).  
**Do not commit/push unless asked.**

---

## Recommendation

**Modernize the platform first → then add cities.**

Do **not** fork `app.html` per city. Do **not** jump straight to React Three Fiber / Next.js — that would rewrite the whole HUD + sim for little gain right now.

---

## Current reality

| Piece | Today |
|--------|--------|
| Build | Vite 7 MPA |
| 3D | **Three.js Vite-bundled `^0.185`** via `src/three-bridge.js` + `src/boot.js` (CDN r128 removed) |
| Sim | `src/app-main.js` (extracted from `app.html`) + thin HTML shell |
| Extracted | Rain (`src/rain.js`), corridor stitch scripts |
| Deploy | Netlify + Vercel proxies |
| Tests | One spawn unit test |

---

## Tools we need (adopt)

| Tool | Why | When |
|------|-----|------|
| **Vite** (keep) | Already fast MPA + proxies | Now |
| **TypeScript** (incremental) | City packs + feed adapters typed; allow JS during migrate | Phase 1 |
| **City manifests** (`src/cities/*`) | Origin, TZ, bbox, corridors, landmarks per metro | Phase 1 ✅ scaffold |
| **Feed adapters** (`src/feeds/*`) | Same `LIVE_TRAFFIC` shape; TranStar / TomTom / future city APIs | Phase 1 ✅ scaffold |
| **ES modules** | Split motion / roads / weather / flights out of `app.html` | Phase 2 |
| **Vitest** (or expand `node:test`) | Guard motion, ETA sanity, adapters | Phase 2 |
| **InstancedMesh** (keep) | Already used for vehicles — keep as perf baseline | Ongoing |
| **OSM stitch pipeline** (generalize) | Per-city corridor packs, not Houston-only script names | Phase 2–3 |

## Tools to defer (not now)

| Tool | Why wait |
|------|----------|
| **React + R3F** | Full UI rewrite; marketing site already separate |
| **Next.js** | Overkill for static MPA + edge proxies |
| **ECS (Koota / bitECS)** | Useful later for huge entity counts; not needed to ship city #2 |
| **WebGPU-only** | Three r185 can adopt later; WebGL path must stay |
| **Monorepo (pnpm workspaces)** | Optional after 2–3 cities share packages |

---

## Target architecture

```
src/
  cities/
    types.js              # CityManifest shape
    houston/manifest.js   # Houston pack (origin, feeds, ids)
    <city>/manifest.js    # Future packs
  feeds/
    types.js              # LiveTrafficAdapter contract
    transtar.js           # Houston adapter (thin → grow)
    tomtom.js             # Shared fallback
  core/                   # Phase 2 ✅ clock parts, geo, corridor ETA
    math.js / geo.js / clock.js / corridor-eta.js
  render/                 # Phase 2+: scene, vehicles, roads
  rain.js                 # Already extracted
app.html                  # Shell + HUD; thins via window.HTS_CORE
public/data/cities/<id>/  # Road JSON packs
```

**Contract:** every city exports a `CityManifest`. Every traffic source implements `LiveTrafficAdapter.refresh()` → `{ flows, incidents, corridorTimes }`.

---

## Phased plan

### Phase 1 — Foundation (this commit / stretch)
- [x] Research + write this doc  
- [x] Scaffold `CityManifest` + Houston manifest  
- [x] Scaffold feed adapter types  
- [x] Bridge `window.HTS_CITY` for gradual adoption  
- [x] NWS weather alerts popup (alerts only; conditions stay on card)  
- [x] Add TypeScript (`allowJs`) without blocking build  

### Phase 2 — Extract without behavior change
- [x] Move clock / geo / corridor ETA helpers into `src/core/`  
- [x] Move TranStar mapping into `src/feeds/transtar-map.js` (+ adapter surface)  
- [x] Move TranStar RSS parse/fetch into `src/feeds/transtar-rss.js` (adapter `refresh` / `pullPublicFeeds`)  
- [x] Move applyTravelTimes / speed JSON apply into `src/feeds/transtar-apply.js` (road-graph via deps)  
- [x] Move corridor-time index into `src/feeds/transtar-corridor-index.js`  
- [x] Point `app.html` at modules via `window.HTS_CORE` / `HTS_FEEDS` (call-time; Houston still only city)  
- [x] Expand tests (ETA floors, geo, clock, TranStar, RSS, apply, corridor index, Three rev)  
- [x] Unify Three (drop CDN r128 → Vite-bundled 0.185 via `boot.js` / `app-main.js`)  
- [ ] Optional: Vitest runner (still on `node:test`)  
- [ ] Extract more render/motion modules under `src/render/`  

### Phase 3 — Second city (thin)
- One more manifest (e.g. Austin) with TomTom-only traffic  
- Prove adapter swap; don’t polish landmarks yet  

### Phase 4 — Scale
- Generalize OSM stitch → `roads:stitch --city=houston`  
- Optional R3F for *new* UI only; keep sim canvas vanilla  
- Align Netlify/Vercel proxy behavior  

---

## CDN Three vs npm Three

**Done (Phase 2):** `app.html` loads `src/boot.js` → Vite Three **0.185** + compat shims (`outputEncoding` → `outputColorSpace`). Rain and sim share `window.THREE`. Legacy CDN r128 removed.

---

## Success criteria before city #2

1. Houston behavior unchanged (motion, ETAs, live feeds).  
2. City-specific numbers live in `src/cities/houston/`, not sprinkled only in prose.  
3. Traffic refresh goes through an adapter interface.  
4. Tests cover spawn + ETA sanity + adapter smoke.  
5. `docs/TECH_TRANSITION.md` stays the source of truth for the stack.

---

*Related: [PROGRESS.md](./PROGRESS.md) · [architecture.html](./architecture.html)*
