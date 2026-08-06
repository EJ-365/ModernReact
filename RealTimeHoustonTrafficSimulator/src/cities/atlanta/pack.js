/** Atlanta metro pack — researched freeways, districts, airports, landmarks. */
export const ATLANTA_ROAD_LATLNG = [
  { id:'i75', name:'I-75', short:'I-75', closed:false, width:44, lanes:4, ff:55, share:1.4, baseY:0.82, prio:7,
    latlng:[[34.00,-84.40],[33.90,-84.39],[33.82,-84.39],[33.76,-84.39],[33.75,-84.39],[33.70,-84.40],[33.60,-84.42],[33.50,-84.45]] },
  { id:'i85', name:'I-85', short:'I-85', closed:false, width:42, lanes:4, ff:55, share:1.35, baseY:0.82, prio:6.5,
    latlng:[[34.00,-84.28],[33.90,-84.32],[33.82,-84.35],[33.76,-84.37],[33.75,-84.39],[33.70,-84.40],[33.62,-84.42]] },
  { id:'i20', name:'I-20', short:'I-20', closed:false, width:40, lanes:4, ff:60, share:1.2, baseY:0.82, prio:6,
    latlng:[[33.75,-84.60],[33.75,-84.50],[33.75,-84.42],[33.75,-84.39],[33.75,-84.32],[33.75,-84.22]] },
  { id:'i285', name:'I-285 Perimeter', short:'I-285', closed:false, width:44, lanes:4, ff:55, share:1.3, baseY:0.82, prio:6.5,
    latlng:[[33.90,-84.28],[33.90,-84.40],[33.85,-84.50],[33.75,-84.52],[33.65,-84.48],[33.62,-84.38],[33.65,-84.25],[33.75,-84.22],[33.85,-84.22],[33.90,-84.28]] },
  { id:'ga400', name:'GA-400', short:'GA-400', closed:false, width:38, lanes:3, ff:60, share:1.15, baseY:0.82, prio:6,
    latlng:[[34.05,-84.30],[33.95,-84.32],[33.88,-84.35],[33.82,-84.36],[33.78,-84.37],[33.76,-84.38]] },
  { id:'downtownconn', name:'Downtown Connector (I-75/85)', short:'Connector', closed:false, width:46, lanes:5, ff:50, share:1.55, baseY:0.85, prio:7.5,
    latlng:[[33.80,-84.39],[33.77,-84.39],[33.75,-84.39],[33.73,-84.39],[33.70,-84.39]] },
];

export const ATLANTA_DISTRICTS = [
  { id:'downtown', n:'Downtown Atlanta', lat:33.7550, lng:-84.3900, r:280, noHouses:true },
  { id:'midtown', n:'Midtown', lat:33.7840, lng:-84.3830, r:280, noHouses:true },
  { id:'buckhead', n:'Buckhead', lat:33.8480, lng:-84.3740, r:320, noHouses:true },
  { id:'oldFourth', n:'Old Fourth Ward', lat:33.7650, lng:-84.3650, r:240 },
  { id:'inman', n:'Inman Park', lat:33.7580, lng:-84.3540, r:220 },
  { id:'virginia', n:'Virginia-Highland', lat:33.7820, lng:-84.3530, r:240 },
  { id:'westEnd', n:'West End', lat:33.7400, lng:-84.4200, r:260 },
  { id:'grant', n:'Grant Park', lat:33.7350, lng:-84.3720, r:240 },
  { id:'decatur', n:'Decatur', lat:33.7748, lng:-84.2963, r:300 },
  { id:'marietta', n:'Marietta', lat:33.9526, lng:-84.5499, r:360 },
  { id:'sandy', n:'Sandy Springs', lat:33.9243, lng:-84.3785, r:320 },
  { id:'alpharetta', n:'Alpharetta', lat:34.0754, lng:-84.2941, r:340 },
  { id:'dunwoody', n:'Dunwoody', lat:33.9462, lng:-84.3346, r:300 },
  { id:'airport', n:'Airport / College Park', lat:33.6407, lng:-84.4277, r:340 },
  { id:'eastAtlanta', n:'East Atlanta', lat:33.7400, lng:-84.3450, r:260 },
  { id:'ponce', n:'Poncey-Highland', lat:33.7720, lng:-84.3520, r:220 },
  { id:'littleFive', n:'Little Five Points', lat:33.7645, lng:-84.3495, r:200 },
];

export const ATLANTA_AIRPORTS = [
  { id:'atl', code:'ATL', name:'Hartsfield–Jackson Atlanta International', lat:33.6407, lng:-84.4277, rot:0.15, intl:true, runLen:820, city:'Atlanta', elev:'1,026 ft', note:'World\'s busiest · Delta hub', addr:'6000 N Terminal Pkwy, Atlanta, GA 30320' },
];

export const ATLANTA_POIS = [
  { id:'poi_bank', n:'Bank of America Plaza', lat:33.7708, lng:-84.3863, r:240 },
  { id:'poi_westin', n:'Westin Peachtree Plaza', lat:33.7595, lng:-84.3880, r:240 },
  { id:'poi_mercedes', n:'Mercedes-Benz Stadium', lat:33.7554, lng:-84.4010, r:280 },
  { id:'poi_truist', n:'Truist Park', lat:33.8907, lng:-84.4677, r:280 },
  { id:'poi_statefarm', n:'State Farm Arena', lat:33.7573, lng:-84.3963, r:240 },
  { id:'poi_centennial', n:'Centennial Olympic Park', lat:33.7603, lng:-84.3935, r:240 },
  { id:'poi_aquarium', n:'Georgia Aquarium', lat:33.7634, lng:-84.3951, r:220 },
  { id:'poi_cnn', n:'CNN Center', lat:33.7570, lng:-84.3950, r:220 },
  { id:'poi_fox', n:'Fox Theatre', lat:33.7726, lng:-84.3856, r:200 },
  { id:'poi_piedmont', n:'Piedmont Park', lat:33.7850, lng:-84.3730, r:260 },
  { id:'poi_gt', n:'Georgia Tech', lat:33.7756, lng:-84.3963, r:280 },
  { id:'poi_beltline', n:'BeltLine Eastside Trail', lat:33.7700, lng:-84.3600, r:240 },
  { id:'poi_world', n:'World of Coca-Cola', lat:33.7629, lng:-84.3928, r:220 },
];

export const ATLANTA_HOTSPOTS = [
  { lat:33.755, lng:-84.390, r:360, k:0.55, name:'Downtown' },
  { lat:33.78, lng:-84.38, r:300, k:0.45, name:'Midtown' },
  { lat:33.85, lng:-84.37, r:300, k:0.42, name:'Buckhead' },
  { lat:33.64, lng:-84.43, r:340, k:0.48, name:'ATL Airport' },
  { lat:33.76, lng:-84.39, r:280, k:0.50, name:'Connector / I-20' },
];

export const ATLANTA_CORRIDORS = [
  { road:'downtownconn', label:'Connector · Midtown → Downtown', aLat:33.78, aLng:-84.39, bLat:33.755, bLng:-84.39, realMi:3, typMin:12, minMin:8, maxMin:30, toDt:true },
  { road:'i75', label:'I-75 · Marietta → Downtown', aLat:33.95, aLng:-84.50, bLat:33.755, bLng:-84.39, realMi:18, typMin:30, minMin:20, maxMin:55, toDt:true },
  { road:'i85', label:'I-85 · Doraville → Downtown', aLat:33.90, aLng:-84.28, bLat:33.755, bLng:-84.39, realMi:14, typMin:26, minMin:16, maxMin:50, toDt:true },
  { road:'i20', label:'I-20 · Decatur → Downtown', aLat:33.75, aLng:-84.30, bLat:33.75, bLng:-84.39, realMi:6, typMin:14, minMin:10, maxMin:32, toDt:true },
  { road:'ga400', label:'GA-400 · Alpharetta → Midtown', aLat:34.05, aLng:-84.30, bLat:33.78, bLng:-84.38, realMi:20, typMin:32, minMin:22, maxMin:55, toDt:false },
];

export const ATLANTA_JUMP_GROUPS = [
  { label:'Atlanta core', options:[['downtown','Downtown'],['midtown','Midtown'],['buckhead','Buckhead'],['oldFourth','Old Fourth Ward'],['inman','Inman Park'],['grant','Grant Park']] },
  { label:'Metro', options:[['decatur','Decatur'],['marietta','Marietta'],['sandy','Sandy Springs'],['alpharetta','Alpharetta'],['dunwoody','Dunwoody'],['airport','Airport area']] },
  { label:'Airports', options:[['atl','ATL — Hartsfield–Jackson']] },
  { label:'Attractions', options:[['poi_mercedes','Mercedes-Benz Stadium'],['poi_truist','Truist Park'],['poi_statefarm','State Farm Arena'],['poi_centennial','Centennial Park'],['poi_aquarium','Georgia Aquarium'],['poi_bank','Bank of America Plaza'],['poi_gt','Georgia Tech']] },
];

export const ATLANTA_NWS = {
  counties: /\b(Fulton|DeKalb|Cobb|Gwinnett|Clayton|Forsyth)\b/i,
  places: /Atlanta|Decatur|Marietta|Sandy Springs|Alpharetta|Dunwoody|College Park|Buckhead|Midtown|East Atlanta/i,
  foot: 'Official NWS alerts for Metro Atlanta counties',
  empty: 'No active NWS warnings for the Atlanta metro.',
};

export const ATLANTA_WATERS = [
  { n:'Chattahoochee River', lat:33.8200, lng:-84.4500, r:220, tag:'river' },
];

export const ATLANTA_CAM_EXTRAS = [{ id:'mercedes', lat:33.7554, lng:-84.4010, radius:300 }];

export const ATLANTA_SKYLINE = [
  { n:'Bank of America Plaza', lat:33.7708, lng:-84.3863, w:34, d:34, h:325, s:0, info:'1,023 ft · tallest in Atlanta', spire:50 },
  { n:'SunTrust Plaza', lat:33.7625, lng:-84.3865, w:32, d:32, h:265, s:1, info:'871 ft' },
  { n:'One Atlantic Center', lat:33.7880, lng:-84.3870, w:30, d:30, h:260, s:2, info:'820 ft · Midtown' },
  { n:'191 Peachtree Tower', lat:33.7595, lng:-84.3875, w:30, d:30, h:250, s:3, info:'770 ft' },
  { n:'Westin Peachtree Plaza', lat:33.7595, lng:-84.3880, w:28, d:28, h:230, s:0, info:'723 ft · cylindrical' },
  { n:'Georgia-Pacific Tower', lat:33.7575, lng:-84.3870, w:30, d:30, h:220, s:1, info:'697 ft' },
  { n:'Promenade II', lat:33.7865, lng:-84.3840, w:28, d:28, h:210, s:2, info:'691 ft · Midtown' },
  { n:'GLG Grand', lat:33.7850, lng:-84.3850, w:26, d:26, h:200, s:3, info:'Midtown' },
  { n:'Spire', lat:33.7750, lng:-84.3830, w:24, d:24, h:185, s:0, info:'Midtown residential' },
  { n:'1180 Peachtree', lat:33.7875, lng:-84.3845, w:28, d:28, h:180, s:1, info:'Midtown' },
  { n:'Terminus 100', lat:33.8470, lng:-84.3700, w:28, d:28, h:170, s:2, info:'Buckhead' },
  { n:'Park Avenue Condos', lat:33.8460, lng:-84.3680, w:26, d:26, h:160, s:3, info:'Buckhead' },
  { n:'Two Peachtree', lat:33.7565, lng:-84.3885, w:28, d:28, h:155, s:0, info:'Downtown' },
  { n:'State of Georgia Building', lat:33.7500, lng:-84.3905, w:30, d:30, h:145, s:1, info:'Capitol district' },
  { n:'Atlantic Station Tower', lat:33.7920, lng:-84.3970, w:26, d:26, h:130, s:2, info:'Atlantic Station' },
];

export const ATLANTA_SKYLINE_POCKETS = [
  { n:'Downtown', lat:33.7550, lng:-84.3890, count:36, rad:220, hmin:45, hmax:200 },
  { n:'Midtown', lat:33.7850, lng:-84.3840, count:34, rad:200, hmin:40, hmax:190 },
  { n:'Buckhead', lat:33.8480, lng:-84.3720, count:26, rad:180, hmin:40, hmax:160 },
  { n:'Centennial / CNN', lat:33.7590, lng:-84.3940, count:18, rad:150, hmin:35, hmax:140 },
  { n:'Atlantic Station', lat:33.7920, lng:-84.3970, count:14, rad:140, hmin:30, hmax:120 },
];

export const ATLANTA_ATTRACTIONS = [
  { kind:'stadium', n:'Mercedes-Benz Stadium', lat:33.7554, lng:-84.4010 },
  { kind:'stadium', n:'Truist Park', lat:33.8907, lng:-84.4677 },
  { kind:'arena', n:'State Farm Arena', lat:33.7573, lng:-84.3963 },
  { kind:'park', n:'Centennial Olympic Park', lat:33.7603, lng:-84.3935 },
  { kind:'museum', n:'Georgia Aquarium', lat:33.7634, lng:-84.3951 },
  { kind:'school', n:'Georgia Tech', lat:33.7756, lng:-84.3963 },
  { kind:'park', n:'Piedmont Park', lat:33.7850, lng:-84.3730 },
];

export const ATLANTA_RIVER_LATLNG = [
  [33.82,-84.48],[33.80,-84.45],[33.78,-84.43],[33.76,-84.42],[33.74,-84.41],
];

export const ATLANTA_META = {
  id:'atlanta', name:'Atlanta', metroName:'Metro Atlanta', areaName:'Atlanta-area',
  slogan:'Hotlanta · Peach State', loadingSub:'Paving the Perimeter…',
  wxPlace:'Atlanta · Downtown', freewayJumpLabel:'Freeway level — Connector @ Downtown',
  originLat:33.7490, originLng:-84.3880, groundColor:0xa8b898,
  shields:[{label:'75'},{label:'85'},{label:'20'},{label:'285'},{label:'400',small:true}],
};
