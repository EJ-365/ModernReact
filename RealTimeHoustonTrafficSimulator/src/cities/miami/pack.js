/** Miami metro pack — researched freeways, districts, airports, landmarks. */
export const MIAMI_ROAD_LATLNG = [
  { id:'i95', name:'I-95', short:'I-95', closed:false, width:44, lanes:4, ff:55, share:1.5, baseY:0.82, prio:7,
    latlng:[[26.05,-80.20],[25.95,-80.20],[25.85,-80.20],[25.78,-80.20],[25.76,-80.195],[25.72,-80.20],[25.65,-80.21],[25.55,-80.22]] },
  { id:'i195', name:'I-195 Julia Tuttle Causeway', short:'I-195', closed:false, width:34, lanes:3, ff:50, share:1.0, baseY:0.85, prio:6,
    latlng:[[25.815,-80.205],[25.813,-80.180],[25.812,-80.155],[25.810,-80.130]] },
  { id:'i395', name:'I-395 MacArthur Causeway', short:'I-395', closed:false, width:34, lanes:3, ff:50, share:1.05, baseY:0.85, prio:6,
    latlng:[[25.790,-80.200],[25.788,-80.175],[25.786,-80.150],[25.785,-80.130]] },
  { id:'us1', name:'US-1 / Dixie Highway / Biscayne', short:'US-1', closed:false, width:32, lanes:3, ff:40, share:1.1, baseY:0.9, prio:5.5, arterial:true,
    latlng:[[25.90,-80.185],[25.82,-80.185],[25.78,-80.190],[25.76,-80.192],[25.70,-80.240],[25.60,-80.320]] },
  { id:'palmetto', name:'SR-826 Palmetto Expressway', short:'Palmetto', closed:false, width:40, lanes:4, ff:55, share:1.15, baseY:0.82, prio:6,
    latlng:[[25.95,-80.32],[25.88,-80.32],[25.82,-80.32],[25.76,-80.32],[25.70,-80.33],[25.65,-80.35]] },
  { id:'dolph', name:'SR-836 Dolphin Expressway', short:'Dolphin', closed:false, width:38, lanes:3, ff:55, share:1.2, baseY:0.82, prio:6.5,
    latlng:[[25.795,-80.35],[25.790,-80.30],[25.788,-80.25],[25.786,-80.22],[25.785,-80.20]] },
  { id:'florida', name:'Florida\'s Turnpike', short:'Turnpike', closed:false, width:40, lanes:4, ff:65, share:1.0, baseY:0.82, prio:5,
    latlng:[[26.05,-80.35],[25.95,-80.35],[25.85,-80.36],[25.75,-80.38],[25.65,-80.40]] },
];

export const MIAMI_DISTRICTS = [
  { id:'downtown', n:'Downtown Miami', lat:25.7743, lng:-80.1937, r:280, noHouses:true },
  { id:'brickell', n:'Brickell', lat:25.7610, lng:-80.1910, r:260, noHouses:true },
  { id:'wynwood', n:'Wynwood', lat:25.8010, lng:-80.1990, r:240 },
  { id:'design', n:'Design District', lat:25.8130, lng:-80.1920, r:220 },
  { id:'littlehavana', n:'Little Havana', lat:25.7670, lng:-80.2200, r:260 },
  { id:'coconut', n:'Coconut Grove', lat:25.7270, lng:-80.2430, r:280 },
  { id:'coral', n:'Coral Gables', lat:25.7215, lng:-80.2684, r:320 },
  { id:'miamiBeach', n:'South Beach', lat:25.7820, lng:-80.1330, r:280, noHouses:true },
  { id:'midbeach', n:'Mid-Beach', lat:25.8100, lng:-80.1300, r:260 },
  { id:'northbeach', n:'North Beach', lat:25.8550, lng:-80.1220, r:260 },
  { id:'edgewater', n:'Edgewater', lat:25.8020, lng:-80.1870, r:220 },
  { id:'omni', n:'Omni / Arts', lat:25.7880, lng:-80.1900, r:220 },
  { id:'airport', n:'Airport West', lat:25.7950, lng:-80.2800, r:340 },
  { id:'doral', n:'Doral', lat:25.8195, lng:-80.3553, r:340 },
  { id:'hialeah', n:'Hialeah', lat:25.8576, lng:-80.2781, r:360 },
  { id:'kendall', n:'Kendall', lat:25.6790, lng:-80.3170, r:400 },
  { id:'homestead', n:'Homestead', lat:25.4687, lng:-80.4776, r:380 },
  { id:'aventura', n:'Aventura', lat:25.9565, lng:-80.1392, r:300 },
  { id:'fortlauderdale', n:'Fort Lauderdale', lat:26.1224, lng:-80.1373, r:400 },
  { id:'hollywood', n:'Key Biscayne', lat:25.6937, lng:-80.1628, r:260 },
];

export const MIAMI_AIRPORTS = [
  { id:'mia', code:'MIA', name:'Miami International', lat:25.7959, lng:-80.2870, rot:0.2, intl:true, runLen:680, city:'Miami', elev:'8 ft', note:'American Airlines hub · Latin America gateway', addr:'2100 NW 42nd Ave, Miami, FL 33142' },
  { id:'fll', code:'FLL', name:'Fort Lauderdale–Hollywood International', lat:26.0726, lng:-80.1527, rot:-0.1, intl:true, runLen:560, city:'Fort Lauderdale', elev:'9 ft', note:'JetBlue / Spirit focus', addr:'100 Terminal Dr, Fort Lauderdale, FL 33315' },
];

export const MIAMI_POIS = [
  { id:'poi_pano', n:'Panorama Tower', lat:25.7635, lng:-80.1915, r:240 },
  { id:'poi_af1', n:'One Thousand Museum', lat:25.7825, lng:-80.1870, r:220 },
  { id:'poi_brickellcity', n:'Brickell City Centre', lat:25.7665, lng:-80.1925, r:240 },
  { id:'poi_bayfront', n:'Bayfront Park', lat:25.7750, lng:-80.1860, r:240 },
  { id:'poi_wynwoodwalls', n:'Wynwood Walls', lat:25.8010, lng:-80.1995, r:220 },
  { id:'poi_vizcaya', n:'Vizcaya Museum', lat:25.7430, lng:-80.2105, r:240 },
  { id:'poi_hardrock', n:'Hard Rock Stadium', lat:25.9580, lng:-80.2389, r:300 },
  { id:'poi_loanDepot', n:'loanDepot park', lat:25.7781, lng:-80.2197, r:260 },
  { id:'poi_ktp', n:'Kaseya Center', lat:25.7814, lng:-80.1870, r:240 },
  { id:'poi_ocean', n:'Ocean Drive', lat:25.7800, lng:-80.1305, r:260 },
  { id:'poi_lincoln', n:'Lincoln Road', lat:25.7905, lng:-80.1360, r:240 },
  { id:'poi_port', n:'PortMiami', lat:25.7780, lng:-80.1700, r:280 },
  { id:'poi_um', n:'University of Miami', lat:25.7215, lng:-80.2793, r:280 },
  { id:'poi_jungle', n:'Jungle Island', lat:25.7850, lng:-80.1550, r:220 },
];

export const MIAMI_HOTSPOTS = [
  { lat:25.775, lng:-80.192, r:360, k:0.52, name:'Downtown / Brickell' },
  { lat:25.78, lng:-80.13, r:300, k:0.45, name:'South Beach' },
  { lat:25.80, lng:-80.29, r:320, k:0.42, name:'MIA / Dolphin' },
  { lat:25.82, lng:-80.20, r:260, k:0.38, name:'Wynwood / I-195' },
  { lat:26.07, lng:-80.15, r:280, k:0.36, name:'FLL' },
];

export const MIAMI_CORRIDORS = [
  { road:'i95', label:'I-95 · Aventura → Downtown', aLat:25.96, aLng:-80.20, bLat:25.775, bLng:-80.192, realMi:14, typMin:24, minMin:16, maxMin:50, toDt:true },
  { road:'i95', label:'I-95 · Kendall → Downtown', aLat:25.68, aLng:-80.21, bLat:25.775, bLng:-80.192, realMi:9, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'dolph', label:'Dolphin · MIA → Downtown', aLat:25.80, aLng:-80.29, bLat:25.785, bLng:-80.20, realMi:7, typMin:16, minMin:10, maxMin:35, toDt:true },
  { road:'i395', label:'MacArthur · Downtown → South Beach', aLat:25.79, aLng:-80.20, bLat:25.785, bLng:-80.13, realMi:5, typMin:14, minMin:10, maxMin:30, toDt:false },
  { road:'palmetto', label:'Palmetto · Doral → Dolphin', aLat:25.82, aLng:-80.32, bLat:25.79, bLng:-80.32, realMi:4, typMin:12, minMin:8, maxMin:28, toDt:false },
];

export const MIAMI_JUMP_GROUPS = [
  { label:'Miami core', options:[['downtown','Downtown'],['brickell','Brickell'],['wynwood','Wynwood'],['littlehavana','Little Havana'],['coconut','Coconut Grove'],['edgewater','Edgewater']] },
  { label:'Beaches', options:[['miamiBeach','South Beach'],['midbeach','Mid-Beach'],['northbeach','North Beach'],['keyof','Key Biscayne']] },
  { label:'West / North', options:[['coral','Coral Gables'],['doral','Doral'],['hialeah','Hialeah'],['kendall','Kendall'],['aventura','Aventura'],['fortlauderdale','Fort Lauderdale']] },
  { label:'Airports', options:[['mia','MIA — Miami Intl'],['fll','FLL — Fort Lauderdale']] },
  { label:'Attractions', options:[['poi_bayfront','Bayfront Park'],['poi_ocean','Ocean Drive'],['poi_wynwoodwalls','Wynwood Walls'],['poi_hardrock','Hard Rock Stadium'],['poi_loanDepot','loanDepot park'],['poi_ktp','Kaseya Center'],['poi_vizcaya','Vizcaya']] },
];

export const MIAMI_NWS = {
  counties: /\b(Miami-Dade|Broward|Monroe)\b/i,
  places: /Miami|Miami Beach|Coral Gables|Hialeah|Doral|Kendall|Aventura|Homestead|Fort Lauderdale|Hollywood|Key Biscayne|Brickell|Wynwood/i,
  foot: 'Official NWS alerts for South Florida counties',
  empty: 'No active NWS warnings for the Miami metro.',
};

export const MIAMI_WATERS = [
  { n:'Biscayne Bay', lat:25.7750, lng:-80.1600, r:480, tag:'bay' },
  { n:'Miami River', lat:25.7750, lng:-80.2050, r:160, tag:'river' },
  { n:'Atlantic Ocean', lat:25.7900, lng:-80.1100, r:400, tag:'ocean' },
];

export const MIAMI_CAM_EXTRAS = [{ id:'southbeach', lat:25.7820, lng:-80.1330, radius:300 }];

/* World height ≈ real feet / 3.16 · Brickell + Downtown */
export const MIAMI_SKYLINE = [
  { n:'Panorama Tower', lat:25.7635, lng:-80.1915, w:30, d:30, h:275, s:0, info:'868 ft · Brickell' },
  { n:'Waldorf Astoria Miami', lat:25.7705, lng:-80.1890, w:28, d:28, h:270, s:1, info:'Under construction crown' },
  { n:'One Thousand Museum', lat:25.7825, lng:-80.1870, w:26, d:26, h:220, s:2, info:'Zaha Hadid exoskeleton' },
  { n:'Echo Brickell', lat:25.7605, lng:-80.1905, w:24, d:24, h:215, s:3, info:'Brickell waterfront' },
  { n:'Brickell Flatiron', lat:25.7645, lng:-80.1910, w:26, d:26, h:210, s:0, info:'Triangular tower' },
  { n:'Miami Tower', lat:25.7715, lng:-80.1900, w:28, d:28, h:200, s:1, info:'Downtown classic' },
  { n:'Southeast Financial Center', lat:25.7725, lng:-80.1915, w:30, d:30, h:195, s:2, info:'764 ft' },
  { n:'900 Biscayne Bay', lat:25.7835, lng:-80.1865, w:28, d:28, h:190, s:3, info:'Edgewater' },
  { n:'Marquis Miami', lat:25.7850, lng:-80.1860, w:26, d:26, h:185, s:0, info:'Downtown north' },
  { n:'Opera Tower', lat:25.7870, lng:-80.1865, w:24, d:24, h:175, s:1, info:'Arts & Entertainment District' },
  { n:'Icon Brickell North', lat:25.7590, lng:-80.1900, w:28, d:28, h:170, s:2, info:'Brickell Key views' },
  { n:'Four Seasons Hotel & Tower', lat:25.7620, lng:-80.1918, w:28, d:28, h:165, s:3, info:'Brickell' },
  { n:'Jade Beach', lat:25.8600, lng:-80.1220, w:24, d:24, h:145, s:0, info:'Sunny Isles' },
  { n:'Continuum South Beach', lat:25.7700, lng:-80.1320, w:22, d:22, h:130, s:1, info:'South of Fifth' },
  { n:'Porte Rouge', lat:25.7650, lng:-80.1912, w:22, d:22, h:120, s:2, info:'Brickell mid-rise fabric' },
];

export const MIAMI_SKYLINE_POCKETS = [
  { n:'Brickell', lat:25.7615, lng:-80.1910, count:40, rad:200, hmin:45, hmax:200 },
  { n:'Downtown', lat:25.7750, lng:-80.1900, count:36, rad:200, hmin:40, hmax:180 },
  { n:'Edgewater', lat:25.8020, lng:-80.1870, count:22, rad:160, hmin:35, hmax:150 },
  { n:'South Beach', lat:25.7820, lng:-80.1330, count:18, rad:150, hmin:30, hmax:120 },
  { n:'Omni', lat:25.7880, lng:-80.1900, count:16, rad:140, hmin:35, hmax:140 },
];

export const MIAMI_ATTRACTIONS = [
  { kind:'park', n:'Bayfront Park', lat:25.7750, lng:-80.1860 },
  { kind:'landmark', n:'Ocean Drive', lat:25.7800, lng:-80.1305 },
  { kind:'stadium', n:'Hard Rock Stadium', lat:25.9580, lng:-80.2389 },
  { kind:'stadium', n:'loanDepot park', lat:25.7781, lng:-80.2197 },
  { kind:'arena', n:'Kaseya Center', lat:25.7814, lng:-80.1870 },
  { kind:'museum', n:'Vizcaya Museum', lat:25.7430, lng:-80.2105 },
  { kind:'landmark', n:'Wynwood Walls', lat:25.8010, lng:-80.1995 },
];

export const MIAMI_RIVER_LATLNG = [
  [25.775,-80.230],[25.775,-80.215],[25.774,-80.200],[25.773,-80.190],[25.772,-80.180],
];

export const MIAMI_META = {
  id:'miami', name:'Miami', metroName:'Greater Miami', areaName:'Miami-area',
  slogan:'Magic City · South Florida', loadingSub:'Paving the causeways…',
  wxPlace:'Miami · Downtown', freewayJumpLabel:'Freeway level — I-95 @ Downtown',
  originLat:25.7617, originLng:-80.1918, groundColor:0xb0c4a0,
  shields:[{label:'95'},{label:'195'},{label:'395'},{label:'836'},{label:'1',us:true,small:true}],
};
