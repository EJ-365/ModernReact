/**
 * El Paso metro pack — Chihuahuan Desert pass city on the Rio Grande.
 * Geography: Franklin Mountains bisect west/east; I-10 follows the border corridor;
 * Loop 375 rings the metro (Transmountain / Joe Battle / César Chávez Border Hwy);
 * US-54 Patriot Freeway runs northeast; Fort Bliss + ELP sit east of the Franklins.
 * Origin: San Jacinto Plaza / Downtown 31.7619, -106.4850. Elev ~3,740 ft.
 */
export const ELPASO_ROAD_LATLNG = [
  {
    id: 'i10',
    name: 'Interstate 10 — Border / Mesa Corridor',
    short: 'I-10',
    closed: false, width: 44, lanes: 4, ff: 65, share: 1.5, baseY: 0.82, prio: 7,
    /* Las Cruces approach → Downtown pass → Eastside → Horizon City */
    latlng: [
      [31.95, -106.70], [31.90, -106.62], [31.85, -106.55], [31.80, -106.50],
      [31.7619, -106.485], [31.74, -106.42], [31.72, -106.35], [31.70, -106.28],
      [31.68, -106.20], [31.66, -106.12],
    ],
  },
  {
    id: 'us54',
    name: 'US-54 — Patriot Freeway',
    short: 'US-54',
    closed: false, width: 40, lanes: 3, ff: 60, share: 1.2, baseY: 0.82, prio: 6.5,
    /* Downtown / Five Points → Northeast → Organ Mountains approach */
    latlng: [
      [31.7619, -106.475], [31.80, -106.45], [31.85, -106.42], [31.90, -106.40],
      [31.95, -106.38], [32.00, -106.36], [32.08, -106.32],
    ],
  },
  {
    id: 'loop375n',
    name: 'Loop 375 — Transmountain / Purple Heart',
    short: 'Loop 375 N',
    closed: false, width: 36, lanes: 3, ff: 55, share: 0.95, baseY: 0.85, prio: 5.5,
    /* Canutillo / I-10 W → Smuggler’s Pass → Northeast @ US-54 */
    latlng: [
      [31.90, -106.60], [31.92, -106.52], [31.93, -106.45], [31.92, -106.40],
      [31.90, -106.36], [31.88, -106.34],
    ],
  },
  {
    id: 'loop375e',
    name: 'Loop 375 — Joe Battle Boulevard',
    short: 'Loop 375 E',
    closed: false, width: 38, lanes: 3, ff: 60, share: 1.05, baseY: 0.82, prio: 5.5,
    /* Northeast → Fort Bliss edge → Eastside → I-10 */
    latlng: [
      [31.88, -106.34], [31.84, -106.30], [31.80, -106.28], [31.76, -106.27],
      [31.72, -106.28], [31.70, -106.30],
    ],
  },
  {
    id: 'loop375s',
    name: 'Loop 375 — César Chávez Border Highway',
    short: 'Border Hwy',
    closed: false, width: 36, lanes: 3, ff: 55, share: 0.9, baseY: 0.82, prio: 5,
    /* East I-10 → riverside → Downtown bridges → West Expressway */
    latlng: [
      [31.70, -106.30], [31.72, -106.38], [31.74, -106.45], [31.755, -106.48],
      [31.76, -106.52], [31.78, -106.58], [31.82, -106.62],
    ],
  },
  {
    id: 'montana',
    name: 'US-62 / US-180 — Montana Avenue',
    short: 'Montana',
    closed: false, width: 34, lanes: 3, ff: 50, share: 0.95, baseY: 0.88, prio: 5, arterial: true,
    /* Central → Airport → Far East */
    latlng: [
      [31.78, -106.50], [31.79, -106.45], [31.80, -106.40], [31.805, -106.35],
      [31.81, -106.30], [31.82, -106.22],
    ],
  },
  {
    id: 'mesa',
    name: 'SH-20 — Mesa Street',
    short: 'Mesa',
    closed: false, width: 28, lanes: 2, ff: 40, share: 0.7, baseY: 0.9, prio: 4, arterial: true, surface: true,
    /* Westside / UTEP corridor south toward Downtown */
    latlng: [
      [31.88, -106.55], [31.85, -106.53], [31.82, -106.51], [31.80, -106.50],
      [31.78, -106.49], [31.7619, -106.485],
    ],
  },
  {
    id: 'i110',
    name: 'Interstate 110 — Downtown spur',
    short: 'I-110',
    closed: false, width: 32, lanes: 2, ff: 50, share: 0.45, baseY: 0.88, prio: 4.5,
    latlng: [
      [31.775, -106.485], [31.768, -106.485], [31.7619, -106.485], [31.755, -106.486],
    ],
  },
  {
    id: 'artcraft',
    name: 'SH-178 — Artcraft Road',
    short: 'Artcraft',
    closed: false, width: 32, lanes: 2, ff: 50, share: 0.5, baseY: 0.85, prio: 3.5,
    /* Northwest El Paso → NM 136 / Santa Teresa */
    latlng: [
      [31.90, -106.62], [31.91, -106.66], [31.92, -106.70], [31.93, -106.74],
    ],
  },
];

export const ELPASO_DISTRICTS = [
  { id: 'downtown', n: 'Downtown', lat: 31.7619, lng: -106.4850, r: 280, noHouses: true },
  { id: 'segundo', n: 'Segundo Barrio', lat: 31.7520, lng: -106.4820, r: 220 },
  { id: 'sunset', n: 'Sunset Heights', lat: 31.7720, lng: -106.5000, r: 240 },
  { id: 'kern', n: 'Kern Place', lat: 31.7880, lng: -106.5050, r: 220 },
  { id: 'utep', n: 'UTEP', lat: 31.7700, lng: -106.5050, r: 260, noHouses: true },
  { id: 'manhattan', n: 'Manhattan Heights', lat: 31.7750, lng: -106.4650, r: 220 },
  { id: 'fivepoints', n: 'Five Points', lat: 31.7800, lng: -106.4550, r: 240 },
  { id: 'northeast', n: 'Northeast', lat: 31.8600, lng: -106.4000, r: 380 },
  { id: 'eastside', n: 'Eastside', lat: 31.7800, lng: -106.3200, r: 420 },
  { id: 'fareast', n: 'Far East', lat: 31.7700, lng: -106.2200, r: 400 },
  { id: 'westside', n: 'Westside', lat: 31.8500, lng: -106.5600, r: 400 },
  { id: 'northwest', n: 'Northwest / Canutillo', lat: 31.9200, lng: -106.6000, r: 360 },
  { id: 'mission', n: 'Mission Valley', lat: 31.7000, lng: -106.3200, r: 360 },
  { id: 'ysleta', n: 'Ysleta', lat: 31.6900, lng: -106.3300, r: 300 },
  { id: 'socorro', n: 'Socorro', lat: 31.6546, lng: -106.3033, r: 340 },
  { id: 'horizon', n: 'Horizon City', lat: 31.6923, lng: -106.2075, r: 360 },
  { id: 'fortbliss', n: 'Fort Bliss', lat: 31.8200, lng: -106.3800, r: 420, noHouses: true },
  { id: 'airport', n: 'Airport / Cielo Vista', lat: 31.8072, lng: -106.3778, r: 340 },
  { id: 'sunland', n: 'Sunland Park', lat: 31.7965, lng: -106.5800, r: 300 },
  { id: 'central', n: 'Central', lat: 31.7700, lng: -106.4700, r: 260 },
];

export const ELPASO_AIRPORTS = [
  {
    id: 'elp', code: 'ELP', name: 'El Paso International',
    lat: 31.8072, lng: -106.3778, rot: 0.35, intl: true, runLen: 620,
    city: 'El Paso', elev: '3,958 ft',
    note: 'West Texas hub · Southwest / American / United · Chihuahuan Desert field',
    addr: '6701 Convair Rd, El Paso, TX 79925',
  },
  {
    id: 'bif', code: 'BIF', name: 'Biggs Army Airfield',
    lat: 31.8495, lng: -106.3800, rot: 0.3, intl: false, runLen: 560,
    city: 'Fort Bliss', elev: '3,945 ft',
    note: 'U.S. Army airfield adjoining Fort Bliss',
    addr: 'Fort Bliss, El Paso, TX 79916',
  },
];

export const ELPASO_POIS = [
  { id: 'poi_sanjacinto', n: 'San Jacinto Plaza', lat: 31.7595, lng: -106.4865, r: 200 },
  { id: 'poi_plaza', n: 'Plaza Theatre', lat: 31.7588, lng: -106.4858, r: 200 },
  { id: 'poi_utep', n: 'UTEP', lat: 31.7700, lng: -106.5050, r: 280 },
  { id: 'poi_sunbowl', n: 'Sun Bowl Stadium', lat: 31.7730, lng: -106.5080, r: 260 },
  { id: 'poi_donhaskins', n: 'Don Haskins Center', lat: 31.7770, lng: -106.5055, r: 240 },
  { id: 'poi_scenic', n: 'Scenic Drive Overlook', lat: 31.7920, lng: -106.4800, r: 240 },
  { id: 'poi_franklin', n: 'Franklin Mountains State Park', lat: 31.9000, lng: -106.4900, r: 400 },
  { id: 'poi_chamizal', n: 'Chamizal National Memorial', lat: 31.7675, lng: -106.4540, r: 240 },
  { id: 'poi_zoo', n: 'El Paso Zoo', lat: 31.7685, lng: -106.4450, r: 220 },
  { id: 'poi_southwest', n: 'Southwest University Park', lat: 31.7590, lng: -106.4935, r: 240 },
  { id: 'poi_botas', n: 'Bridge of the Americas', lat: 31.7645, lng: -106.4510, r: 240 },
  { id: 'poi_ysleta', n: 'Ysleta Mission', lat: 31.6905, lng: -106.3270, r: 240 },
  { id: 'poi_museum', n: 'El Paso Museum of Art', lat: 31.7585, lng: -106.4885, r: 200 },
  { id: 'poi_fortbliss', n: 'Fort Bliss HQ area', lat: 31.8200, lng: -106.3900, r: 320 },
  { id: 'poi_tramway', n: 'Wyler Aerial Tramway', lat: 31.8120, lng: -106.4800, r: 240 },
];

export const ELPASO_HOTSPOTS = [
  { lat: 31.7619, lng: -106.4850, r: 380, k: 0.52, name: 'Downtown / Border' },
  { lat: 31.78, lng: -106.50, r: 340, k: 0.42, name: 'UTEP / Mesa' },
  { lat: 31.81, lng: -106.38, r: 360, k: 0.40, name: 'ELP / Montana' },
  { lat: 31.85, lng: -106.40, r: 340, k: 0.38, name: 'US-54 Northeast' },
  { lat: 31.74, lng: -106.35, r: 360, k: 0.40, name: 'I-10 Eastside' },
];

export const ELPASO_CORRIDORS = [
  { road: 'i10', label: 'I-10 · Las Cruces approach', aLat: 31.95, aLng: -106.70, bLat: 31.7619, bLng: -106.4850, realMi: 22, typMin: 28, minMin: 22, maxMin: 50, toDt: true },
  { road: 'i10', label: 'I-10 · Horizon City', aLat: 31.69, aLng: -106.21, bLat: 31.7619, bLng: -106.4850, realMi: 20, typMin: 26, minMin: 20, maxMin: 45, toDt: true },
  { road: 'us54', label: 'US-54 · Northeast', aLat: 31.95, aLng: -106.38, bLat: 31.7619, bLng: -106.4850, realMi: 16, typMin: 22, minMin: 16, maxMin: 40, toDt: true },
  { road: 'montana', label: 'Montana · Far East', aLat: 31.82, aLng: -106.22, bLat: 31.7619, bLng: -106.4850, realMi: 18, typMin: 28, minMin: 22, maxMin: 48, toDt: true },
  { road: 'mesa', label: 'Mesa · Westside', aLat: 31.88, aLng: -106.55, bLat: 31.7619, bLng: -106.4850, realMi: 10, typMin: 20, minMin: 14, maxMin: 35, toDt: true },
];

export const ELPASO_JUMP_GROUPS = [
  { label: 'Central', options: [
    ['downtown', 'Downtown'], ['segundo', 'Segundo Barrio'], ['sunset', 'Sunset Heights'],
    ['utep', 'UTEP'], ['kern', 'Kern Place'], ['fivepoints', 'Five Points'],
  ]},
  { label: 'East / Mission', options: [
    ['eastside', 'Eastside'], ['fareast', 'Far East'], ['horizon', 'Horizon City'],
    ['mission', 'Mission Valley'], ['ysleta', 'Ysleta'], ['socorro', 'Socorro'],
  ]},
  { label: 'West / North', options: [
    ['westside', 'Westside'], ['northwest', 'Northwest'], ['northeast', 'Northeast'],
    ['fortbliss', 'Fort Bliss'], ['sunland', 'Sunland Park'],
  ]},
  { label: 'Airports', options: [
    ['elp', 'ELP — El Paso International'], ['bif', 'BIF — Biggs AAF'],
  ]},
  { label: 'Attractions', options: [
    ['poi_sanjacinto', 'San Jacinto Plaza'], ['poi_plaza', 'Plaza Theatre'],
    ['poi_utep', 'UTEP'], ['poi_scenic', 'Scenic Drive'], ['poi_franklin', 'Franklin Mountains'],
    ['poi_chamizal', 'Chamizal'], ['poi_botas', 'Bridge of the Americas'],
    ['poi_ysleta', 'Ysleta Mission'], ['poi_sunbowl', 'Sun Bowl'],
  ]},
];

export const ELPASO_NWS = {
  counties: /\b(El Paso|Hudspeth|Doña Ana|Dona Ana)\b/i,
  places: /El Paso|Fort Bliss|Socorro|Horizon City|Canutillo|Ysleta|Sunland Park|Anthony|Fabens|Clint/i,
  foot: 'Official NWS alerts for El Paso-area counties',
  empty: 'No active NWS warnings for the El Paso metro.',
};

export const ELPASO_WATERS = [
  { n: 'Rio Grande', lat: 31.7500, lng: -106.4900, r: 280, tag: 'river' },
  { n: 'Rio Grande · East', lat: 31.7200, lng: -106.3800, r: 240, tag: 'river' },
  { n: 'Ascarate Lake', lat: 31.7550, lng: -106.4200, r: 140, tag: 'lake' },
];

export const ELPASO_CAM_EXTRAS = [
  { id: 'scenic', lat: 31.7920, lng: -106.4800, radius: 320 },
  { id: 'franklin', lat: 31.9000, lng: -106.4900, radius: 480 },
];

/* World height ≈ real feet / 3.16 — El Paso skyline is low; Franklins dominate the silhouette */
export const ELPASO_SKYLINE = [
  { n: 'Wells Fargo Plaza', lat: 31.7590, lng: -106.4868, w: 28, d: 26, h: 96, s: 1, info: '~302 ft · Downtown office' },
  { n: 'Chase Tower', lat: 31.7585, lng: -106.4855, w: 26, d: 24, h: 88, s: 2, info: 'Downtown mid-rise' },
  { n: 'One San Jacinto Plaza', lat: 31.7598, lng: -106.4875, w: 30, d: 28, h: 82, s: 0, info: 'Plaza office tower' },
  { n: 'Plaza Hotel', lat: 31.7582, lng: -106.4860, w: 24, d: 22, h: 70, s: 3, info: 'Historic Downtown hotel' },
  { n: 'El Paso County Courthouse', lat: 31.7575, lng: -106.4885, w: 32, d: 30, h: 55, s: 1, info: 'Civic landmark' },
  { n: 'Albert Armendariz Sr. U.S. Courthouse', lat: 31.7605, lng: -106.4840, w: 34, d: 28, h: 48, s: 2, info: 'Federal courts' },
  { n: 'Downtown parking / office mid-rise', lat: 31.7610, lng: -106.4890, w: 26, d: 24, h: 52, s: 0, info: 'CBD fabric' },
  { n: 'Southwest University Park press', lat: 31.7590, lng: -106.4935, w: 40, d: 20, h: 28, s: 1, info: 'Chihuahuas ballpark' },
];

export const ELPASO_SKYLINE_POCKETS = [
  { n: 'Downtown CBD', lat: 31.7595, lng: -106.4865, count: 36, rad: 220, hmin: 28, hmax: 90 },
  { n: 'UTEP / Mesa mid-rise', lat: 31.7720, lng: -106.5020, count: 14, rad: 160, hmin: 22, hmax: 70 },
  { n: 'Airport / Montana commercial', lat: 31.8050, lng: -106.3600, count: 12, rad: 180, hmin: 18, hmax: 55 },
  { n: 'Eastside strip', lat: 31.7750, lng: -106.3000, count: 16, rad: 200, hmin: 16, hmax: 45 },
];

export const ELPASO_ATTRACTIONS = [
  { kind: 'school', n: 'UTEP', lat: 31.7700, lng: -106.5050 },
  { kind: 'stadium', n: 'Sun Bowl Stadium', lat: 31.7730, lng: -106.5080 },
  { kind: 'arena', n: 'Don Haskins Center', lat: 31.7770, lng: -106.5055 },
  { kind: 'stadium', n: 'Southwest University Park', lat: 31.7590, lng: -106.4935 },
  { kind: 'landmark', n: 'Plaza Theatre', lat: 31.7588, lng: -106.4858 },
  { kind: 'landmark', n: 'Franklin Mountains', lat: 31.9000, lng: -106.4900 },
  { kind: 'landmark', n: 'Scenic Drive Overlook', lat: 31.7920, lng: -106.4800 },
  { kind: 'mission', n: 'Ysleta Mission', lat: 31.6905, lng: -106.3270 },
  { kind: 'landmark', n: 'Bridge of the Americas', lat: 31.7645, lng: -106.4510 },
];

/* Rio Grande along the international border south of Downtown */
export const ELPASO_RIVER_LATLNG = [
  [31.82, -106.58], [31.80, -106.54], [31.78, -106.51], [31.76, -106.49],
  [31.75, -106.47], [31.74, -106.44], [31.73, -106.40], [31.72, -106.36],
  [31.70, -106.32], [31.68, -106.28],
];

export const ELPASO_META = {
  id: 'elpaso',
  name: 'El Paso',
  metroName: 'El Paso–Juárez',
  areaName: 'El Paso-area',
  slogan: 'Sun City · Pass of the North',
  loadingSub: 'Paving West Texas freeways…',
  wxPlace: 'El Paso · Downtown',
  freewayJumpLabel: 'Freeway level — I-10 @ Downtown',
  originLat: 31.7619,
  originLng: -106.4850,
  /* Chihuahuan Desert sand / scrub — warmer, drier than Central Texas */
  groundColor: 0xc4b080,
  shields: [
    { label: '10' }, { label: '54', us: true }, { label: '110' },
    { label: '375', circle: true, small: true },
    { label: '62', us: true, small: true },
  ],
};
