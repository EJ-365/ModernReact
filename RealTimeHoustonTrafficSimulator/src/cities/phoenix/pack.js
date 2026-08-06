/** Phoenix metro pack — researched freeways, districts, airports, landmarks. */
export const PHOENIX_ROAD_LATLNG = [
  { id:'i10', name:'I-10', short:'I-10', closed:false, width:44, lanes:4, ff:65, share:1.4, baseY:0.82, prio:7,
    latlng:[[33.45,-112.40],[33.45,-112.25],[33.45,-112.10],[33.45,-112.07],[33.45,-111.95],[33.45,-111.80]] },
  { id:'i17', name:'I-17 Black Canyon', short:'I-17', closed:false, width:42, lanes:4, ff:60, share:1.35, baseY:0.82, prio:6.5,
    latlng:[[33.70,-112.12],[33.60,-112.12],[33.52,-112.11],[33.48,-112.09],[33.45,-112.07],[33.40,-112.05]] },
  { id:'loop202', name:'Loop 202', short:'202', closed:false, width:40, lanes:3, ff:65, share:1.2, baseY:0.82, prio:6,
    latlng:[[33.55,-112.25],[33.55,-112.10],[33.55,-111.95],[33.50,-111.85],[33.40,-111.85],[33.35,-111.95],[33.35,-112.10]] },
  { id:'loop101', name:'Loop 101', short:'101', closed:false, width:40, lanes:3, ff:65, share:1.25, baseY:0.82, prio:6,
    latlng:[[33.65,-112.25],[33.65,-112.10],[33.60,-111.95],[33.50,-111.90],[33.40,-111.95],[33.35,-112.10],[33.40,-112.25],[33.55,-112.28],[33.65,-112.25]] },
  { id:'us60', name:'US-60 Superstition', short:'US-60', closed:false, width:38, lanes:3, ff:60, share:1.1, baseY:0.82, prio:5.5,
    latlng:[[33.42,-112.15],[33.41,-112.00],[33.40,-111.90],[33.39,-111.80],[33.38,-111.70]] },
  { id:'sr51', name:'SR-51 Piestewa', short:'SR-51', closed:false, width:38, lanes:3, ff:60, share:1.15, baseY:0.82, prio:5.5,
    latlng:[[33.65,-111.98],[33.58,-112.00],[33.52,-112.03],[33.48,-112.05],[33.45,-112.07]] },
];

export const PHOENIX_DISTRICTS = [
  { id:'downtown', n:'Downtown Phoenix', lat:33.4484, lng:-112.0740, r:280, noHouses:true },
  { id:'midtown', n:'Midtown', lat:33.4800, lng:-112.0700, r:260, noHouses:true },
  { id:'scottsdale', n:'Old Town Scottsdale', lat:33.4942, lng:-111.9261, r:300 },
  { id:'tempe', n:'Tempe', lat:33.4255, lng:-111.9400, r:320 },
  { id:'mesa', n:'Mesa', lat:33.4152, lng:-111.8315, r:340 },
  { id:'glendale', n:'Glendale', lat:33.5387, lng:-112.1860, r:320 },
  { id:'chandler', n:'Chandler', lat:33.3062, lng:-111.8413, r:320 },
  { id:'gilbert', n:'Gilbert', lat:33.3528, lng:-111.7890, r:300 },
  { id:'paradise', n:'Paradise Valley', lat:33.5312, lng:-111.9426, r:280 },
  { id:'airport', n:'Sky Harbor / Airport', lat:33.4343, lng:-112.0116, r:340 },
  { id:'roosevelt', n:'Roosevelt Row', lat:33.4580, lng:-112.0680, r:220 },
  { id:'arcadia', n:'Arcadia', lat:33.5000, lng:-111.9800, r:240 },
  { id:'ahwatukee', n:'Ahwatukee', lat:33.3400, lng:-112.0000, r:280 },
  { id:'peoria', n:'Peoria', lat:33.5806, lng:-112.2374, r:320 },
];

export const PHOENIX_AIRPORTS = [
  { id:'phx', code:'PHX', name:'Phoenix Sky Harbor International', lat:33.4343, lng:-112.0116, rot:0.1, intl:true, runLen:780, city:'Phoenix', elev:'1,135 ft', note:'Sky Harbor · Southwest & American hub', addr:'3400 E Sky Harbor Blvd, Phoenix, AZ 85034' },
  { id:'sdl', code:'SDL', name:'Scottsdale Airport', lat:33.6229, lng:-111.9105, rot:0.05, intl:false, runLen:420, city:'Scottsdale', elev:'1,510 ft', note:'Busy GA / corporate field', addr:'15000 N Airport Dr, Scottsdale, AZ 85260' },
];

export const PHOENIX_POIS = [
  { id:'poi_chase', n:'Chase Field', lat:33.4453, lng:-112.0667, r:280 },
  { id:'poi_foothills', n:'Footprint Center', lat:33.4457, lng:-112.0712, r:260 },
  { id:'poi_statefarm', n:'State Farm Stadium', lat:33.5275, lng:-112.2625, r:300 },
  { id:'poi_asu', n:'Arizona State University', lat:33.4242, lng:-111.9281, r:300 },
  { id:'poi_papago', n:'Papago Park', lat:33.4550, lng:-111.9480, r:260 },
  { id:'poi_camelback', n:'Camelback Mountain', lat:33.5145, lng:-111.9617, r:280 },
  { id:'poi_desert', n:'Desert Botanical Garden', lat:33.4600, lng:-111.9440, r:220 },
  { id:'poi_convention', n:'Phoenix Convention Center', lat:33.4490, lng:-112.0680, r:220 },
  { id:'poi_art', n:'Phoenix Art Museum', lat:33.4670, lng:-112.0730, r:200 },
  { id:'poi_suns', n:'Talking Stick Resort Arena area', lat:33.4457, lng:-112.0712, r:220 },
];

export const PHOENIX_HOTSPOTS = [
  { lat:33.448, lng:-112.074, r:360, k:0.55, name:'Downtown' },
  { lat:33.43, lng:-112.01, r:340, k:0.48, name:'Sky Harbor' },
  { lat:33.49, lng:-111.93, r:300, k:0.42, name:'Scottsdale' },
  { lat:33.43, lng:-111.94, r:300, k:0.45, name:'Tempe / ASU' },
  { lat:33.53, lng:-112.26, r:280, k:0.40, name:'Glendale / Stadium' },
];

export const PHOENIX_CORRIDORS = [
  { road:'i10', label:'I-10 · Downtown → Tempe', aLat:33.45, aLng:-112.07, bLat:33.43, bLng:-111.94, realMi:8, typMin:16, minMin:10, maxMin:35, toDt:false },
  { road:'i17', label:'I-17 · North Valley → Downtown', aLat:33.65, aLng:-112.12, bLat:33.45, bLng:-112.07, realMi:14, typMin:24, minMin:16, maxMin:45, toDt:true },
  { road:'loop202', label:'Loop 202 · East Valley', aLat:33.50, aLng:-111.85, bLat:33.45, bLng:-112.07, realMi:16, typMin:28, minMin:18, maxMin:50, toDt:true },
  { road:'sr51', label:'Piestewa · Paradise Valley → Downtown', aLat:33.58, aLng:-112.00, bLat:33.45, bLng:-112.07, realMi:10, typMin:18, minMin:12, maxMin:40, toDt:true },
];

export const PHOENIX_JUMP_GROUPS = [
  { label:'Phoenix core', options:[['downtown','Downtown'],['midtown','Midtown'],['roosevelt','Roosevelt Row'],['arcadia','Arcadia'],['airport','Sky Harbor area']] },
  { label:'East Valley', options:[['scottsdale','Scottsdale'],['tempe','Tempe'],['mesa','Mesa'],['chandler','Chandler'],['gilbert','Gilbert']] },
  { label:'West Valley', options:[['glendale','Glendale'],['peoria','Peoria'],['ahwatukee','Ahwatukee']] },
  { label:'Airports', options:[['phx','PHX — Sky Harbor'],['sdl','SDL — Scottsdale']] },
  { label:'Attractions', options:[['poi_chase','Chase Field'],['poi_foothills','Footprint Center'],['poi_statefarm','State Farm Stadium'],['poi_asu','ASU'],['poi_camelback','Camelback Mountain']] },
];

export const PHOENIX_NWS = {
  counties: /\b(Maricopa|Pinal)\b/i,
  places: /Phoenix|Scottsdale|Tempe|Mesa|Glendale|Chandler|Gilbert|Peoria|Paradise Valley|Ahwatukee|Sky Harbor/i,
  foot: 'Official NWS alerts for Greater Phoenix counties',
  empty: 'No active NWS warnings for the Phoenix metro.',
};

export const PHOENIX_WATERS = [
  { n:'Salt River', lat:33.4300, lng:-111.9400, r:200, tag:'river' },
];

export const PHOENIX_CAM_EXTRAS = [{ id:'chase', lat:33.4453, lng:-112.0667, radius:300 }];

export const PHOENIX_SKYLINE = [
  { n:'Chase Tower', lat:33.4505, lng:-112.0742, w:34, d:34, h:280, s:0, info:'483 ft · tallest in Arizona', spire:40 },
  { n:'US Bank Center', lat:33.4488, lng:-112.0735, w:30, d:30, h:240, s:1, info:'407 ft' },
  { n:'Phoenix City Hall', lat:33.4486, lng:-112.0740, w:32, d:32, h:200, s:2, info:'Downtown' },
  { n:'One Arizona Center', lat:33.4495, lng:-112.0720, w:28, d:28, h:190, s:3, info:'Downtown' },
  { n:'Freeport-McMoRan Center', lat:33.4500, lng:-112.0710, w:28, d:28, h:180, s:0, info:'Downtown' },
  { n:'Hyatt Regency Phoenix', lat:33.4490, lng:-112.0700, w:28, d:28, h:170, s:1, info:'Hotel' },
  { n:'Valley Bank Center', lat:33.4510, lng:-112.0750, w:26, d:26, h:160, s:2, info:'Downtown' },
  { n:'Midtown Plaza Tower', lat:33.4800, lng:-112.0700, w:26, d:26, h:150, s:3, info:'Midtown' },
  { n:'Camelback Esplanade', lat:33.5100, lng:-111.9800, w:26, d:26, h:140, s:0, info:'Camelback corridor' },
  { n:'Scottsdale Waterfront', lat:33.4940, lng:-111.9260, w:24, d:24, h:130, s:1, info:'Scottsdale' },
  { n:'Tempe Town Lake Tower', lat:33.4300, lng:-111.9400, w:24, d:24, h:120, s:2, info:'Tempe' },
  { n:'ASU Hayden Library area', lat:33.4200, lng:-111.9350, w:22, d:22, h:110, s:3, info:'Campus' },
  { n:'Biltmore Fashion Park', lat:33.5100, lng:-112.0300, w:24, d:24, h:100, s:0, info:'Biltmore' },
  { n:'Papago Buttes', lat:33.4550, lng:-111.9480, w:20, d:20, h:90, s:1, info:'Landmark' },
  { n:'Roosevelt Row Lofts', lat:33.4580, lng:-112.0680, w:22, d:22, h:95, s:2, info:'Arts district' },
];

export const PHOENIX_SKYLINE_POCKETS = [
  { n:'Downtown', lat:33.4484, lng:-112.0740, count:36, rad:220, hmin:40, hmax:180 },
  { n:'Midtown', lat:33.4800, lng:-112.0700, count:28, rad:180, hmin:35, hmax:150 },
  { n:'Scottsdale', lat:33.4940, lng:-111.9260, count:22, rad:160, hmin:30, hmax:130 },
  { n:'Tempe', lat:33.4250, lng:-111.9400, count:24, rad:170, hmin:30, hmax:140 },
  { n:'Camelback', lat:33.5100, lng:-111.9800, count:16, rad:150, hmin:30, hmax:120 },
];

export const PHOENIX_ATTRACTIONS = [
  { kind:'stadium', n:'Chase Field', lat:33.4453, lng:-112.0667 },
  { kind:'arena', n:'Footprint Center', lat:33.4457, lng:-112.0712 },
  { kind:'stadium', n:'State Farm Stadium', lat:33.5275, lng:-112.2625 },
  { kind:'school', n:'Arizona State University', lat:33.4242, lng:-111.9281 },
  { kind:'park', n:'Papago Park', lat:33.4550, lng:-111.9480 },
  { kind:'park', n:'Camelback Mountain', lat:33.5145, lng:-111.9617 },
];

export const PHOENIX_RIVER_LATLNG = [
  [33.45,-112.20],[33.44,-112.10],[33.43,-112.00],[33.43,-111.94],[33.42,-111.88],
];

export const PHOENIX_META = {
  id:'phoenix', name:'Phoenix', metroName:'Valley of the Sun', areaName:'Phoenix-area',
  slogan:'Valley of the Sun · Arizona', loadingSub:'Paving the freeways…',
  wxPlace:'Phoenix · Downtown', freewayJumpLabel:'Freeway level — I-10 @ Downtown',
  originLat:33.4484, originLng:-112.0740, groundColor:0xc4b090,
  shields:[{label:'10'},{label:'17'},{label:'202'},{label:'101'},{label:'51',small:true}],
};
