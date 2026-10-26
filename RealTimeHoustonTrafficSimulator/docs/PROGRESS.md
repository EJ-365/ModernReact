# Progress log — Live Traffic Simulator

**Author:** Ejay Gabriel  
**Current build:** **v10.81.0** — Trip times over an hour show as hours (12 h 15 min); "Drive to Houston" from any Americas city uses the Houston tour car, panel, dash, music and radio; all 31 city data packs checked (no 404s).

### v10.57.0
- Go to my location: flies in to ~170 m (was up to 900 m) at a steeper angle so the pin/house is clearly visible.
- Ambient and new toll-road buttons line up in one column with the locate button when the right panel is open (same computed offset).
- Radio: the music ■ button and ending a tour now stop the radio stream too.
- Traffic: cars in the same lane brake for the player's tour car (IDM gap to the ego car) instead of driving through it.
- Zoomed-out glitter: renderer uses a reversed-Z depth buffer where supported, so distant land, roofs and lane paint no longer z-fight and blink.
- Jam hotspot rings: no pulse; hysteresis on show/hide (0.54/0.46) and red/orange (0.74/0.66) so rings don't blink or flip colour; steady opacity per tier.
- Taxi to park: drawn as a 14 m taxiway strip with yellow edge lines and a solid green centreline; only the jet and C-130 taxi (Cessna, F-16 and helicopter stop on the runway); message says "Parked at the gate".
- Toll roads (new button above ambient): purple overlay of every tolled freeway in OSM (Sam Houston Tollway, Hardy, Westpark, Fort Bend, Grand Parkway, Katy Managed Lanes, Tomball, SH 249, SH 288) with a legend of miles per corridor.
- Car driver view: US left-hand drive — wheel and instrument cluster on the left, centre stack with nav screen, asymmetric A-pillars, windshield tint, sun visor and rear-view mirror.
- Jet / C-130 cockpit: glareshield autopilot panel (live SPD/HDG/ALT/V/S), master caution/warning, overhead panel edge, centre post and side-window frames.
- Music: new Movie soundtracks genre — Like A Prayer (Choir Version, Deadpool & Wolverine, Madonna), Time, First Step, Danger Zone, Eye Of The Tiger, My Heart Will Go On, Shallow, Skyfall, Ghostbusters, Don't You (Forget About Me), What Was I Made For?, Jurassic Park, Stayin' Alive, Chariots Of Fire.
**SW cache:** `hts-shell-v206`

### v10.56.0
- Traffic, pedestrians and bikes: instanced meshes had a bounding sphere cached from where the cars first spawned, so whole fleets were frustum-culled when that spot left the view. Culling is now off for moving instanced meshes.
- Go to my location: uses the last fix immediately (low-accuracy, 2 min cache) instead of waiting up to 18 s for a new high-accuracy GPS fix.
- Radio button now plays 11 real Houston stations (94.5 The Buzz, Sunny 99.1, KSBJ, KJIC, SUC Radio, Houston Public Media x3, KTRH, KPRC, Sangeet). Tap Radio again or ◀ ▶ to change station; ✕ turns it off.
- Ambient sound button (above locate): Downtown city, Gulf rain, Park birds, Bayou night, Galveston shore, Prairie wind, with volume. Generated with Web Audio; hidden and muted during car/aircraft tours.
- Taxi to park: a FOLLOW ME car leads the plane along the green lane, a marshaller waves it in at the stand, then a pushback tug hooks up at the nose.
- Sun disc scales with the world (about 3x larger on screen) with a wider bright core.
- Spotify button in the music panel: free official playlist embed per genre.
- Taxi to park fix: after reaching the stand the plane was dragged back onto the runway centreline by the roll-out logic; it now holds at the stand (checked headless at IAH: plane, marshaller and tug all within ~30 m of the stand).
- Cumulus clouds: higher-resolution sprites (512x256) with 18-28 puffs, bright sun-lit crowns, blue-grey shaded undersides and a flat base.
- Console build banner now reports the real version.
- Music: Take On Me, Jump (Van Halen), Beyonce, Destiny's Child, Travis Scott, Megan Thee Stallion, UGK, Slim Thug, Bun B, Chamillionaire, Maxo Kream, Lizzo, synthwave (Kavinsky, Gunship, Perturbator), EDM, rock and country.
**SW cache:** `hts-shell-v205`

This log captures the work from the late **v10.8.x / v10.9** baseline through the current **v10.18.0** real-3D-city release.






## v10.94.0 — Houston landscape by area
- Houston ground is tinted per real land cover (soft blends, map data layers stay on top): grey-beige concrete in the downtown/Midtown core and the Ship Channel / Pasadena industrial belt, dark pine forest in the north (Kingwood, The Woodlands, Spring, Lake Houston), tan-green farm fields and prairie west (Katy, Brookshire, Fulshear), olive coastal marsh toward Baytown and Galveston Bay (Seabrook, Kemah, La Porte), drier pasture to the southwest (Rosharon); everything else stays suburban lawn green.
- The 480 km Houston ground quad is subdivided (64×64) so its depth stays accurate near the camera.

## v10.93.0 — Houston buildings stay detailed
- Houston OSM buildings keep their CPU vertex copies again (v10.84.0 dropped them after upload to save memory). Without them a GPU context loss/restore — common on busy Windows GPUs — could not re-upload the geometry, so downtown and campus buildings silently disappeared and Houston looked less detailed.

## v10.92.4 — Houston as in v10.88.0, lighter compass
- Houston ground, land use, trees and roads are byte-identical to v10.88.0 (no green changes ever touched houston-land.js / houston-roads.js). Only houston-airports.js differs: original grass colour, roads inside airport fences draw on top, no grass blanket over residential airparks, yellow taxi guide.
- Compass touches the DOM only when the heading changes by 0.3°+ (was a style recalc every frame).

## v10.92.3 — Houston airport grass back to its original colour
- Real Houston airports use the original infield grass colour (0x8aa25e) again; only the depth fix (roads draw on top) and the airpark change remain.

## v10.92.2 — no green blankets over Houston neighbourhoods
- Houston: the airport grass fill and the "keep clear of houses/trees" fence now apply only to real airports with an IATA code (IAH, HOU, EFD, DWH, SGR, IWS, HPY…). Residential airparks and heliports (Lane Airpark, Dry Creek, Freyer Field, Alvin Airpark…) no longer paint their neighbourhoods green or leave them empty.

## v10.92.1 — Houston airport roads visible
- Houston airports: the aerodrome grass fill used a depth pull (polygonOffset −1) that put it "in front of" the landside roads inside the airport boundary, so terminal roads disappeared under green. The grass now has no depth pull; roads (which pull forward) draw on top.

## v10.92.0 — airliner nose, 747 upper-deck windows, fly-on pick, softer farmland
- Airliner nose: removed the separate grey radome ball, windscreen frame posts and centre box that stuck out of the nose shell (read as bumps); the nose is one smooth shape with the dark windscreen band.
- 747 upper deck: windows sit on the hump surface (skipped where it tapers) and tilt with it, so the row lines up instead of floating above the fuselage.
- Fly on after landing: the destination list keeps your pick while the panel refreshes (it fell back to the first city, Accra) and the take-off uses it.
- Houston airports: the taxi-to-park guide is no longer a bright green painted lane — it is a real-style yellow taxiway centreline with yellow edge lines on the asphalt; infield grass is a duller mown-grass tone.
- Other-city farmland texture: no dark crack lines or big dark blotches; soft field edges and faint tree clumps.

## v10.91.0 — compass, trip titles, window seat fix, car always on asphalt
- Tour panel title: a new trip never inherits the previous one ("Car tour: Atlanta → Houston" no longer shows on a flight).
- Window view: fixed a per-frame error (look-around offsets were scoped to the cockpit view) that froze the camera.
- Compass: follows the real camera direction in Houston tours, in world cities and on the globe (north = toward the pole at the point under the camera); N/E/S/W letters stay upright.
- Place pill: more than ~55 km from downtown Houston with no named place, it shows the nearest catalog city / "Between cities" instead of "Greater Houston".
- Window view: seat placed from the aircraft's own size, ahead of the wing root, looking out/down/back over the wing.
- Intercity highway strip extends 40 m past both route ends.
- Other-city ground plane subdivided (96×96): one 90 km quad gave imprecise depth near the camera and covered streets/tyres.
- World flights: arrival time shows the destination's zone (CDT for Houston, not UTC).
- Intercity drives: your carriageway strip follows the route height, so inside cities it sits just above the OSM streets — the car is never on grass (Dallas start) or sunk into a street.

## v10.90.0 — green ground in world cities, window seat, fly on after landing
- Other cities: ground is a farmland/grass patchwork (greens with a few harvested tans, hedge lines, tree clumps) instead of flat tan; dry cities use olive tones.
- New plane view **Window**: passenger seat on the left side, looking out and down past the wing.
- Landed in a world city: the tour panel shows a destination list and **Take off from XXX** — fly on from the same airport with the same aircraft.
- B-2: the bubble-like crew hump and engine humps are flattened into the wing (no bump on the nose); smaller intakes.
- Driving into other cities: the tour car rides at street height inside the city (streets sit 0.3-0.5 m up), so it is no longer swallowed by the road.
- City card: label and value no longer run together ("Airport ATL").

## v10.89.0 — intercity driving: real ground, lighter roads
- White ground on drives between cities: the far ground was one 1,200 km quad, which broke depth testing on some GPUs, so it painted over the embedded city, the highway and the tour car. It is now subdivided (48×48), and its fog is computed per pixel.
- Drives from another city to Houston: the trip is flagged before the start city loads, so the idle clean-up no longer drops the half-loaded city (the car started on bare ground with no streets).
- Roads: intercity highway asphalt and shoulders, and other-city street materials, are lighter grey so tyres and lane paint read.
- The cars ahead of and behind you (tour escorts): moved every frame instead of 20 times a second (they jumped ~1.5 m per step at highway speed), heading eases through bends, and escorts that would fall off the start/end of the route are hidden instead of stacking beside your car.
- Tour car: the hood panel sat 2 mm from the body top and z-fought (shimmer on the cars ahead/behind in chase); raised clear.

## v10.88.0 — sharp globe close-ups, more place names, aircraft fixes

- Globe: free Sentinel-2 cloudless imagery (EOX, CC BY 4.0, 2016 mosaic) streams in as a curved patch under the camera below ~2,400 km altitude; NASA imagery stays everywhere else.
- Globe names: ~1,100 Natural Earth towns/cities and ~300 states/provinces appear as you zoom in, with overlap culling; "Gulf of America".
- Tour aircraft: your pick is kept on intercity flights (F-16, B-2, C-130 any distance; helicopter up to ~700 km; Cessna up to ~1,200 km).
- F-16/C-130 gear retracts in flight; F-16 chin intake is a rounded fairing instead of a dark box.
- Airliners: wider windscreen with frame posts; the accent nose crown no longer covers it.
- Flicker in the air: the camera near plane grows with altitude so ground layers keep depth precision.
- Other cities: beaches drawn under parks (no striped fighting); airport terminals capped at 22 m with glass curtain-wall facades.

## v10.87.0 — globe labels, intercity drive fixes, Houston trees

- Globe: continent, ocean, sea, country, lake and river names that appear by zoom level (like Earth 3D maps).
- Drives between cities: panel title reads "Car tour: Chicago → Houston"; the ETA no longer applies Houston rush hour or Houston traffic probes to the open highway or other cities.
- Drive routes keep full road detail within 25 km of each city end (OSRM, re-fetched), so the car follows real streets instead of cutting through buildings.
- Other cities: lighter asphalt so roads read as roads.
- Houston: no trees inside rivers, lakes or ponds; city card shows city and metro population.
- If a new build replaces the app's lazy files while a page is open (the "Failed to fetch dynamically imported module" error on Fly to…), the page reloads once instead of failing.

## v10.86.0 — time zones, city facts, day/night preview, B-2, supersonic, flight hover
- City card local time shows the zone after the time (`Sat, 9:51 PM - CDT`, from each city's IANA `tz`); trip clock times show the destination city's zone.
- Every catalog city has `info.pop` and `info.fact` shown on the card ("Population", "Known for").
- Non-Houston cities: Sky Live / Day / Night switch (`cityScene.setLook`) previews the city at local solar noon or midnight; Live uses the real sun.
- Cities are built while the globe flies down to them (`prefetchCity`); the loading card only appears if the city is still not ready 350 ms after arrival.
- Hover a live aircraft over a city for callsign, type, registration, altitude, speed and heading (`cityScene.pickTraffic`, `#wFlightTip`).
- Houston: trees from park/wood polygons that overlap streets are removed using the 4 m road occupancy grid (major roads too on tiles without local streets).
- Globe button follows the same right offset as the toll/ambient/location buttons, so the column lines up.
- B-2 Spirit flying wing (`makeMilitary('b2')`) in the plane picker for Houston and intercity flights; F-16, B-2 and C-130 in the world card's aircraft list.
- Optional Supersonic button on intercity jet/fighter flights: Mach 2 (~1,150 kt) above 30,000 ft; ETA follows the real speed.
- Boeing noses taper to a lower point; Airbus noses stay full and blunt (`noseShape`).
- 48 new verified songs (Afrobeats, pop, gospel, hip-hop, Interstellar "Cornfield Chase" and "No Time for Caution"); duplicates skipped by ID/title.

## v10.85.1 — chase-camera glitch fix
- Chase view now smooths the camera's offset from the vehicle, not its world position. At jet speeds or ×10, the old world-space lerp lagged past its snap distance and switched between snapping and lerping on alternate frames (jitter).
- `applyCam` no longer changes `camera.near` while a tour is driving the camera. The two near-plane values fought each other every frame, flipping depth precision (flicker), mostly when zoomed out in chase.

## v10.85.0 — 58 cities, 23 more songs, real runways for every city, cleaner world UI
- 11 new cities (47 → 58): Buenos Aires, Bogotá, Lima, Rio de Janeiro, Santiago, Johannesburg, Cape Town, Nairobi, Casablanca, Moscow and Saint Petersburg. South America has no road link to Houston (Darién Gap), so these cities have no driving.
- Intercity take-offs and landings now use each city's longest real OSM runway. `scripts/catalog-runways.py` stores it in the catalog as `apt.rwy`, `apt.w` and `apt.ref`. Before this, `tourAirport()` built a fake runway from the catalog's centre point and heading, so planes rolled on the grass (e.g. ACC).
- World view: the Houston ‹ › rail chevrons and the bottom drive-times dock are hidden (also while away from Houston on a trip). The city card collapses like an accordion: tap its title. The state is remembered in `hts-wcard-min`.
- The cloud deck between cities is removed; Houston keeps its own sky and clouds.
- City ground texture uses anisotropic filtering to reduce shimmer at grazing angles.
- 23 more songs across pop, hip-hop, rock, Latin, country and classics. All are official uploads, checked with oEmbed, and duplicates were skipped.

## v10.84.0 — 47 cities, more songs, airport markings, lighter Houston memory
- 16 new cities (catalog 31 → 47): Beijing, Shanghai, Shenzhen, Guangzhou, Hong Kong, Atlanta, Seattle, San Francisco, Denver, Boston, Las Vegas, Phoenix, Washington D.C., Istanbul, São Paulo, Amsterdam. Packs built with `scripts/build-world-city.py` from BBBike / Geofabrik OSM extracts.
- Drive from Houston to the 8 new US cities (Atlanta, Seattle, San Francisco, Denver, Boston, Las Vegas, Phoenix, Washington D.C.). Routes come from the free public OSRM demo router (OSM data), simplified to about 35 m and stored in `public/data/world/drives.json`.
- Music: 7 Years (Lukas Graham), Seven Years (LG Malique & Lukas Graham), and LG Malique's Vision, Too Easy and Ion Know Why, plus Alan Walker's Faded. All are official YouTube uploads, checked with oEmbed, and part of the shuffle pool.
- Other-city airports: runway shoulders, threshold piano keys and touchdown bars. Airport buildings are drawn darker so they no longer read as white slabs.
- Houston OSM buildings (and the other cities' buildings): CPU copies of the vertex buffers are dropped after GPU upload (`onUpload`), freeing most of the retained `HTS_OSM_CITY` memory.

## v10.83.0 — globe and other-city fixes
- Globe and the flat land between cities use NASA Blue Marble (day) and Black Marble 2016 (night lights) imagery, public domain, bundled as `public/data/world/earth-{4k,2k}.jpg` and `night-{4k,2k}.jpg` (~1.4 MB total). Small painted stand-ins show until they load.
- Yellow arrowhead aircraft markers removed from the globe.
- ETAs over an hour read compact, e.g. `3h 49m` (the HUD font is monospaced).
- Ground flicker in other cities (Lagos, Dallas…): the far ground no longer rises to just under an embedded city's own ground, and the city ground is pushed back with polygon offset.
- Houston's ‹ › side-panel arrows and panels hide more than 60 km from Houston on intercity trips (`body.ic-away`); they had nothing to show there.

## v10.82.0 — Houston speed
- The globe is no longer built in the background 25 s after Houston opens on desktop (that froze panning/hover for a moment and used extra memory). It is built the first time you zoom far out, as on phones.
- Flight route lookups skip US private tail numbers (N123AB, never scheduled), remember misses for 30 min, and don't ask a second mirror after a 404. OpenSky is paused for 10 min after a 429. Houston start-up went from 12 failed requests to 2 in the probe.
- Probe (VM, software GL): ready in ~11 s, ~1.8k draw calls, 4.1M triangles, JS heap ~310 MB after GC.

## v10.55.0

- **Approach fix:** the final-approach steering had the cross-track sign reversed, so the plane turned *away* from the centreline, hit the 0.55 rad clamp and orbited ~1.3 km from the threshold forever (reproduced in 6 of 8 Surprise-me tours with a headless `HTS_TOUR.update` loop). Now `rw.hd - xt*k`.
- **No orbiting the fix:** `toFaf` uses a fixed final-approach fix (5.5 km jet / 3.8 km prop after a landmark orbit) and joins final inside 1.3 turn radii of it, or anywhere on the extended centreline heading in. The old `distToRw < 2800` shortcut that bounced back into final is gone.
- **Lining up:** if final starts within 1.8 km of the runway and not lined up, the plane flies back out to the fix instead of circling. If final still is not lined up after 360 s, a watchdog falls back to the existing go-around / plant path.
- **Music:** 69 more official, oEmbed-verified uploads: 33 Afrobeats, plus pop, hip-hop (incl. Houston: Don Toliver, Paul Wall, Megan Thee Stallion), country, gospel, Latin (incl. Selena), electronic and rock.
- SW cache `hts-shell-v204`.

## v10.54.0

- **Taxi to park:** `createHoustonAirports` now builds a routing graph from the OSM taxiway centrelines (`taxiRoute`, multi-source Dijkstra; vertices behind the aircraft are penalised so it never U-turns on the runway). `taxiToPark` tries the five closest apron spots and keeps the shortest route. The route is drawn as a dashed green "follow-the-greens" lane (one unlit mesh, visible at night) and the aircraft follows it with look-ahead steering, slowing for corners and the stop. The lane clears on parking, a new departure or leaving the tour. Routing takes ~0–14 ms once per landing; 19 of 20 runway-end tests at Houston airports found a route (the other falls back to taxiing straight to the spot).
- **Landing:** the glide path aims at the touchdown zone (200 m past the threshold for jets, 120 m for props). The flare starts around 30 ft (jets) / 20 ft (props) and is flown on sink rate, so the wheels touch at ~100 fpm about 170–270 m past the threshold. Touchdown is only when the wheels reach the runway — no more snapping down from up to 30 m or sideways onto the centreline. Rollout keeps the nose up for ~2 s, then brakes progressively (and harder only if the runway end is close).
- **Music:** 38 more Afrobeats songs (official uploads checked with YouTube oEmbed); removed "Unavailable"; fixed "Last Last" (was a Taylor Swift video) and a "Rush" that was actually Nickelback.

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


## v10.58.0

- **Clouds:** `cloudTexture()` rebuilt. Each cumulus is now ~400 small, low-alpha soft puffs scattered inside a wide, lumpy dome profile with 2–3 random towers, so there are no readable round bubbles or chevron silhouettes. Sun-lit crowns, blue-grey shading toward a soft flat base. Still generated once at startup (no per-frame cost).
- **Radio / music UX:** the orange **Radio** button is now an on/off toggle (it used to skip to the next station). While the radio is on, the same ⏮ ⏭ buttons as YouTube change the station. Only one source plays at a time: turning the radio on stops YouTube, and starting any YouTube song (Auto ▶, ⏮ ⏭, picking a song) turns the radio off. ■ stops both.

## v10.59.0

- **Live flights — landing gear:** gear is retracted in cruise; it is shown only on the ground / initial climb (< 400 ft) or on a descending final approach (arrival corridor or sinking > 300 fpm below 2,200 ft). Was: any aircraft under 2,800 ft.
- **Spotify:** opening the Spotify embed called Music-off, which hid the whole music panel (`#tourYt` without `.on` is `display:none`), so the player was invisible. The panel now stays open in `.spot` mode, the YouTube video area is hidden, the radio stops, and in the car dashboard the embed uses Spotify's compact 80 px player. Starting a YouTube song closes Spotify. Full songs need a Spotify login in the browser; otherwise Spotify serves 30-second previews.
- **Tour car lanes:** route points now carry lane count, lane width and the right-hand normal. The car starts in a middle/right lane, passes slower traffic when the next lane is clear, moves back right afterwards, and moves right in time for exits and the destination. Manual lane change: **◀ Lane / Lane ▶** buttons in the tour HUD, or ← / → (A / D) keys.
- **Arrival parking:** tour and route-planner routes now end on the nearest street/arterial within ~900 m of the place (never a freeway mainline or ramp), and the car pulls over to the curb before stopping. The arrival note gives the street and distance to the place.
- **Freeway rendering:** larger height separation between road classes (motorway 0.30 m, trunk 0.26, ramps 0.19–0.22, primary 0.14) so mainlanes, ramps and frontage roads no longer z-fight where OSM carriageways overlap; mitre stretch at sharp vertices capped at 1.4× (was 2×) to stop spiky, non-straight edges.
- **Arrival parking (root cause):** a tour that starts before the streets around the destination have streamed in could only find freeway carriageways there, so the route ended on the freeway (Daikin Park → Eastex Freeway). The tour now waits up to ~9 s for local streets near the destination before routing, and, as a backup, re-plans the last stretch once within 3 km (`fixFinalLeg`): the car takes the exit and parks on the nearby street.
- **Spotify playback:** the player now uses Spotify's free official iFrame API (`open.spotify.com/embed/iframe-api/v1`, no key/account on our side) and calls `play()` once ready, falling back to the plain embed if the API can't load. It sits above the song title; in the car dashboard the genre row hides so the 80 px player fits. Full tracks need the user to be logged in to Spotify in the browser; otherwise Spotify plays 30-second previews.
- **Road shimmer:** each OSM way gets a tiny stable height lift (6–54 mm) so overlapping parallel carriageways no longer z-fight.

## v10.60.0
- **Freeways restored:** `src/render/houston-roads.js` is back to its v10.58.0 version exactly (no per-class height changes, mitre cap or per-way lift). The v10.59.0 tweaks also changed the carriageway frames the traffic and tour cars drive on, which made freeways look bent and overlapping.
- **Lane changes stay on the road:** the tour car's lateral offset is measured from the route's lane line, which jumps whenever the road changes (e.g. a 5-lane freeway onto a 1-lane ramp). The old offset slid back over several seconds, leaving the car up to ~15 m off the ramp. It now re-targets instantly at each road change and is always clamped to the paved lanes (curb parking may shift at most 1.4 m). Sharp-bend mitre factors are capped so the offset can't grow at corners.

## v10.61.0
- **Night roads look like asphalt again:** the night lighting no longer tints every road surface brown/orange (the old "warm corridor wash"). Asphalt now darkens to a neutral grey, so the grain stays visible, and only the streetlight pools are warm. Lane paint at night was darkened to 8–12 % of its day brightness, which made it vanish on the asphalt; it now stays at ~40 %, like retroreflective paint.
- **Daytime freeways:** motorway/trunk asphalt is a slightly darker neutral grey (it read as pale concrete), so white lane dashes stand out like the reference photos. Geometry is unchanged from v10.58.0.
- **Streetlights off the pavement:** poles are tested against a 24 m grid of every carriageway (major net + streamed local tiles) and skipped if they would stand on any road surface (frontage roads, ramps, the other direction, cross streets). Twin-arm median poles only on wide two-way motorways; trunk roads get verge poles.
- **Celebrations (`src/fx/celebrate.js`):** Auto/On/Off (right panel → Celebrations). Auto lights the night sky on Jan 1 ("Happy New Year from Ejay Gabriel", also from 22:00 on Dec 31), Dec 9 ("Happy Birthday Ejay Gabriel") and Dec 25 ("Merry Christmas"): coloured light strands across the sky, a glowing greeting and fireworks (rockets, bursts, rings). Optional custom greeting replaces the default text. Firework sound is synthesized with Web Audio (whistle, boom delayed by distance, crackle), toggleable.
- **Songs:** Choosin' Texas (Ella Langley), Solar Eclipse (Drake, Don Toliver), Met You (Carter Efe ft. Taylor Jasmine), FOLA: you, it's over, treat u right, who does that?, Lost, Very Soon. All checked playable/embeddable on YouTube.

## v10.62.0
- **Lane paint on every divided road:** one-way carriageways (divided roads) and any road ≥ 9 m wide now get white/yellow edge lines; when OSM has no `lanes=` tag the lane count is inferred from the paved width, so dashed lane lines appear too.
- **Asphalt a touch darker** with finer, lower-contrast grain.
- **Streetlights** stand 2 m off the pavement edge and are skipped within 1.2 m of any carriageway.

## v10.63.0
- **No manual lane controls in car tours:** removed the ◀ Lane / Lane ▶ buttons and the ←/→, A/D lane keys. The tour car changes lanes only by itself (slow car ahead, exit coming up), stays centred in its lane, and at the destination pulls at most 1 m toward the curb (was 1.4 m) so it stays clear of the streetlights.

## v10.64.0
- **Tour car centred in its lane:** traffic/route lanes now use the same lane count the renderer paints (one-way carriageways without `lanes=` are inferred from width in both), so the car follows the painted lane centre. The destination curb pull-over (up to 1 m past the kerb-side lane centre, which put the car on the edge line next to the poles) is removed: the car stops centred in the kerb-side lane.

## v10.65.0
- **Both sides of a divided road are the same width:** OSM maps each direction as its own one-way way, often with different `width`/`lanes` tags, so one side drew wider. `harmonizeDivided()` (houston-roads.js) pairs the two carriageways (same name/ref and class, opposite direction, ≤ 45 m apart) per load batch and gives both the wider width and the larger lane count. The records are shared, so traffic lanes, the tour route and streetlights match the painted road.

## v10.66.0
- **Celebration greeting no longer under the compass:** the sky message was fixed ~20° above the horizon, so with the camera tilted down it landed behind the compass and location pill at the top of the screen. It is now kept between 10% and 34% above screen centre (projected each frame), always clear of the top HUD.

## v10.67.0
- **Realistic fireworks:** rockets climb with a sparking gold tail and burst at 320–700 m (1.1–2.6 km away, 200–300 m across) into real shell types (peony with optional pistil, chrysanthemum, gold willow, tilted ring, crackle, glitter strobe, crossette, palm), with an occasional salvo. Stars break as an even sphere, start white-hot and cool to their colour, slow under air drag, sag under gravity and fade out smoothly (no random per-frame flicker). Trails and glitter are separate short-lived sparks; each burst has a brief flash. Sparks are drawn by a small shader (hot core + soft halo, sized in metres), the update is capped at 50 ms steps and only walks live slots. Crackle shells crackle in sync with their sound.

## v10.68.0
- Welcome tour: removed the obsolete "Sixteen metros" step (Houston only).
- Roads: where two OSM ways of one road meet with different widths, both ends blend to the mean width over a 25 m+ taper, so edge/lane lines no longer jump sideways.
- Radio: Radio button toggles on/off without closing the player; ⏮ ⏭ change station while radio is on; stale play()/error callbacks no longer skip the new station; ■ closes radio mode. One source at a time (YouTube / radio / Spotify).
- Car dashboard: wider nav screen in the centre with the speed-limit sign inside it, round air vents, red button LEDs, recessed media dock on the passenger side (player docks there in driver view). At night the nav screen and LEDs glow; headlight road pools/spots stay on in driver view.
- Jet cockpit: two control yokes, centre pedestal with thrust levers, glareshield annunciators, side-console knobs and push-buttons; HDG readout moved into the PFD.
- Stadiums: 81 Houston-area stadiums from local OSM (TDECU, Rice, Shell Energy, Constellation Field, ISD stadiums…) as procedural bowls/bleachers with light masts; sports POIs added (TDECU, Fertitta Center, Rice Stadium, Schroeder/Reckling Park, Constellation Field, NRG Arena, TSU H&PE Arena, ISD stadiums).

## v10.69.0
- Car dashboard: the whole steering wheel is visible (dash viewBox extended to y 440, wheel scaled 0.78), with the driver's hands at ten-and-two turning with it. Dash height scales with width (max(min(38vw,52vh),min(30vh,260px))) so the passenger-side media dock stays on screen on laptops and iPads.
- Tour start: the car starts on the nearest road to you (any road within 450 m) instead of the nearest major road within 18 km, which sent every trip from some homes onto FM 1464 first.
- Horn: Horn button in the car HUD and N key; the tour car also honks once when a slower car cuts in close ahead.
- Celebrations: Ejay's birthday removed from Auto (type any greeting and set On); fireworks launch across a wider arc of the sky, more often, with bigger salvos.
- Helicopter: rotor blades are see-through with a faint blur disc (stronger in the cockpit view) instead of strobing solid sticks; new heli cockpit eye point under the canopy. Traffic helicopters now use the detailed Bell 407 body instead of the old sphere-and-box model, and their rotors spin flat (they used to spin on the wrong axis).
- Attraction pins: each badge is a map pin whose tip sits on the place (it used to float 34 m up, so it looked offset when the camera tilted). 20 hard-coded Houston places moved to their OpenStreetMap position (checked by name against the local OSM extract), e.g. Graffiti Park (was 7 km off), Big Rivers Waterpark, George Observatory, Houston Botanic Garden, Armand Bayou, Levy Park. Pin categories use Houston names (Daikin Park = venue, Galleria = shopping).
- Car HUD "Now on" card moved to the bottom-left so it no longer covers the steering wheel.

## v10.70.0
- Car dashboard rebuilt for wide screens: SVG now scales with `meet` instead of `slice`, so nothing is cropped. Steering wheel and gauges moved to the left (driver side), driver hands removed, speed-limit sign always inside the frame, and the car's hood is drawn below the windshield.
- Spotify: tapping the Spotify tab again keeps the player open (only ■ closes it).
- Helicopters no longer use runways: tour helis lift vertically from the start point, cruise point-to-point at ~300 m, slow down over the destination and descend vertically to land (phases heliLift → heliCruise → heliLand → heliDown → heliParked).
- Airliner face: slightly drooped nose with a dark wrap-around cockpit windscreen, centre post and grey radome tip (was a plain white egg).
- Camera can zoom down to street level (min radius 10 m in metre mode, was 55 m).
- Music: 61 more checked YouTube tracks (popular pop/hip-hop/rock/electronic/Latin/Afrobeat/country and 30+ gospel/worship songs: CeCe Winans, Hillsong UNITED, Lauren Daigle, Marvin Sapp, Moses Bliss, Dunsin Oyekan, Travis Greene, Tim Godfrey, Frank Edwards, Ada Ehi…).
- Stability: removed a duplicated 2-minute GPS weather poll.
- Car "Now on" card moved to the top-right of the windshield so it no longer covers the left-hand steering wheel (drag/Reset still work).
- Faster loading on slow devices: the road-mesh builder now grows its per-slice time budget (18 → up to 90 ms) when frames are long, instead of building in fixed 18 ms slices; on the VM's software GPU the major-road build took ~171 s before this change.

## v10.71.0
- Car horn moved onto the steering-wheel hub (tap/click the logo; N key still works); Horn button removed from the tour panel.
- Speed-limit sign moved to the far left of the dash; Now-on card now sits inside the centre-stack nav tablet by default (drag/Reset still work).
- Dash media player: video fills the player box (no drifting/letterboxed area).
- Jet cockpit: thinner windshield pillars and no tinted side panes, so more of the forward view shows.
- Landing: rollout braking now targets the runway end with a 5 m floor (was 30 m) and the plane stops before the last 25 m, so it can't roll off the runway.
- Houses: the street-occupancy check now includes the 8 neighbouring tiles' streets, so houses near a tile edge no longer land on a street.

## v10.72.0
- Helicopter exterior rebuilt as a Bell 206 JetRanger-style airframe: egg cabin with big wrap-around glass nose + chin windows, white lower belly band (accent colour if picked), engine fairing + exhaust, slim boom with stabiliser endplates and upper/ventral fin, tall skids with upturned toes, 2-blade main rotor and 2-blade tail rotor (now spinning on the correct axis). Traffic helicopters use the same model.
- Heli cockpit: removed the pitot tube that showed as a white bar in front of the pilot's view; centre windshield post is thinner.

## v10.73.0
- Plane tours now ask for the aircraft first (Tour Houston → By plane → Aircraft): Boeing 737-800, 747-8, 777-300ER, 787-9, Airbus A320neo, A350-900, A380, Cessna 172, C-130, F-16, Bell 206 helicopter. Start tour / Free flight refuse until one is chosen.
- Fixed-wing aircraft depart from an airport runway long enough for the type (widebodies need ~2.7–3 km, so they use IAH-class runways; a too-short pick is replaced and the note says why). The helicopter hides the airport pickers and lifts off from your location.
- New airliner families built from real length/span/fuselage ratios: engine count and size, 747 upper-deck hump, A380 double deck, winglets/sharklets/raked/curved tips, tandem main gear on widebodies. Tour plane, live/simulated traffic (mapped from ICAO type codes) and IAH gate fleet all use them.
- In-tour aircraft buttons removed (the aircraft is chosen before the flight); the panel title shows the aircraft name. Jet cockpit and wing cameras follow each model's nose and span.

## v10.81.0 — Hours in ETAs, Drive to Houston in the tour car

- `fmtDur()` in `src/tour.js`: tour ETAs over 59 min read `1 h 05 min`, `12 h 40 min` (car and plane, tour panel and dash).
- World-city card **Drive to Houston** (US, Canada, Mexico cities): `window.HTS_INTERCITY_DRIVE(cityId)` in `src/app-main.js` closes the world view and starts the Houston car tour on the reversed real-highway route (`opts.icRev`, `icJoinRev()` in `src/tour.js`) to downtown Houston. The highway mesh stops where Houston's own roads begin. The old plain world-city car is no longer used from the card.
- Intercity car ETA no longer applies Houston's rush-hour factor on the open highway (Austin → Houston ≈ 2 h 45 min at the limit instead of 3 h 16 min).
- Checked all 31 `public/data/world/<id>.json` packs on dev and preview: all return 200 and have roads, water, parks, buildings and runways.

## v10.80.0 — Intercity cruise: sky follows the plane, night ground and clouds

- `skyRoot` (sky dome, stars, sun, clouds) now centres on the tour camera whenever a tour is on. Before, it stayed at the Houston orbit target, so after leaving Houston airspace the dome was left behind and showed as a pale band on the horizon.
- Intercity ground shader: moonlight floor (land never goes pure black), ocean swell pattern that slides past, and the globe's city-lights texture (`nightTexture`, now exported from `src/world/globe.js`) added at night (`nightK` from scene light).
- Cloud deck: a quarter of the puffs form a cirrus layer at 9.2–11.8 km, so jets at cruise pass through it; clouds keep a moonlit minimum brightness at night.

## v10.79.0 — Real intercity distance/ETA, cruise clouds, world compass and arrows

- Tour HUD on intercity flights: miles to go are real great-circle miles from the plane to the destination airport (`icRealLeft` in `src/tour.js`, destination lat/lng passed as `world.tll` from `src/app-main.js`). Houston → Tokyo now starts at ~6,664 mi instead of 778 mi.
- ETA = remaining real distance ÷ current ground speed (480 kt jets / 260 kt props in cruise) + approach time. No hidden time-lapse; ×2/×4/×10 are the only speed-ups.
- Cruise: a world-fixed cloud deck (`intercityClouds`, 180 instanced puffs, 1.7–4.3 km up) slides past under the plane between cities; intercity ground uses polygon offset instead of `depthWrite:false`.
- World cities: compass is shown and turns with the view; ‹ (left) shows/hides the trip HUD, › (right) the city card (Fly / Drive / Airport).
- World-city driving: drag orbits the chase camera around the car, wheel/pinch zooms (0.3×–8×).
- Checked with probes: AUS landing lines up on runway 36 (cross-track 0 m from 4,400 m out), touches down ~300 m past the threshold and stops at 740 m of 3,730 m; HND take-off starts on the 16L/34R centreline (cross-track 0 m).

## v10.78.0 — Drive to other cities, sharper globe night lights

- **Tour Houston → By car → Drive to another city:** Austin, Dallas, San Antonio, New York, Los Angeles, Chicago, Miami, Toronto, Vancouver, Mexico City, Cancún, Guadalajara. Same tour car, dashboard, nav tablet, music/radio, cruise buttons and camera views.
  - Route = Houston streets from your start to the edge of Houston's road map, then the real OSM motorway/trunk route (`public/data/world/drives.json`, built from the Geofabrik Texas extract with `osmium`; beyond Texas the route follows interstate waypoints).
  - The intercity highway is drawn on the flat map: two carriageways with lane paint, yellow/white edge lines, grass median, shoulders and roadside trees (`src/intercity.js` `buildHighway`). The destination city loads in ahead of you and the car stops downtown.
  - Distance and ETA use real road miles (`rr` per route point; map metres per real metre `k`).
  - The location chip shows the nearby world city or "Between cities · <city> in N mi" outside Houston.
- **Globe night lights:** small bright cores, highway spokes and 1 px street-grid specks replace the wide blurry orange patches.
- **Jet cockpit:** the glass-cockpit panel (EICAS / PFD / ND) is about a third shorter so it no longer covers the windshield.
- **Rail ‹ › chevrons:** hidden in the world view, where the Houston panels they open are hidden.
- **Intercity flights** keep the Houston plane tour (same cockpit, music, radio, views); "Land at" shows the destination airport.

## v10.77.0 — World flights fixed: Houston departures from the real Houston map, chase camera everywhere, planes worldwide
- Flying to another city from Tour → By plane now uses the normal Houston plane tour (same aircraft, cockpit, music, IAH runway); after climb-out the flight continues over the globe.
- Tour → By plane → "Fly to another city" no longer needs a Houston destination: Start tour climbs out of IAH on the great-circle heading towards that city, and the tour panel's Land at shows the destination city's airport (e.g. AUS · Austin-Bergstrom), not IAH/HOU.
- Hand-over to the globe happens once the Houston tour plane is ~420 m up (or in cruise); the previous version only checked a too-narrow climb window.
- Flights into Houston no longer land on the reduced-detail Houston scene: at the end of the globe cruise the app returns to the full Houston simulator and the Houston plane tour flies the approach into IAH (same aircraft, cockpit, music, ground crew).
- "Land at" switches to the destination city's airport when a world city is picked.
- City packs (e.g. Austin): if the first request fails (stale cached 404 or offline miss) the app retries once from the network before showing an error.
- The Houston airliner model now faces down the runway on world take-offs and landings (it was sideways).
- Drag swings the chase camera around the aircraft and scroll zooms in/out during take-off, cruise and landing, like the Houston plane tour.
- The globe keeps every city's live aircraft feed (planes show worldwide), plus scheduled intercity flights between the catalog airports.

## v10.76.0 — One map: Houston zooms straight out into the globe
- The globe is no longer a separate screen: it draws on the Houston canvas with the same controls. Keep zooming out of Houston and the view continues up into the globe; zoom back down near Houston and you land back in the full simulator. The globe button plays the same zoom-out.
- Houston-only panels hide while you are over the globe or another city; the bottom dock and music player stay.
- Tour → By plane → "Fly to another city": the aircraft you picked takes off from IAH and flies to any world city; every city's "Fly to…" lists Houston too.
- World flights use the Houston tour airliner model and the same glass cockpit (C). Over the globe the camera chases the real aircraft (no icon); drag to look around it, scroll to move closer or further.
- World cities get suburbs like Houston: houses with roofs along residential streets outside the downtown core, street trees, porch glow at night. No cars or people.
- Globe textures capped at 4096 px (2048 on phones) and built from a tiled noise pattern, which fixes the black/crashing globe on some GPUs; the globe is prepared in idle time so the zoom-out doesn't pause.

## v10.75.0 — World map: 31 cities on one globe, airport-to-airport flights, driving in the Americas
- New **World** button (globe icon above the toll-roads button), or keep scrolling out past the Houston outline: a 3D globe with the real sun terminator, night lights, drifting clouds and atmosphere (Natural Earth 1:50m land, public domain).
- 31 cities: Houston (full simulator), Austin, Dallas, San Antonio, New York, Los Angeles, Chicago, Miami, Toronto, Vancouver, Mexico City, Cancún, Guadalajara, Lagos, Accra, Cairo, Rome, London, Paris, Madrid, Berlin, Dubai, Tokyo, Seoul, Singapore, Bangkok, Manila, Mumbai, New Delhi, Sydney, Melbourne (`src/world/catalog.json`).
- Each city label shows live temperature; the city card shows local time, weather, wind, main airport and live aircraft count. One batched Open-Meteo request covers every city.
- Zoom into a city (or pick it / search with `/`, ↑↓ Enter) for a lighter version of the Houston treatment: OSM 3D buildings in the core (up to 16k), motorways to streets with lane paint, rail, rivers, lakes, sea (OSM land polygons), parks, and the main airport's runways, taxiways, aprons and terminals. Sky, sun and night windows follow the city's real local time; clouds, rain and fog follow its live weather.
- Live aircraft around every city's airport from airplanes.live / adsb.lol (same free feeds as Houston), extrapolated between polls; also drawn on the globe near the focused city.
- **Fly to…**: pick a destination and airliner (737, 787, 777, 747, A320, A350, A380), take-off roll and climb from the main runway, time-lapsed great-circle cruise on the globe, then an ILS approach, flare and rollout that always stops before the runway end. C toggles chase / cockpit. Landing in Houston hands over to the full Houston simulator at IAH.
- **Drive** (Americas cities only: US, Canada, Mexico): self-driving car in the right-hand lane on the OSM road graph (junctions kept), ← → choose the next turn, ↑ ↓ speed, V driver view.
- Houston-only features stay Houston-only (departure boards, news, traffic incidents, tours). The world code loads only when opened and frees its GPU memory when you return.
- Data packs are built offline with `scripts/build-world-city.py` (osmium + shapely from BBBike/Geofabrik extracts) and `scripts/build-world-land.py`; all © OpenStreetMap contributors (ODbL), Natural Earth (public domain). No paid APIs or keys.

## v10.74.0 — University of Houston, Rice & TSU campuses; landmark positions re-audited
- Real OpenStreetMap 3D buildings for the University of Houston, Texas Southern University and Rice University campuses (1,918 footprints with OSM heights/levels: Ezekiel W. Cullen, M.D. Anderson Library, Agnes Arnold Hall, Cullen College of Engineering, Cougar Village, Baker College, Brochstein Pavilion…). Campus tiles added to `buildings.json` coverage; procedural houses/towers are suppressed there so nothing doubles up. Stadium buildings are skipped (TDECU/Rice Stadium come from the stadium layer).
- `buildings.json` is fetched with a revision query so browsers don't keep the old cached pack.
- Landmark audit against the local Houston OSM extract: moved University of Houston (search/tour pins now match the campus pin), Bellaire High School, Co-Cathedral of the Sacred Heart, Islamic Society of Greater Houston, Congregation Beth Israel, Katy Mills and Sugar Land Town Square to their OSM positions.
