/**
 * City-aware hazard overlays (nuclear targets, flood footprints, scenario copy).
 * Non-Houston/Austin metros must NEVER inherit Houston place names.
 */

const COASTAL = new Set([
  'houston', 'miami', 'neworleans', 'boston', 'newyork', 'seattle',
  'losangeles', 'philadelphia',
]);

const AUSTIN_NUKE = [
  { id: 'downtown', n: 'Downtown Austin CBD', short: 'Downtown', cat: 'government', w: 94, lat: 30.2672, lng: -97.7431, why: 'State capital metro core — dense employment & nightlife' },
  { id: 'capitol', n: 'Texas State Capitol', short: 'Capitol', cat: 'government', w: 96, lat: 30.2747, lng: -97.7404, why: 'Seat of Texas government — legislature, agencies, symbolism' },
  { id: 'ut', n: 'University of Texas', short: 'UT Austin', cat: 'critical', w: 82, lat: 30.2862, lng: -97.7394, why: 'Flagship research university · stadium · dense campus population' },
  { id: 'aus', n: 'AUS — Austin-Bergstrom', short: 'AUS', cat: 'transport', w: 88, lat: 30.1945, lng: -97.6699, why: 'Primary commercial airport & air-cargo gateway' },
  { id: 'edc', n: 'Austin Executive Airport', short: 'EDC', cat: 'transport', w: 62, lat: 30.3975, lng: -97.5664, why: 'Corporate / GA field northeast of metro' },
  { id: 'mabry', n: 'Camp Mabry', short: 'Camp Mabry', cat: 'military', w: 80, lat: 30.316, lng: -97.763, why: 'Texas Military Department HQ · National Guard' },
  { id: 'domain', n: 'The Domain / tech north', short: 'Domain', cat: 'economic', w: 74, lat: 30.402, lng: -97.725, why: 'Major employment / retail / tech campus cluster' },
  { id: 'tesla', n: 'Tesla Gigafactory Texas', short: 'Giga Texas', cat: 'economic', w: 86, lat: 30.221, lng: -97.618, why: 'Large manufacturing plant · critical industrial infrastructure' },
  { id: 'samsung', n: 'Samsung / NE tech', short: 'Samsung corridor', cat: 'economic', w: 78, lat: 30.35, lng: -97.48, why: 'Semiconductor & advanced manufacturing corridor' },
  { id: 'oracle', n: 'Oracle campus / waterfront', short: 'Oracle', cat: 'economic', w: 70, lat: 30.262, lng: -97.75, why: 'Large corporate campus on Lady Bird Lake' },
  { id: 'abby', n: 'ABIA cargo / Del Valle', short: 'ABIA cargo', cat: 'logistics', w: 72, lat: 30.20, lng: -97.66, why: 'Airport logistics & south-east industrial belt' },
  { id: 'zilker', n: 'Zilker / ACL grounds', short: 'Zilker', cat: 'gathering', w: 66, lat: 30.2671, lng: -97.7729, why: 'Mass-gathering park · festivals · west downtown' },
];

const HOUSTON_NUKE = [
  { id: 'downtown', n: 'Downtown CBD', short: 'Downtown', cat: 'government', w: 92, lat: 29.7604, lng: -95.3698, why: 'State & county government, financial core, dense population' },
  { id: 'shipchannel', n: 'Houston Ship Channel', short: 'Ship Channel', cat: 'energy', w: 98, lat: 29.723, lng: -95.238, why: 'Largest petrochemical port in the U.S. — refineries, terminals, pipelines' },
  { id: 'pasadena', n: 'Pasadena Refinery Row', short: 'Pasadena', cat: 'energy', w: 94, lat: 29.691, lng: -95.209, why: 'Major refinery & chemical complex along SH-146' },
  { id: 'baytown', n: 'Baytown Exxon Complex', short: 'Baytown', cat: 'energy', w: 90, lat: 29.735, lng: -94.977, why: 'One of the largest integrated refining/petrochemical sites in the world' },
  { id: 'medcenter', n: 'Texas Medical Center', short: 'Med Center', cat: 'critical', w: 88, lat: 29.706, lng: -95.398, why: "World's largest medical complex — hospitals, research, emergency infrastructure" },
  { id: 'nasa', n: 'NASA Johnson Space Center', short: 'NASA JSC', cat: 'federal', w: 85, lat: 29.559, lng: -95.089, why: 'Human spaceflight, Mission Control, federal aerospace assets' },
  { id: 'iah', n: 'IAH — Bush Intercontinental', short: 'IAH', cat: 'transport', w: 82, lat: 29.990, lng: -95.337, why: 'Primary international airport & logistics hub' },
  { id: 'hou', n: 'Hobby Airport', short: 'Hobby', cat: 'transport', w: 72, lat: 29.645, lng: -95.279, why: 'Secondary airport, military adjacency, southeast metro access' },
  { id: 'efd', n: 'Ellington Field / JRB', short: 'Ellington', cat: 'military', w: 78, lat: 29.607, lng: -95.158, why: 'Joint Reserve Base, aerospace, Coast Guard air station' },
  { id: 'nrg', n: 'NRG Park / Stadiums', short: 'NRG Park', cat: 'gathering', w: 70, lat: 29.685, lng: -95.411, why: 'Mass-gathering venue cluster — Texans, rodeo, concerts' },
  { id: 'galleria', n: 'Galleria / Uptown', short: 'Uptown', cat: 'economic', w: 75, lat: 29.740, lng: -95.461, why: 'Second CBD, Fortune-500 HQs, dense commercial core' },
  { id: 'energycorridor', n: 'Energy Corridor', short: 'Energy Corridor', cat: 'economic', w: 73, lat: 29.780, lng: -95.630, why: 'Major oil & gas corporate headquarters belt' },
  { id: 'texascity', n: 'Texas City Refineries', short: 'Texas City', cat: 'energy', w: 86, lat: 29.384, lng: -94.903, why: 'Historic refinery city — BP/Marathon/Valero complexes' },
  { id: 'clearlake', n: 'Clear Lake / NASA Strip', short: 'Clear Lake', cat: 'federal', w: 68, lat: 29.560, lng: -95.100, why: 'Aerospace contractors, federal contractors, bay access' },
  { id: 'port', n: 'Barbours Cut / Bayport', short: 'Port terminals', cat: 'logistics', w: 80, lat: 29.620, lng: -95.010, why: 'Container terminals — critical import/export infrastructure' },
];

/** Extra curated targets for metros that need stronger nuclear lists than auto-gen. */
const CITY_NUKE = {
  neworleans: [
    { id: 'cbd', n: 'CBD / Downtown', short: 'CBD', cat: 'government', w: 92, lat: 29.9511, lng: -90.0715, why: 'Central business district · dense employment' },
    { id: 'frenchquarter', n: 'French Quarter', short: 'Vieux Carré', cat: 'gathering', w: 88, lat: 29.9584, lng: -90.0644, why: 'Historic core · tourism · mass gatherings' },
    { id: 'superdome', n: 'Caesars Superdome', short: 'Superdome', cat: 'gathering', w: 90, lat: 29.9511, lng: -90.0812, why: 'Major stadium · emergency shelter history' },
    { id: 'msy', n: 'MSY — Louis Armstrong', short: 'MSY', cat: 'transport', w: 86, lat: 29.9934, lng: -90.2580, why: 'Primary commercial airport' },
    { id: 'port', n: 'Port of New Orleans', short: 'Port', cat: 'logistics', w: 94, lat: 29.9350, lng: -90.0600, why: 'Critical Mississippi River port & freight' },
    { id: 'refinery', n: 'Chalmette / St. Bernard industry', short: 'Chalmette', cat: 'energy', w: 84, lat: 29.9400, lng: -89.9700, why: 'Industrial / petrochemical fringe east of metro' },
    { id: 'lakefront', n: 'Lakefront Airport', short: 'NEW', cat: 'transport', w: 64, lat: 30.0424, lng: -90.0283, why: 'Historic GA field on Lake Pontchartrain' },
    { id: 'uptown', n: 'Uptown / University', short: 'Uptown', cat: 'critical', w: 74, lat: 29.9400, lng: -90.1200, why: 'Tulane / Loyola · dense residential' },
    { id: 'metairie', n: 'Metairie', short: 'Metairie', cat: 'economic', w: 70, lat: 29.9840, lng: -90.1520, why: 'Jefferson Parish employment / retail core' },
  ],
  miami: [
    { id: 'brickell', n: 'Brickell / Downtown', short: 'Brickell', cat: 'economic', w: 94, lat: 25.7617, lng: -80.1918, why: 'Financial core · dense high-rises' },
    { id: 'mia', n: 'MIA — Miami International', short: 'MIA', cat: 'transport', w: 92, lat: 25.7959, lng: -80.2870, why: 'Major international hub & cargo' },
    { id: 'port', n: 'PortMiami', short: 'PortMiami', cat: 'logistics', w: 90, lat: 25.7780, lng: -80.1700, why: 'Cruise & cargo gateway' },
    { id: 'southbeach', n: 'South Beach', short: 'South Beach', cat: 'gathering', w: 80, lat: 25.7820, lng: -80.1340, why: 'Tourism / mass gatherings' },
    { id: 'fll', n: 'FLL — Fort Lauderdale', short: 'FLL', cat: 'transport', w: 78, lat: 26.0726, lng: -80.1527, why: 'Secondary commercial airport' },
    { id: 'hardrock', n: 'Hard Rock Stadium', short: 'Hard Rock', cat: 'gathering', w: 72, lat: 25.9580, lng: -80.2389, why: 'Large stadium north of metro' },
  ],
};

function mapNuke(raw, geoToWorld) {
  return (raw || []).map((t) => {
    const w = geoToWorld(t.lat, t.lng);
    return { ...t, x: w.x, z: w.z, radiusMi: 2.2 + Math.sqrt(t.w) / 18 };
  });
}

function autoNukeFromPack(pack, geoToWorld) {
  const raw = [];
  const seen = new Set();
  const push = (t) => {
    if (!t || t.lat == null || t.lng == null || seen.has(t.id)) return;
    seen.add(t.id);
    raw.push(t);
  };
  for (const d of pack.districts || []) {
    const core = /downtown|cbd|midtown|center city|fidi|loop|brickell/i.test(d.id + ' ' + (d.n || ''));
    push({
      id: d.id,
      n: d.n,
      short: d.n,
      cat: core ? 'government' : 'urban',
      w: core ? 92 : 68,
      lat: d.lat,
      lng: d.lng,
      why: core ? 'Metro core / dense employment' : 'Urban / population center',
    });
  }
  for (const a of pack.airports || []) {
    push({
      id: a.id || String(a.code || '').toLowerCase(),
      n: a.name || a.code,
      short: a.code || a.name,
      cat: 'transport',
      w: a.intl ? 88 : 64,
      lat: a.lat,
      lng: a.lng,
      why: a.intl ? 'Primary commercial airport' : 'Regional / GA airfield',
    });
  }
  for (const p of pack.attractions || []) {
    const kind = String(p.kind || '');
    const n = String(p.n || '');
    if (!/stadium|arena|school|museum|port/i.test(kind + ' ' + n)) continue;
    push({
      id: 'att_' + n.replace(/\W+/g, '_').slice(0, 24).toLowerCase(),
      n,
      short: n.split(/[·\-–]/)[0].trim().slice(0, 22),
      cat: /stadium|arena/i.test(kind) ? 'gathering' : 'critical',
      w: /stadium|arena/i.test(kind) ? 78 : 66,
      lat: p.lat,
      lng: p.lng,
      why: 'Notable landmark / gathering site',
    });
  }
  return mapNuke(raw.slice(0, 14), geoToWorld);
}

function floodFromPack(pack, geoToWorld) {
  const z = (lat, lng, r, name) => {
    const p = geoToWorld(lat, lng);
    return { x: p.x, z: p.z, r, name, lat, lng };
  };
  const out = [];
  for (const w of pack.waters || []) {
    if (w.lat == null || w.lng == null) continue;
    out.push(z(w.lat, w.lng, w.r || 220, w.n || 'Waterfront'));
  }
  const river = pack.river || pack.ladyBird || pack.riverLatLng;
  if (Array.isArray(river) && river.length >= 2) {
    for (let i = 0; i < river.length; i += Math.max(1, Math.floor(river.length / 6))) {
      const [lat, lng] = river[i];
      if (Number.isFinite(lat) && Number.isFinite(lng)) out.push(z(lat, lng, 200, 'River corridor'));
    }
  }
  if (!out.length && pack.originLat != null) {
    out.push(z(pack.originLat, pack.originLng, 280, (pack.name || 'Metro') + ' core lowlands'));
  }
  return out;
}

function wildfireCellsNear(originLat, originLng) {
  /* Cluster NW / W of metro — generic inland fire weather footprint */
  return [
    [originLat + 0.12, originLng - 0.28, 340],
    [originLat + 0.22, originLng - 0.18, 300],
    [originLat + 0.05, originLng - 0.35, 280],
    [originLat - 0.08, originLng - 0.30, 260],
    [originLat + 0.18, originLng - 0.08, 300],
  ];
}

function buildScenarios(cityId, cityName, metroName, coastal) {
  const metro = metroName || cityName;
  if (cityId === 'austin') {
    return {
      hurricane: {
        title: 'Tropical remnant / flood outlook',
        cls: 'hurricane',
        status: 'Gulf tropical moisture track into Central Texas · 36–48 hr outlook. Heavy rain + flash flooding on Onion / Shoal / Walnut creeks and Lady Bird corridor. Evac/relief: I-35 N–S, MoPac, US-183, SH-71, SH-130.',
        alert: 'Tropical rain event — modeled Gulf moisture over Greater Austin. Flash-flood risk on creeks & low-water crossings. Freeways jammed outbound.',
        fly: null,
        cong: 0.5,
      },
      wildfire: {
        title: 'Wildfire outlook',
        cls: 'wildfire',
        status: 'Elevated fire weather west of Austin (Balcones / Bee Cave / Lake Travis / Dripping Springs juniper-oak). Dry fuels + SW winds. Smoke drift toward MoPac & downtown if winds W–SW.',
        alert: 'Wildfire prediction — Hill Country brush fire risk west of MoPac. Smoke reducing visibility on Loop 360, Bee Caves Rd & RM 2222.',
        fly: null,
        cong: 0.28,
      },
      flood: {
        title: 'Flood prediction',
        cls: 'flood',
        status: 'Certain inundation corridors (Memorial Day / Onion Creek–class): Lady Bird Lake shore, Onion Creek, Shoal Creek, Waller Creek, Walnut Creek, Barton Creek, Colorado River flats near AUS.',
        alert: 'Flood prediction — historic Austin flood footprints lit. Creeks, low-water crossings & riverside neighborhoods underwater. Avoid flooded roadways.',
        fly: null,
        cong: 0.48,
      },
      nuclear: {
        title: 'Nuclear blast model',
        cls: 'nuclear',
        status: 'Strategic targeting model — ranked likely ground zeros (Capitol, downtown, AUS, Camp Mabry, tech campuses). Click map for any point; rings use Glasstone W^(1/3) scaling + live wind for fallout.',
        alert: 'NUCLEAR DRILL (SIMULATED) — educational blast / thermal / fallout model. Not a real event.',
        fly: null,
        cong: 0.75,
      },
    };
  }
  if (cityId === 'houston') {
    return {
      hurricane: {
        title: 'Hurricane forecast',
        cls: 'hurricane',
        status: 'Category 2–3 Gulf track toward Galveston Bay · 36–48 hr outlook. Evacuation corridors: I-45 N, I-10 W, US-59 N. Expect surge on the Ship Channel & bayou flooding inland.',
        alert: 'Hurricane watch — modeled Gulf storm approaching Galveston / Clear Lake. Coastal surge + inland flooding risk. Freeways jammed outbound.',
        fly: null,
        cong: 0.55,
      },
      wildfire: {
        title: 'Wildfire outlook',
        cls: 'wildfire',
        status: 'Elevated fire weather NW of Houston (Katy prairie / Cypress / Magnolia pine belt). Dry fuels + SW winds. Smoke drift toward the Energy Corridor & Spring Branch.',
        alert: 'Wildfire prediction — brush / pine fire risk NW Harris & Montgomery Counties. Smoke reducing visibility on US-290 & SH-249.',
        fly: null,
        cong: 0.28,
      },
      flood: {
        title: 'Flood prediction',
        cls: 'flood',
        status: 'Certain inundation corridors only (Harvey-class): Addicks/Barker pools + releases, Buffalo/Brays/White Oak/Sims bayous, Meyerland, Greenspoint, Ship Channel surge fringe.',
        alert: 'Flood prediction — 100% likely inundation zones lit. Reservoirs, bayou corridors & historic repeat-flood neighborhoods underwater. Avoid flooded roadways.',
        fly: null,
        cong: 0.48,
      },
      nuclear: {
        title: 'Nuclear blast model',
        cls: 'nuclear',
        status: 'Strategic targeting model — ranked likely ground zeros (Ship Channel, CBD, refineries, NASA, airports). Click map for any point; rings use Glasstone W^(1/3) scaling + live wind for fallout.',
        alert: 'NUCLEAR DRILL (SIMULATED) — educational blast / thermal / fallout model. Not a real event.',
        fly: null,
        cong: 0.75,
      },
    };
  }
  const stormTitle = coastal ? 'Hurricane / tropical outlook' : 'Severe storm / flood outlook';
  const stormStatus = coastal
    ? ('Modeled tropical threat near ' + metro + ' · 36–48 hr outlook. Watch coastal surge, heavy rain, and outbound freeway congestion.')
    : ('Modeled heavy rain / severe weather for ' + metro + ' · flash-flood risk on local creeks and low-lying corridors.');
  const stormAlert = coastal
    ? ('Tropical threat — educational overlay for ' + metro + '. Coastal surge + inland flooding risk. Freeways jammed outbound.')
    : ('Severe weather / flood outlook for ' + metro + '. Low-water crossings and flood-prone corridors at risk.');
  return {
    hurricane: {
      title: stormTitle,
      cls: 'hurricane',
      status: stormStatus,
      alert: stormAlert,
      fly: null,
      cong: coastal ? 0.55 : 0.42,
    },
    wildfire: {
      title: 'Wildfire outlook',
      cls: 'wildfire',
      status: 'Elevated fire weather on the dry fringe west / northwest of ' + metro + '. Smoke may drift toward the core if winds favor it.',
      alert: 'Wildfire prediction — educational fire-weather overlay for ' + metro + '. Smoke may cut visibility on outer freeways.',
      fly: null,
      cong: 0.28,
    },
    flood: {
      title: 'Flood prediction',
      cls: 'flood',
      status: 'Modeled inundation along ' + metro + ' waterfronts, rivers, and historic low spots. Educational overlay — not a live NWS product.',
      alert: 'Flood prediction — local flood-prone corridors lit for ' + metro + '. Avoid flooded roadways.',
      fly: null,
      cong: 0.48,
    },
    nuclear: {
      title: 'Nuclear blast model',
      cls: 'nuclear',
      status: 'Strategic targeting model for ' + metro + ' — ranked likely ground zeros (downtown, airports, key landmarks). Click map for any point; Glasstone W^(1/3) rings + live wind fallout.',
      alert: 'NUCLEAR DRILL (SIMULATED) — educational blast / thermal / fallout model for ' + metro + '. Not a real event.',
      fly: null,
      cong: 0.75,
    },
  };
}

/**
 * @param {{ cityId:string, pack:any, cityName:string, metroName:string, geoToWorld:Function }} opts
 */
export function buildCityHazards(opts) {
  const cityId = String(opts.cityId || 'houston').toLowerCase();
  const pack = opts.pack || null;
  const cityName = opts.cityName || 'Houston';
  const metroName = opts.metroName || cityName;
  const geoToWorld = opts.geoToWorld;
  const coastal = COASTAL.has(cityId);

  let nukeRaw = CITY_NUKE[cityId] || null;
  if (!nukeRaw && cityId === 'austin') nukeRaw = AUSTIN_NUKE;
  if (!nukeRaw && (cityId === 'houston' || !pack)) nukeRaw = HOUSTON_NUKE;

  const nukeTargets = nukeRaw
    ? mapNuke(nukeRaw, geoToWorld)
    : autoNukeFromPack(pack, geoToWorld);

  let floodZones;
  if (cityId === 'austin') {
    const z = (lat, lng, r, name) => {
      const p = geoToWorld(lat, lng);
      return { x: p.x, z: p.z, r, name };
    };
    floodZones = [
      z(30.265, -97.772, 280, 'Lady Bird · Zilker'),
      z(30.262, -97.75, 220, 'Lady Bird · downtown'),
      z(30.250, -97.736, 200, 'Lady Bird · I-35'),
      z(30.245, -97.77, 360, 'Onion Creek'),
      z(30.22, -97.75, 300, 'Onion / South Austin'),
      z(30.20, -97.70, 280, 'Onion · Del Valle'),
      z(30.29, -97.76, 240, 'Shoal Creek mid'),
      z(30.275, -97.755, 200, 'Shoal · Pease'),
      z(30.268, -97.74, 160, 'Waller Creek'),
      z(30.35, -97.68, 280, 'Walnut Creek'),
      z(30.32, -97.70, 220, 'Walnut mid'),
      z(30.264, -97.771, 200, 'Barton Creek'),
      z(30.27, -97.80, 220, 'Barton / Lost Creek'),
      z(30.31, -97.78, 200, 'Bull Creek'),
      z(30.24, -97.72, 240, 'Riverside low'),
      z(30.21, -97.69, 260, 'AUS floodplain fringe'),
      z(30.19, -97.67, 240, 'Bergstrom low'),
      z(30.40, -97.91, 320, 'Lake Travis shore'),
    ];
  } else if (cityId === 'houston' || !pack) {
    floodZones = null; /* Houston keeps world-space constants in app-main */
  } else {
    floodZones = floodFromPack(pack, geoToWorld);
  }

  const originLat = (pack && pack.originLat != null)
    ? pack.originLat
    : (cityId === 'austin' ? 30.2672 : 29.7604);
  const originLng = (pack && pack.originLng != null)
    ? pack.originLng
    : (cityId === 'austin' ? -97.7431 : -95.3698);

  let wildfireLatLng;
  if (cityId === 'austin') {
    wildfireLatLng = [[30.31, -97.95, 360], [30.36, -97.90, 300], [30.28, -97.88, 280], [30.22, -98.02, 260], [30.41, -97.91, 320]];
  } else if (cityId === 'houston' || !pack) {
    wildfireLatLng = null; /* Houston uses world-space cells in app-main */
  } else {
    wildfireLatLng = wildfireCellsNear(originLat, originLng);
  }

  const hub = (pack && pack.airports && pack.airports[0])
    || (nukeTargets.find((t) => t.cat === 'transport'))
    || null;

  return {
    cityId,
    coastal,
    scenarios: buildScenarios(cityId, cityName, metroName, coastal),
    nukeTargets,
    floodZones,
    wildfireLatLng,
    downtownLatLng: [originLat, originLng],
    hubLatLng: hub ? [hub.lat, hub.lng] : [originLat, originLng],
    smokeOriginLatLng: wildfireLatLng ? [wildfireLatLng[0][0], wildfireLatLng[0][1]] : [originLat + 0.12, originLng - 0.25],
    floodBannerLatLng: floodZones && floodZones[0]
      ? [floodZones[0].lat || originLat, floodZones[0].lng || originLng]
      : [originLat, originLng],
    floodRibbonMode: cityId === 'austin' ? 'austin' : (cityId === 'houston' || !pack ? 'houston' : 'pack'),
  };
}

export { COASTAL, HOUSTON_NUKE, AUSTIN_NUKE };
