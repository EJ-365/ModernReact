/** Minneapolis–Saint Paul metro pack — researched freeways, districts, airports, landmarks. */
export const MINNEAPOLIS_ROAD_LATLNG = [
  { id:'i94', name:'I-94', short:'I-94', closed:false, width:44, lanes:4, ff:55, share:1.4, baseY:0.82, prio:7,
    latlng:[[44.98,-93.45],[44.98,-93.35],[44.97,-93.27],[44.95,-93.20],[44.95,-93.10],[44.94,-93.00]] },
  { id:'i35w', name:'I-35W', short:'I-35W', closed:false, width:42, lanes:4, ff:55, share:1.35, baseY:0.82, prio:6.5,
    latlng:[[45.10,-93.25],[45.02,-93.26],[44.98,-93.27],[44.95,-93.27],[44.90,-93.28],[44.85,-93.28]] },
  { id:'i35e', name:'I-35E', short:'I-35E', closed:false, width:40, lanes:3, ff:55, share:1.25, baseY:0.82, prio:6,
    latlng:[[45.05,-93.10],[44.98,-93.10],[44.95,-93.10],[44.90,-93.10],[44.85,-93.12]] },
  { id:'i394', name:'I-394', short:'I-394', closed:false, width:38, lanes:3, ff:55, share:1.2, baseY:0.82, prio:5.5,
    latlng:[[44.97,-93.45],[44.97,-93.38],[44.97,-93.32],[44.97,-93.27]] },
  { id:'i494', name:'I-494 Beltway', short:'I-494', closed:false, width:42, lanes:4, ff:60, share:1.3, baseY:0.82, prio:6.5,
    latlng:[[44.86,-93.45],[44.86,-93.30],[44.86,-93.20],[44.88,-93.10],[44.95,-93.05],[45.02,-93.10],[45.05,-93.25],[45.00,-93.40],[44.90,-93.45],[44.86,-93.45]] },
  { id:'mn100', name:'MN-100', short:'MN-100', closed:false, width:36, lanes:3, ff:55, share:1.1, baseY:0.82, prio:5,
    latlng:[[45.05,-93.35],[44.98,-93.35],[44.92,-93.35],[44.86,-93.35]] },
];

export const MINNEAPOLIS_DISTRICTS = [
  { id:'downtown', n:'Downtown Minneapolis', lat:44.9778, lng:-93.2650, r:280, noHouses:true },
  { id:'northloop', n:'North Loop', lat:44.9880, lng:-93.2750, r:240 },
  { id:'uptown', n:'Uptown', lat:44.9480, lng:-93.2980, r:260 },
  { id:'dinkytown', n:'Dinkytown / U of M', lat:44.9800, lng:-93.2350, r:240 },
  { id:'stpaul', n:'Downtown Saint Paul', lat:44.9537, lng:-93.0900, r:300, noHouses:true },
  { id:'airport', n:'MSP Airport', lat:44.8848, lng:-93.2223, r:340 },
  { id:'bloomington', n:'Bloomington / Mall of America', lat:44.8540, lng:-93.2420, r:320 },
  { id:'edina', n:'Edina', lat:44.8897, lng:-93.3499, r:300 },
  { id:'richfield', n:'Richfield', lat:44.8830, lng:-93.2830, r:260 },
  { id:'northeast', n:'Northeast', lat:45.0100, lng:-93.2500, r:260 },
  { id:'lindenhills', n:'Linden Hills', lat:44.9250, lng:-93.3200, r:240 },
  { id:'como', n:'Como Park', lat:44.9800, lng:-93.1500, r:260 },
  { id:'midway', n:'Midway', lat:44.9600, lng:-93.1700, r:260 },
  { id:'minnehaha', n:'Minnehaha', lat:44.9150, lng:-93.2100, r:240 },
];

export const MINNEAPOLIS_AIRPORTS = [
  { id:'msp', code:'MSP', name:'Minneapolis–Saint Paul International', lat:44.8848, lng:-93.2223, rot:0.15, intl:true, runLen:800, city:'Minneapolis', elev:'841 ft', note:'Delta hub · Twin Cities', addr:'4300 Glumack Dr, St Paul, MN 55111' },
  { id:'stp', code:'STP', name:'St. Paul Downtown Airport (Holman Field)', lat:44.9346, lng:-93.0600, rot:0.05, intl:false, runLen:420, city:'Saint Paul', elev:'705 ft', note:'Downtown Saint Paul GA', addr:'644 Bayfield St, St Paul, MN 55107' },
];

export const MINNEAPOLIS_POIS = [
  { id:'poi_usbank', n:'U.S. Bank Stadium', lat:44.9739, lng:-93.2581, r:280 },
  { id:'poi_target', n:'Target Center', lat:44.9795, lng:-93.2761, r:260 },
  { id:'poi_targetfield', n:'Target Field', lat:44.9817, lng:-93.2776, r:260 },
  { id:'poi_moa', n:'Mall of America', lat:44.8547, lng:-93.2422, r:300 },
  { id:'poi_ids', n:'IDS Center', lat:44.9760, lng:-93.2720, r:240 },
  { id:'poi_umn', n:'University of Minnesota', lat:44.9740, lng:-93.2270, r:300 },
  { id:'poi_falls', n:'Minnehaha Falls', lat:44.9153, lng:-93.2110, r:220 },
  { id:'poi_capitol', n:'Minnesota State Capitol', lat:44.9551, lng:-93.1022, r:240 },
  { id:'poi_walker', n:'Walker Art Center', lat:44.9680, lng:-93.2880, r:220 },
  { id:'poi_lake', n:'Lake Calhoun / Bde Maka Ska', lat:44.9410, lng:-93.3110, r:260 },
];

export const MINNEAPOLIS_HOTSPOTS = [
  { lat:44.978, lng:-93.265, r:360, k:0.55, name:'Downtown Mpls' },
  { lat:44.88, lng:-93.22, r:340, k:0.48, name:'MSP Airport' },
  { lat:44.85, lng:-93.24, r:300, k:0.45, name:'Mall of America' },
  { lat:44.95, lng:-93.09, r:300, k:0.42, name:'Saint Paul' },
  { lat:44.95, lng:-93.30, r:260, k:0.40, name:'Uptown' },
];

export const MINNEAPOLIS_CORRIDORS = [
  { road:'i35w', label:'I-35W · South → Downtown', aLat:44.86, aLng:-93.28, bLat:44.98, bLng:-93.27, realMi:10, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'i94', label:'I-94 · Saint Paul → Minneapolis', aLat:44.95, aLng:-93.10, bLat:44.98, bLng:-93.27, realMi:10, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'i494', label:'I-494 · Airport belt', aLat:44.86, aLng:-93.22, bLat:44.86, bLng:-93.35, realMi:8, typMin:14, minMin:10, maxMin:30, toDt:false },
  { road:'i394', label:'I-394 · West → Downtown', aLat:44.97, aLng:-93.40, bLat:44.97, bLng:-93.27, realMi:8, typMin:16, minMin:10, maxMin:35, toDt:true },
];

export const MINNEAPOLIS_JUMP_GROUPS = [
  { label:'Minneapolis', options:[['downtown','Downtown'],['northloop','North Loop'],['uptown','Uptown'],['dinkytown','Dinkytown'],['northeast','Northeast'],['lindenhills','Linden Hills']] },
  { label:'Saint Paul & south', options:[['stpaul','Saint Paul'],['midway','Midway'],['como','Como Park'],['bloomington','Bloomington'],['airport','MSP area']] },
  { label:'Airports', options:[['msp','MSP — Twin Cities Intl'],['stp','STP — Holman Field']] },
  { label:'Attractions', options:[['poi_usbank','U.S. Bank Stadium'],['poi_targetfield','Target Field'],['poi_moa','Mall of America'],['poi_ids','IDS Center'],['poi_umn','U of M'],['poi_falls','Minnehaha Falls']] },
];

export const MINNEAPOLIS_NWS = {
  counties: /\b(Hennepin|Ramsey|Dakota|Anoka|Washington|Scott|Carver)\b/i,
  places: /Minneapolis|Saint Paul|St\. Paul|Bloomington|Edina|Richfield|Minnetonka|Maple Grove|Eagan|Mall of America/i,
  foot: 'Official NWS alerts for Twin Cities counties',
  empty: 'No active NWS warnings for the Twin Cities metro.',
};

export const MINNEAPOLIS_WATERS = [
  { n:'Mississippi River', lat:44.9800, lng:-93.2500, r:240, tag:'river' },
  { n:'Bde Maka Ska', lat:44.9410, lng:-93.3110, r:200, tag:'lake' },
];

export const MINNEAPOLIS_CAM_EXTRAS = [{ id:'usbank', lat:44.9739, lng:-93.2581, radius:300 }];

export const MINNEAPOLIS_SKYLINE = [
  { n:'IDS Center', lat:44.9760, lng:-93.2720, w:36, d:36, h:241, s:0, info:'792 ft · tallest in Minnesota', spire:30 },
  { n:'Capella Tower', lat:44.9755, lng:-93.2700, w:32, d:32, h:235, s:1, info:'776 ft' },
  { n:'Wells Fargo Center', lat:44.9765, lng:-93.2680, w:30, d:30, h:236, s:2, info:'775 ft' },
  { n:'33 South Sixth', lat:44.9770, lng:-93.2740, w:28, d:28, h:203, s:3, info:'668 ft' },
  { n:'Campbell Mithun Tower', lat:44.9750, lng:-93.2710, w:28, d:28, h:177, s:0, info:'579 ft' },
  { n:'US Bank Plaza', lat:44.9775, lng:-93.2690, w:28, d:28, h:170, s:1, info:'Downtown' },
  { n:'Foshay Tower', lat:44.9745, lng:-93.2725, w:26, d:26, h:136, s:2, info:'Historic' },
  { n:'Riverside Plaza', lat:44.9700, lng:-93.2450, w:30, d:30, h:150, s:3, info:'Cedar-Riverside' },
  { n:'Grant Park Tower', lat:44.9700, lng:-93.2600, w:26, d:26, h:140, s:0, info:'Downtown' },
  { n:'LaSalle Plaza', lat:44.9760, lng:-93.2730, w:26, d:26, h:145, s:1, info:'Downtown' },
  { n:'First National Bank Building', lat:44.9450, lng:-93.0900, w:28, d:28, h:127, s:2, info:'Saint Paul' },
  { n:'Wells Fargo Place', lat:44.9480, lng:-93.0950, w:26, d:26, h:140, s:3, info:'Saint Paul' },
  { n:'Gaviidae Common', lat:44.9770, lng:-93.2715, w:24, d:24, h:120, s:0, info:'Skyway' },
  { n:'Normandy Inn Tower', lat:44.9780, lng:-93.2750, w:24, d:24, h:110, s:1, info:'North Loop edge' },
  { n:'MoA Radisson Blu', lat:44.8540, lng:-93.2420, w:24, d:24, h:100, s:2, info:'Bloomington' },
];

export const MINNEAPOLIS_SKYLINE_POCKETS = [
  { n:'Downtown Mpls', lat:44.9778, lng:-93.2650, count:38, rad:220, hmin:40, hmax:190 },
  { n:'North Loop', lat:44.9880, lng:-93.2750, count:20, rad:160, hmin:30, hmax:130 },
  { n:'Saint Paul', lat:44.9537, lng:-93.0900, count:24, rad:180, hmin:35, hmax:140 },
  { n:'Uptown', lat:44.9480, lng:-93.2980, count:16, rad:150, hmin:30, hmax:110 },
  { n:'University', lat:44.9740, lng:-93.2270, count:14, rad:140, hmin:30, hmax:100 },
];

export const MINNEAPOLIS_ATTRACTIONS = [
  { kind:'stadium', n:'U.S. Bank Stadium', lat:44.9739, lng:-93.2581 },
  { kind:'stadium', n:'Target Field', lat:44.9817, lng:-93.2776 },
  { kind:'arena', n:'Target Center', lat:44.9795, lng:-93.2761 },
  { kind:'park', n:'Minnehaha Falls', lat:44.9153, lng:-93.2110 },
  { kind:'school', n:'University of Minnesota', lat:44.9740, lng:-93.2270 },
  { kind:'museum', n:'Walker Art Center', lat:44.9680, lng:-93.2880 },
];

export const MINNEAPOLIS_RIVER_LATLNG = [
  [45.02,-93.28],[44.99,-93.27],[44.98,-93.25],[44.96,-93.22],[44.94,-93.18],[44.95,-93.10],
];

export const MINNEAPOLIS_META = {
  id:'minneapolis', name:'Minneapolis', metroName:'Twin Cities', areaName:'Minneapolis–Saint Paul-area',
  slogan:'Twin Cities · Minnesota', loadingSub:'Paving the beltway…',
  wxPlace:'Minneapolis · Downtown', freewayJumpLabel:'Freeway level — I-35W @ Downtown',
  originLat:44.9778, originLng:-93.2650, groundColor:0x9aad90,
  shields:[{label:'94'},{label:'35W'},{label:'35E'},{label:'494'},{label:'394',small:true}],
};
