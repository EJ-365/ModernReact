/**
 * San Antonio metro pack — researched freeways, districts, airports, landmarks.
 * Geometry: lat/lng; runtime converts via city origin (29.4246, -98.4951).
 */
export const SANANTONIO_ROAD_LATLNG = [
  {
    id: 'i10', name: 'Interstate 10 — West / East', short: 'I-10',
    closed: false, width: 44, lanes: 4, ff: 65, share: 1.4, baseY: 0.82, prio: 7,
    latlng: [
      [29.55, -98.75], [29.50, -98.65], [29.46, -98.55], [29.4246, -98.50],
      [29.41, -98.45], [29.40, -98.35], [29.42, -98.25], [29.45, -98.15],
    ],
  },
  {
    id: 'i35', name: 'Interstate 35 — North / South', short: 'I-35',
    closed: false, width: 44, lanes: 4, ff: 65, share: 1.45, baseY: 0.82, prio: 7,
    latlng: [
      [29.70, -98.45], [29.60, -98.48], [29.52, -98.49], [29.46, -98.49],
      [29.4246, -98.495], [29.40, -98.50], [29.35, -98.52], [29.28, -98.55], [29.20, -98.58],
    ],
  },
  {
    id: 'i37', name: 'Interstate 37 — Corpus Christi Hwy', short: 'I-37',
    closed: false, width: 38, lanes: 3, ff: 60, share: 1.0, baseY: 0.82, prio: 5.5,
    latlng: [
      [29.50, -98.45], [29.45, -98.46], [29.4246, -98.47], [29.40, -98.48],
      [29.35, -98.49], [29.28, -98.50], [29.20, -98.52],
    ],
  },
  {
    id: 'loop410', name: 'Loop 410', short: 'Loop 410',
    closed: false, width: 40, lanes: 3, ff: 60, share: 1.15, baseY: 0.82, prio: 6,
    latlng: [
      [29.55, -98.55], [29.55, -98.45], [29.52, -98.38], [29.45, -98.35],
      [29.38, -98.38], [29.35, -98.48], [29.38, -98.58], [29.45, -98.62],
      [29.52, -98.60], [29.55, -98.55],
    ],
  },
  {
    id: 'loop1604', name: 'Loop 1604', short: 'Loop 1604',
    closed: false, width: 38, lanes: 3, ff: 65, share: 1.05, baseY: 0.82, prio: 5.5,
    latlng: [
      [29.65, -98.55], [29.62, -98.40], [29.55, -98.30], [29.42, -98.28],
      [29.30, -98.35], [29.25, -98.50], [29.30, -98.65], [29.42, -98.72],
      [29.55, -98.68], [29.65, -98.55],
    ],
  },
  {
    id: 'us281', name: 'US-281 — McAllister Freeway', short: 'US-281',
    closed: false, width: 36, lanes: 3, ff: 55, share: 0.95, baseY: 0.82, prio: 5,
    latlng: [
      [29.65, -98.48], [29.58, -98.48], [29.52, -98.485], [29.48, -98.49],
      [29.45, -98.49], [29.4246, -98.49],
    ],
  },
  {
    id: 'us90', name: 'US-90 — West Side', short: 'US-90',
    closed: false, width: 34, lanes: 3, ff: 55, share: 0.85, baseY: 0.82, prio: 4.5,
    latlng: [
      [29.42, -98.70], [29.42, -98.60], [29.42, -98.52], [29.42, -98.48], [29.42, -98.40],
    ],
  },
];

export const SANANTONIO_DISTRICTS = [
  { id: 'downtown', n: 'Downtown', lat: 29.4246, lng: -98.4951, r: 320 },
  { id: 'alamodistrict', n: 'Alamo District', lat: 29.4259, lng: -98.4861, r: 200 },
  { id: 'kingwilliam', n: 'King William', lat: 29.4145, lng: -98.4920, r: 220 },
  { id: 'southtown', n: 'Southtown', lat: 29.4100, lng: -98.4900, r: 240 },
  { id: 'pearl', n: 'Pearl District', lat: 29.4435, lng: -98.4800, r: 220 },
  { id: 'medical', n: 'Medical Center', lat: 29.5080, lng: -98.5780, r: 300 },
  { id: 'utsa', n: 'UTSA', lat: 29.5830, lng: -98.6190, r: 280 },
  { id: 'stoneoak', n: 'Stone Oak', lat: 29.6400, lng: -98.4900, r: 340 },
  { id: 'alamoheights', n: 'Alamo Heights', lat: 29.4820, lng: -98.4670, r: 240 },
  { id: 'olmospark', n: 'Olmos Park', lat: 29.4780, lng: -98.4860, r: 200 },
  { id: 'terrellhills', n: 'Terrell Hills', lat: 29.4800, lng: -98.4470, r: 220 },
  { id: 'newbraunfels', n: 'New Braunfels', lat: 29.7030, lng: -98.1240, r: 420 },
  { id: 'schertz', n: 'Schertz', lat: 29.5520, lng: -98.2700, r: 360 },
  { id: 'boerne', n: 'Boerne', lat: 29.7940, lng: -98.7320, r: 380 },
  { id: 'helotes', n: 'Helotes', lat: 29.5780, lng: -98.6900, r: 300 },
  { id: 'leonvalley', n: 'Leon Valley', lat: 29.4950, lng: -98.6190, r: 260 },
  { id: 'converse', n: 'Converse', lat: 29.5180, lng: -98.3160, r: 300 },
  { id: 'universalcity', n: 'Universal City', lat: 29.5480, lng: -98.2910, r: 280 },
  { id: 'lackland', n: 'Lackland AFB area', lat: 29.3840, lng: -98.5810, r: 320 },
  { id: 'fortsam', n: 'Fort Sam Houston', lat: 29.4620, lng: -98.4410, r: 300 },
  { id: 'westside', n: 'Westside', lat: 29.4200, lng: -98.5600, r: 340 },
  { id: 'eastside', n: 'Eastside', lat: 29.4200, lng: -98.4400, r: 300 },
];

export const SANANTONIO_AIRPORTS = [
  {
    id: 'sat', code: 'SAT', name: 'San Antonio International',
    lat: 29.5337, lng: -98.4698, rot: 0.15, intl: true, runLen: 580,
    city: 'San Antonio', elev: '809 ft',
    note: 'Primary SA hub · Southwest / American / Delta',
    addr: '9800 Airport Blvd, San Antonio, TX 78216',
  },
  {
    id: 'ssf', code: 'SSF', name: 'Stinson Municipal',
    lat: 29.3370, lng: -98.4711, rot: -0.2, intl: false, runLen: 360,
    city: 'San Antonio', elev: '577 ft',
    note: 'Historic GA field south of downtown',
    addr: '8535 Mission Rd, San Antonio, TX 78214',
  },
];

export const SANANTONIO_POIS = [
  { id: 'poi_alamo', n: 'The Alamo', lat: 29.4259, lng: -98.4861, r: 240 },
  { id: 'poi_tower', n: 'Tower of the Americas', lat: 29.4191, lng: -98.4836, r: 260 },
  { id: 'poi_alamodome', n: 'Alamodome', lat: 29.4169, lng: -98.4789, r: 280 },
  { id: 'poi_frostcenter', n: 'Frost Bank Center', lat: 29.4270, lng: -98.4375, r: 280 },
  { id: 'poi_riverwalk', n: 'River Walk', lat: 29.4230, lng: -98.4880, r: 300 },
  { id: 'poi_pearl', n: 'The Pearl', lat: 29.4435, lng: -98.4800, r: 240 },
  { id: 'poi_mission', n: 'Mission San José', lat: 29.3624, lng: -98.4796, r: 260 },
  { id: 'poi_utsa', n: 'UTSA Main Campus', lat: 29.5830, lng: -98.6190, r: 300 },
  { id: 'poi_market', n: 'Market Square', lat: 29.4250, lng: -98.4980, r: 220 },
  { id: 'poi_hemisfair', n: 'Hemisfair', lat: 29.4195, lng: -98.4850, r: 240 },
  { id: 'poi_frostridge', n: 'Frost Bank Tower', lat: 29.4275, lng: -98.4925, r: 220 },
  { id: 'poi_convention', n: 'Henry B. González Convention Center', lat: 29.4205, lng: -98.4830, r: 240 },
];

export const SANANTONIO_HOTSPOTS = [
  { lat: 29.4246, lng: -98.4951, r: 400, k: 0.55, name: 'Downtown' },
  { lat: 29.46, lng: -98.49, r: 360, k: 0.42, name: 'I-35 · Downtown Loop' },
  { lat: 29.50, lng: -98.55, r: 340, k: 0.40, name: 'Medical Center' },
  { lat: 29.53, lng: -98.47, r: 320, k: 0.38, name: 'SAT Airport approach' },
  { lat: 29.55, lng: -98.45, r: 360, k: 0.40, name: 'Loop 410 · North' },
];

export const SANANTONIO_CORRIDORS = [
  { road: 'i35', label: 'I-35 · New Braunfels', aLat: 29.70, aLng: -98.45, bLat: 29.4246, bLng: -98.4951, realMi: 28, typMin: 35, minMin: 28, maxMin: 70, toDt: true },
  { road: 'i10', label: 'I-10 · West Side', aLat: 29.50, aLng: -98.70, bLat: 29.4246, bLng: -98.4951, realMi: 16, typMin: 22, minMin: 16, maxMin: 45, toDt: true },
  { road: 'us281', label: 'US-281 · Stone Oak', aLat: 29.64, aLng: -98.48, bLat: 29.4246, bLng: -98.4951, realMi: 18, typMin: 28, minMin: 20, maxMin: 55, toDt: true },
  { road: 'loop410', label: 'Loop 410 belt', aLat: 29.55, aLng: -98.45, bLat: 29.38, bLng: -98.48, realMi: 14, typMin: 20, minMin: 14, maxMin: 40, toDt: false },
  { road: 'i37', label: 'I-37 · South', aLat: 29.28, aLng: -98.50, bLat: 29.4246, bLng: -98.4951, realMi: 12, typMin: 18, minMin: 12, maxMin: 35, toDt: true },
];

export const SANANTONIO_JUMP_GROUPS = [
  { label: 'Central', options: [
    ['downtown', 'Downtown'], ['alamodistrict', 'Alamo District'], ['pearl', 'Pearl'],
    ['kingwilliam', 'King William'], ['southtown', 'Southtown'], ['medical', 'Medical Center'],
  ]},
  { label: 'North / West', options: [
    ['stoneoak', 'Stone Oak'], ['utsa', 'UTSA'], ['alamoheights', 'Alamo Heights'],
    ['boerne', 'Boerne'], ['helotes', 'Helotes'],
  ]},
  { label: 'East / South', options: [
    ['schertz', 'Schertz'], ['newbraunfels', 'New Braunfels'], ['converse', 'Converse'],
    ['universalcity', 'Universal City'], ['eastside', 'Eastside'],
  ]},
  { label: 'Airports', options: [
    ['sat', 'SAT — San Antonio International'], ['ssf', 'SSF — Stinson Municipal'],
  ]},
  { label: 'Attractions', options: [
    ['poi_alamo', 'The Alamo'], ['poi_tower', 'Tower of the Americas'],
    ['poi_alamodome', 'Alamodome'], ['poi_frostcenter', 'Frost Bank Center'],
    ['poi_riverwalk', 'River Walk'], ['poi_pearl', 'The Pearl'],
    ['poi_mission', 'Mission San José'], ['poi_utsa', 'UTSA'],
  ]},
];

export const SANANTONIO_NWS = {
  counties: /\b(Bexar|Comal|Guadalupe|Wilson|Medina|Atascosa|Kendall)\b/i,
  places: /San Antonio|New Braunfels|Schertz|Cibolo|Boerne|Universal City|Converse|Live Oak|Helotes/i,
  foot: 'Official NWS alerts for San Antonio-area counties',
  empty: 'No active NWS warnings for the San Antonio metro.',
};

export const SANANTONIO_WATERS = [
  { n: 'San Antonio River', lat: 29.4240, lng: -98.4880, r: 200, tag: 'river' },
  { n: 'Olmos Creek', lat: 29.4800, lng: -98.4900, r: 120, tag: 'bayou' },
  { n: 'Leon Creek', lat: 29.5000, lng: -98.5800, r: 140, tag: 'bayou' },
  { n: 'Medina River', lat: 29.3500, lng: -98.5800, r: 180, tag: 'river' },
];

export const SANANTONIO_CAM_EXTRAS = [
  { id: 'pearl', lat: 29.4435, lng: -98.4800, radius: 300 },
];

export const SANANTONIO_SKYLINE = [
  { n: 'Frost Bank Tower', lat: 29.4275, lng: -98.4925, w: 32, d: 30, h: 175, s: 1, info: '535 ft · Downtown' },
  { n: 'Tower of the Americas', lat: 29.4191, lng: -98.4836, w: 18, d: 18, h: 210, s: 0, info: '750 ft · Hemisfair' },
  { n: 'Bank of America Plaza', lat: 29.4265, lng: -98.4910, w: 28, d: 26, h: 145, s: 2, info: 'CBD' },
  { n: 'Weston Centre', lat: 29.4280, lng: -98.4900, w: 30, d: 28, h: 130, s: 1, info: 'Downtown office' },
  { n: 'Grand Hyatt', lat: 29.4210, lng: -98.4845, w: 34, d: 30, h: 110, s: 2, info: 'River Walk hotel' },
  { n: 'Marriott Rivercenter', lat: 29.4225, lng: -98.4855, w: 36, d: 32, h: 120, s: 3, info: 'Rivercenter' },
  { n: 'Tower Life Building', lat: 29.4240, lng: -98.4935, w: 24, d: 24, h: 100, s: 0, info: 'Historic' },
  { n: 'One Riverwalk Place', lat: 29.4235, lng: -98.4895, w: 26, d: 24, h: 95, s: 1, info: 'River Walk' },
];

export const SANANTONIO_ATTRACTIONS = [
  { kind: 'tower', n: 'Tower of the Americas', lat: 29.4191, lng: -98.4836 },
  { kind: 'stadium', n: 'Alamodome', lat: 29.4169, lng: -98.4789 },
  { kind: 'arena', n: 'Frost Bank Center', lat: 29.4270, lng: -98.4375 },
  { kind: 'mission', n: 'The Alamo', lat: 29.4259, lng: -98.4861 },
  { kind: 'school', n: 'UTSA', lat: 29.5830, lng: -98.6190 },
];

export const SANANTONIO_RIVER_LATLNG = [
  [29.450, -98.485], [29.440, -98.483], [29.430, -98.486], [29.424, -98.488],
  [29.418, -98.490], [29.412, -98.492], [29.405, -98.491],
];

export const SANANTONIO_META = {
  id: 'sanantonio',
  name: 'San Antonio',
  metroName: 'Greater San Antonio',
  areaName: 'San Antonio-area',
  slogan: 'Alamo City · Texas',
  loadingSub: 'Paving South Texas freeways…',
  wxPlace: 'San Antonio · Downtown',
  freewayJumpLabel: 'Freeway level — I-35 @ Downtown',
  originLat: 29.4246,
  originLng: -98.4951,
  groundColor: 0xb8c890,
  shields: [
    { label: '10' }, { label: '35' }, { label: '37' },
    { label: '410', circle: true, small: true },
    { label: '1604', circle: true, small: true },
    { label: '281', us: true, small: true },
  ],
};
