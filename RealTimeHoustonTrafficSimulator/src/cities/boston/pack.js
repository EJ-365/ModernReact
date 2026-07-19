/** Boston metro pack — researched freeways, districts, airports, landmarks. */
export const BOSTON_ROAD_LATLNG = [
  { id:'i93', name:'I-93 Southeast Expressway / Central Artery', short:'I-93', closed:false, width:42, lanes:4, ff:55, share:1.4, baseY:0.82, prio:7,
    latlng:[[42.48,-71.10],[42.42,-71.09],[42.38,-71.07],[42.3685,-71.062],[42.360,-71.057],[42.350,-71.055],[42.32,-71.055],[42.26,-71.04],[42.19,-71.025]] },
  { id:'i90', name:'I-90 Massachusetts Turnpike', short:'I-90', closed:false, width:38, lanes:3, ff:55, share:1.25, baseY:0.82, prio:6.5,
    latlng:[[42.350,-71.250],[42.355,-71.160],[42.350,-71.120],[42.347,-71.080],[42.3485,-71.065],[42.350,-71.055],[42.348,-71.025],[42.352,-71.010]] },
  { id:'i95', name:'I-95 / Route 128 Beltway', short:'I-95', closed:false, width:42, lanes:4, ff:60, share:1.15, baseY:0.82, prio:6,
    latlng:[[42.52,-70.98],[42.48,-71.05],[42.40,-71.23],[42.36,-71.26],[42.31,-71.24],[42.22,-71.13],[42.15,-71.02],[42.14,-70.95]] },
  { id:'us1', name:'US-1 / Tobin Bridge', short:'Route 1', closed:false, width:34, lanes:3, ff:45, share:0.95, baseY:0.9, prio:5,
    latlng:[[42.52,-71.02],[42.45,-71.015],[42.40,-71.02],[42.385,-71.048],[42.375,-71.055],[42.368,-71.060],[42.360,-71.058]] },
  { id:'storrow', name:'Storrow Drive', short:'Storrow', closed:false, width:28, lanes:2, ff:40, share:0.85, baseY:0.88, prio:4.5, arterial:true,
    latlng:[[42.360,-71.145],[42.354,-71.105],[42.355,-71.075],[42.361,-71.068],[42.368,-71.065]] },
  { id:'memorial', name:'Memorial Drive', short:'Memorial Dr', closed:false, width:26, lanes:2, ff:35, share:0.7, baseY:0.85, prio:4, surface:true,
    latlng:[[42.360,-71.140],[42.357,-71.100],[42.361,-71.075],[42.365,-71.068]] },
];

export const BOSTON_DISTRICTS = [
  { id:'downtown', n:'Downtown Crossing', lat:42.3555, lng:-71.0605, r:260 },
  { id:'backbay', n:'Back Bay', lat:42.3503, lng:-71.0810, r:280 },
  { id:'beaconhill', n:'Beacon Hill', lat:42.3588, lng:-71.0707, r:200 },
  { id:'southend', n:'South End', lat:42.3380, lng:-71.0740, r:240 },
  { id:'fenway', n:'Fenway–Kenmore', lat:42.3467, lng:-71.0972, r:280 },
  { id:'seaport', n:'Seaport', lat:42.3490, lng:-71.0400, r:260 },
  { id:'northend', n:'North End', lat:42.3647, lng:-71.0542, r:200 },
  { id:'charlestown', n:'Charlestown', lat:42.3782, lng:-71.0602, r:240 },
  { id:'eastboston', n:'East Boston', lat:42.3702, lng:-71.0389, r:280 },
  { id:'southboston', n:'South Boston', lat:42.3334, lng:-71.0495, r:280 },
  { id:'dorchester', n:'Dorchester', lat:42.3016, lng:-71.0610, r:360 },
  { id:'cambridge', n:'Cambridge', lat:42.3736, lng:-71.1190, r:360 },
  { id:'kendall', n:'Kendall Square', lat:42.3626, lng:-71.0862, r:240 },
  { id:'somerville', n:'Somerville', lat:42.3876, lng:-71.0995, r:320 },
  { id:'brookline', n:'Brookline', lat:42.3318, lng:-71.1212, r:320 },
  { id:'newton', n:'Newton', lat:42.3370, lng:-71.2092, r:400 },
  { id:'quincy', n:'Quincy', lat:42.2529, lng:-71.0023, r:380 },
  { id:'waltham', n:'Waltham', lat:42.3765, lng:-71.2356, r:340 },
  { id:'lexington', n:'Lexington', lat:42.4473, lng:-71.2245, r:320 },
  { id:'medford', n:'Medford', lat:42.4184, lng:-71.1062, r:300 },
  { id:'malden', n:'Malden', lat:42.4251, lng:-71.0662, r:300 },
  { id:'revere', n:'Revere', lat:42.4084, lng:-71.0120, r:300 },
  { id:'lynn', n:'Lynn', lat:42.4668, lng:-70.9495, r:340 },
  { id:'allston', n:'Allston–Brighton', lat:42.3530, lng:-71.1320, r:280 },
];

export const BOSTON_AIRPORTS = [
  { id:'bos', code:'BOS', name:'Boston Logan International', lat:42.3656, lng:-71.0096, rot:0.25, intl:true, runLen:620, city:'Boston', elev:'20 ft', note:'New England primary hub · JetBlue / Delta / United', addr:'1 Harborside Dr, Boston, MA 02128' },
];

export const BOSTON_POIS = [
  { id:'poi_prudential', n:'Prudential Tower', lat:42.3473, lng:-71.0825, r:240 },
  { id:'poi_hancock', n:'200 Clarendon (Hancock)', lat:42.3491, lng:-71.0753, r:240 },
  { id:'poi_fenway', n:'Fenway Park', lat:42.3467, lng:-71.0972, r:260 },
  { id:'poi_tdgarden', n:'TD Garden', lat:42.3663, lng:-71.0621, r:260 },
  { id:'poi_harvard', n:'Harvard University', lat:42.3770, lng:-71.1167, r:300 },
  { id:'poi_mit', n:'MIT', lat:42.3601, lng:-71.0942, r:280 },
  { id:'poi_common', n:'Boston Common', lat:42.3551, lng:-71.0656, r:260 },
  { id:'poi_faneuil', n:'Faneuil Hall', lat:42.3600, lng:-71.0545, r:220 },
  { id:'poi_aquarium', n:'New England Aquarium', lat:42.3591, lng:-71.0498, r:220 },
  { id:'poi_mfa', n:'Museum of Fine Arts', lat:42.3394, lng:-71.0940, r:240 },
  { id:'poi_ussconst', n:'USS Constitution', lat:42.3724, lng:-71.0565, r:220 },
  { id:'poi_bu', n:'Boston University', lat:42.3505, lng:-71.1054, r:260 },
  { id:'poi_science', n:'Museum of Science', lat:42.3678, lng:-71.0707, r:220 },
  { id:'poi_publicgarden', n:'Public Garden', lat:42.3540, lng:-71.0700, r:220 },
];

export const BOSTON_HOTSPOTS = [
  { lat:42.360, lng:-71.059, r:360, k:0.52, name:'Downtown' },
  { lat:42.35, lng:-71.08, r:320, k:0.45, name:'Back Bay / I-90' },
  { lat:42.37, lng:-71.01, r:300, k:0.40, name:'Logan / East Boston' },
  { lat:42.37, lng:-71.12, r:300, k:0.38, name:'Cambridge' },
  { lat:42.32, lng:-71.05, r:320, k:0.42, name:'I-93 South' },
];

export const BOSTON_CORRIDORS = [
  { road:'i93', label:'I-93 · Medford → Downtown', aLat:42.42, aLng:-71.09, bLat:42.360, bLng:-71.059, realMi:8, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'i93', label:'I-93 · Quincy → Downtown', aLat:42.25, aLng:-71.00, bLat:42.360, bLng:-71.059, realMi:10, typMin:22, minMin:15, maxMin:45, toDt:true },
  { road:'i90', label:'I-90 · Newton → Downtown', aLat:42.34, aLng:-71.21, bLat:42.360, bLng:-71.059, realMi:9, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'i90', label:'I-90 · Ted Williams → Logan', aLat:42.35, aLng:-71.055, bLat:42.366, bLng:-71.010, realMi:4, typMin:12, minMin:8, maxMin:25, toDt:false },
  { road:'storrow', label:'Storrow · BU → TD Garden', aLat:42.35, aLng:-71.11, bLat:42.366, bLng:-71.062, realMi:4, typMin:14, minMin:10, maxMin:30, toDt:false },
];

export const BOSTON_JUMP_GROUPS = [
  { label:'Boston core', options:[['downtown','Downtown'],['backbay','Back Bay'],['fenway','Fenway'],['seaport','Seaport'],['northend','North End'],['beaconhill','Beacon Hill']] },
  { label:'Cambridge / North', options:[['cambridge','Cambridge'],['kendall','Kendall Square'],['somerville','Somerville'],['medford','Medford'],['malden','Malden'],['revere','Revere']] },
  { label:'West / South', options:[['brookline','Brookline'],['newton','Newton'],['allston','Allston–Brighton'],['quincy','Quincy'],['dorchester','Dorchester'],['waltham','Waltham']] },
  { label:'Airports', options:[['bos','BOS — Logan']] },
  { label:'Attractions', options:[['poi_fenway','Fenway Park'],['poi_tdgarden','TD Garden'],['poi_harvard','Harvard'],['poi_mit','MIT'],['poi_prudential','Prudential'],['poi_common','Boston Common'],['poi_faneuil','Faneuil Hall']] },
];

export const BOSTON_NWS = {
  areas: ['MA'],
  counties: /\b(Suffolk|Middlesex|Essex|Norfolk|Plymouth)\b/i,
  places: /Boston|Cambridge|Somerville|Brookline|Quincy|Newton|Waltham|Medford|Malden|Chelsea|Revere|Lynn|Salem|Lexington|Dorchester/i,
  foot: 'Official NWS alerts for Boston-area counties',
  empty: 'No active NWS warnings for the Boston metro.',
};

export const BOSTON_WATERS = [
  { n:'Charles River', lat:42.3600, lng:-71.0750, r:240, tag:'river' },
  { n:'Boston Harbor', lat:42.3550, lng:-71.0400, r:420, tag:'harbor' },
  { n:'Mystic River', lat:42.3900, lng:-71.0700, r:180, tag:'river' },
  { n:'Fort Point Channel', lat:42.3500, lng:-71.0480, r:120, tag:'channel' },
];

export const BOSTON_CAM_EXTRAS = [{ id:'fenway', lat:42.3467, lng:-71.0972, radius:300 }];

export const BOSTON_SKYLINE = [
  { n:'200 Clarendon (Hancock)', lat:42.3491, lng:-71.0753, w:30, d:28, h:220, s:1, info:'790 ft mirrored rhomboid' },
  { n:'Prudential Tower', lat:42.3473, lng:-71.0825, w:32, d:30, h:205, s:0, info:'749 ft' },
  { n:'Millennium Tower', lat:42.3555, lng:-71.0595, w:28, d:28, h:185, s:2, info:'685 ft' },
  { n:'One International Place', lat:42.3560, lng:-71.0515, w:30, d:30, h:165, s:1, info:'600 ft' },
  { n:'Federal Reserve Bank', lat:42.3530, lng:-71.0535, w:26, d:26, h:170, s:3, info:'614 ft' },
  { n:'One Financial Center', lat:42.3525, lng:-71.0555, w:28, d:26, h:160, s:0, info:'590 ft' },
  { n:'111 Huntington', lat:42.3468, lng:-71.0818, w:26, d:24, h:150, s:2, info:'554 ft openwork crown' },
  { n:'Custom House Tower', lat:42.3590, lng:-71.0525, w:18, d:18, h:140, s:0, info:'496 ft clock tower' },
];

export const BOSTON_ATTRACTIONS = [
  { kind:'stadium', n:'Fenway Park', lat:42.3467, lng:-71.0972 },
  { kind:'arena', n:'TD Garden', lat:42.3663, lng:-71.0621 },
  { kind:'school', n:'Harvard University', lat:42.3770, lng:-71.1167 },
  { kind:'school', n:'MIT', lat:42.3601, lng:-71.0942 },
  { kind:'museum', n:'Museum of Fine Arts', lat:42.3394, lng:-71.0940 },
  { kind:'park', n:'Boston Common', lat:42.3551, lng:-71.0656 },
  { kind:'landmark', n:'Faneuil Hall', lat:42.3600, lng:-71.0545 },
];

export const BOSTON_RIVER_LATLNG = [
  [42.365,-71.12],[42.362,-71.10],[42.360,-71.08],[42.361,-71.07],[42.363,-71.065],[42.366,-71.06],
];

export const BOSTON_META = {
  id:'boston', name:'Boston', metroName:'Greater Boston', areaName:'Boston-area',
  slogan:'Beantown · New England', loadingSub:'Paving New England freeways…',
  wxPlace:'Boston · Downtown', freewayJumpLabel:'Freeway level — I-93 @ Downtown',
  originLat:42.36008, originLng:-71.05888, groundColor:0xa8b898,
  shields:[{label:'93'},{label:'90'},{label:'95'},{label:'1',us:true,small:true}],
};
