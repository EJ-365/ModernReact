# Tech transition — research & stack decision

**Status:** Foundation phase (no multi-city yet)  
**Date:** 2026-07-11  
**Do not rewrite the vehicle kernel** — it already works (v10.8.6 / v10.16.x).

---

## Recommendation

**Modernize the platform first → then add cities.**

Do **not** fork `app.html` per city. Do **not** jump straight to React Three Fiber / Next.js — that would rewrite the whole HUD + sim for little gain right now.

---

## Current reality

| Piece | Today |
|--------|--------|
| Build | Vite 7 MPA |
| 3D | Three.js `^0.185` (CDN r128 still loaded in `app.html` — migrate later) |
| Sim | ~11k-line `app.html` monolith |
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
  core/                   # Phase 2: clock, geo math, motion
  render/                 # Phase 2: scene, vehicles, roads
  rain.js                 # Already extracted
app.html                  # Shell + HUD; thins over time
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
- [x] Weather report UI (full brief + 12-hour strip) before deeper migrate  
- [ ] Add TypeScript (`allowJs`) without blocking build  

### Phase 2 — Extract without behavior change
- Move clock / geo / corridor ETA helpers into `src/core/`  
- Move TranStar mapping into `src/feeds/transtar.js`  
- Point `app.html` at modules; Houston still only city  
- Expand tests (ETA floors, cong-from-mph, spawn)  

### Phase 3 — Second city (thin)
- One more manifest (e.g. Austin) with TomTom-only traffic  
- Prove adapter swap; don’t polish landmarks yet  

### Phase 4 — Scale
- Generalize OSM stitch → `roads:stitch --city=houston`  
- Optional R3F for *new* UI only; keep sim canvas vanilla  
- Align Netlify/Vercel proxy behavior  

---

## CDN Three vs npm Three

`app.html` still loads **Three r128 from CDN** while `package.json` has **0.185**. Phase 2 should use **one** Three (Vite-bundled) so rain + sim share the same API.

---

## Success criteria before city #2

1. Houston behavior unchanged (motion, ETAs, live feeds).  
2. City-specific numbers live in `src/cities/houston/`, not sprinkled only in prose.  
3. Traffic refresh goes through an adapter interface.  
4. Tests cover spawn + ETA sanity + adapter smoke.  
5. `docs/TECH_TRANSITION.md` stays the source of truth for the stack.

---

*Related: [PROGRESS.md](./PROGRESS.md) · [architecture.html](./architecture.html)*
