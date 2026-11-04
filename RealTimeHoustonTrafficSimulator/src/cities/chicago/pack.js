/** Chicago metro pack — researched freeways, districts, airports, landmarks. */
export const CHICAGO_ROAD_LATLNG = [
  { id:'i90', name:'I-90 / I-94 Dan Ryan / Kennedy', short:'I-90/94', closed:false, width:44, lanes:4, ff:55, share:1.45, baseY:0.82, prio:7,
    latlng:[[42.02,-87.67],[41.95,-87.66],[41.90,-87.64],[41.88,-87.63],[41.85,-87.63],[41.80,-87.63],[41.75,-87.625],[41.70,-87.62]] },
  { id:'i290', name:'I-290 Eisenhower Expressway', short:'I-290', closed:false, width:38, lanes:3, ff:55, share:1.2, baseY:0.82, prio:6.5,
    latlng:[[41.875,-87.85],[41.875,-87.78],[41.875,-87.72],[41.875,-87.66],[41.876,-87.64],[41.878,-87.63]] },
  { id:'i55', name:'I-55 Stevenson Expressway', short:'I-55', closed:false, width:38, lanes:3, ff:55, share:1.15, baseY:0.82, prio:6,
    latlng:[[41.78,-87.90],[41.82,-87.80],[41.84,-87.72],[41.85,-87.68],[41.86,-87.65],[41.87,-87.63]] },
  { id:'i94', name:'I-94 Edens / Bishop Ford', short:'I-94', closed:false, width:40, lanes:4, ff:55, share:1.1, baseY:0.82, prio:6,
    latlng:[[42.10,-87.75],[42.05,-87.72],[41.98,-87.70],[41.94,-87.68],[41.90,-87.64],[41.88,-87.63]] },
  { id:'lsd', name:'Lake Shore Drive', short:'LSD', closed:false, width:32, lanes:3, ff:45, share:1.05, baseY:0.9, prio:5.5, arterial:true,
    latlng:[[42.00,-87.66],[41.96,-87.65],[41.92,-87.63],[41.89,-87.62],[41.87,-87.62],[41.85,-87.61],[41.82,-87.60]] },
  { id:'i294', name:'I-294 Tri-State Tollway', short:'I-294', closed:false, width:40, lanes:4, ff:60, share:1.0, baseY:0.82, prio:5,
    latlng:[[42.05,-87.92],[41.95,-87.90],[41.88,-87.88],[41.80,-87.86],[41.70,-87.85]] },
  { id:'i57', name:'I-57', short:'I-57', closed:false, width:36, lanes:3, ff:60, share:0.85, baseY:0.82, prio:4.5,
    latlng:[[41.65,-87.68],[41.72,-87.65],[41.78,-87.64],[41.82,-87.63]] },
];

export const CHICAGO_DISTRICTS = [
  { id:'downtown', n:'The Loop', lat:41.8819, lng:-87.6278, r:280, noHouses:true },
  { id:'rivernorth', n:'River North', lat:41.8925, lng:-87.6300, r:240, noHouses:true },
  { id:'streeterville', n:'Streeterville', lat:41.8935, lng:-87.6200, r:220, noHouses:true },
  { id:'westloop', n:'West Loop', lat:41.8830, lng:-87.6480, r:260, noHouses:true },
  { id:'southloop', n:'South Loop', lat:41.8670, lng:-87.6270, r:260 },
  { id:'lincolnpark', n:'Lincoln Park', lat:41.9210, lng:-87.6430, r:300 },
  { id:'lakefront', n:'Gold Coast', lat:41.9050, lng:-87.6250, r:220 },
  { id:'wicker', n:'Wicker Park', lat:41.9080, lng:-87.6770, r:260 },
  { id:'logan', n:'Logan Square', lat:41.9280, lng:-87.7070, r:280 },
  { id:'hydepark', n:'Hyde Park', lat:41.7943, lng:-87.5907, r:300 },
  { id:'pilsen', n:'Pilsen', lat:41.8540, lng:-87.6620, r:260 },
  { id:'chinatown', n:'Chinatown', lat:41.8520, lng:-87.6320, r:200 },
  { id:'bridgeport', n:'Bridgeport', lat:41.8380, lng:-87.6480, r:260 },
  { id:'ohrare', n:'O\'Hare / Rosemont', lat:41.9800, lng:-87.9000, r:380 },
  { id:'evanston', n:'Evanston', lat:42.0451, lng:-87.6877, r:340 },
  { id:'oakpark', n:'Oak Park', lat:41.8850, lng:-87.7845, r:300 },
  { id:'naperville', n:'Naperville', lat:41.7508, lng:-88.1535, r:420 },
  { id:'schaumburg', n:'Schaumburg', lat:42.0334, lng:-88.0834, r:380 },
  { id:'skokie', n:'Skokie', lat:42.0324, lng:-87.7416, r:300 },
  { id:'cicero', n:'Cicero', lat:41.8456, lng:-87.7539, r:280 },
  { id:'aurora', n:'Aurora', lat:41.7606, lng:-88.3201, r:400 },
  { id:'joliet', n:'Joliet', lat:41.5250, lng:-88.0817, r:380 },
];

export const CHICAGO_AIRPORTS = [
  { id:'ord', code:'ORD', name:'Chicago O\'Hare International', lat:41.9786, lng:-87.9048, rot:-0.35, intl:true, runLen:720, city:'Chicago', elev:'672 ft', note:'United / American hub · world\'s busiest', addr:'10000 W O\'Hare Ave, Chicago, IL 60666' },
  { id:'mdw', code:'MDW', name:'Chicago Midway International', lat:41.7868, lng:-87.7522, rot:0.15, intl:false, runLen:480, city:'Chicago', elev:'620 ft', note:'Southwest focus city', addr:'5700 S Cicero Ave, Chicago, IL 60638' },
];

export const CHICAGO_POIS = [
  { id:'poi_willis', n:'Willis Tower', lat:41.8789, lng:-87.6359, r:260 },
  { id:'poi_trump', n:'Trump International Tower', lat:41.8890, lng:-87.6264, r:240 },
  { id:'poi_hancock', n:'875 N Michigan (Hancock)', lat:41.8988, lng:-87.6229, r:240 },
  { id:'poi_bean', n:'Cloud Gate (The Bean)', lat:41.8827, lng:-87.6233, r:220 },
  { id:'poi_navy', n:'Navy Pier', lat:41.8917, lng:-87.6051, r:280 },
  { id:'poi_wrigley', n:'Wrigley Field', lat:41.9484, lng:-87.6553, r:260 },
  { id:'poi_united', n:'United Center', lat:41.8807, lng:-87.6742, r:260 },
  { id:'poi_soldier', n:'Soldier Field', lat:41.8623, lng:-87.6167, r:260 },
  { id:'poi_art', n:'Art Institute of Chicago', lat:41.8796, lng:-87.6237, r:220 },
  { id:'poi_field', n:'Field Museum', lat:41.8663, lng:-87.6170, r:240 },
  { id:'poi_aquarium', n:'Shedd Aquarium', lat:41.8676, lng:-87.6140, r:220 },
  { id:'poi_millenium', n:'Millennium Park', lat:41.8826, lng:-87.6226, r:240 },
  { id:'poi_uchicago', n:'University of Chicago', lat:41.7886, lng:-87.5987, r:300 },
  { id:'poi_magmile', n:'Magnificent Mile', lat:41.8970, lng:-87.6240, r:260 },
];

export const CHICAGO_HOTSPOTS = [
  { lat:41.882, lng:-87.628, r:380, k:0.55, name:'The Loop' },
  { lat:41.89, lng:-87.62, r:300, k:0.42, name:'Streeterville / Mag Mile' },
  { lat:41.98, lng:-87.90, r:340, k:0.48, name:'O\'Hare' },
  { lat:41.79, lng:-87.75, r:280, k:0.38, name:'Midway / I-55' },
  { lat:41.88, lng:-87.65, r:280, k:0.40, name:'West Loop / I-290' },
];

export const CHICAGO_CORRIDORS = [
  { road:'i90', label:'I-90/94 · Evanston → Loop', aLat:42.02, aLng:-87.67, bLat:41.882, bLng:-87.628, realMi:10, typMin:22, minMin:14, maxMin:45, toDt:true },
  { road:'i290', label:'I-290 · Oak Park → Loop', aLat:41.875, aLng:-87.78, bLat:41.882, bLng:-87.628, realMi:8, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'i55', label:'I-55 · Midway → Loop', aLat:41.79, aLng:-87.75, bLat:41.882, bLng:-87.628, realMi:9, typMin:20, minMin:14, maxMin:42, toDt:true },
  { road:'lsd', label:'LSD · Lincoln Park → Loop', aLat:41.92, aLng:-87.63, bLat:41.882, bLng:-87.622, realMi:4, typMin:14, minMin:10, maxMin:28, toDt:true },
  { road:'i90', label:'Kennedy · O\'Hare → Loop', aLat:41.98, aLng:-87.90, bLat:41.882, bLng:-87.628, realMi:17, typMin:32, minMin:22, maxMin:60, toDt:true },
];

export const CHICAGO_JUMP_GROUPS = [
  { label:'Downtown', options:[['downtown','The Loop'],['rivernorth','River North'],['streeterville','Streeterville'],['westloop','West Loop'],['southloop','South Loop']] },
  { label:'North / West', options:[['lincolnpark','Lincoln Park'],['lakefront','Gold Coast'],['wicker','Wicker Park'],['logan','Logan Square'],['evanston','Evanston'],['oakpark','Oak Park']] },
  { label:'South / Suburbs', options:[['hydepark','Hyde Park'],['pilsen','Pilsen'],['naperville','Naperville'],['schaumburg','Schaumburg'],['joliet','Joliet']] },
  { label:'Airports', options:[['ord','ORD — O\'Hare'],['mdw','MDW — Midway']] },
  { label:'Attractions', options:[['poi_willis','Willis Tower'],['poi_bean','The Bean'],['poi_navy','Navy Pier'],['poi_wrigley','Wrigley Field'],['poi_united','United Center'],['poi_soldier','Soldier Field'],['poi_hancock','Hancock']] },
];

export const CHICAGO_NWS = {
  counties: /\b(Cook|DuPage|Lake|Will|Kane|McHenry)\b/i,
  places: /Chicago|Evanston|Oak Park|Naperville|Schaumburg|Skokie|Cicero|Aurora|Joliet|Rosemont|Hyde Park|Wicker Park/i,
  foot: 'Official NWS alerts for Chicago-area counties',
  empty: 'No active NWS warnings for the Chicago metro.',
};

export const CHICAGO_WATERS = [
  { n:'Chicago River', lat:41.8880, lng:-87.6270, r:200, tag:'river' },
  { n:'Lake Michigan', lat:41.8900, lng:-87.6000, r:520, tag:'lake' },
  { n:'Chicago Harbor', lat:41.8880, lng:-87.6100, r:220, tag:'harbor' },
];

export const CHICAGO_CAM_EXTRAS = [{ id:'wrigley', lat:41.9484, lng:-87.6553, radius:280 }];

/* World height ≈ real feet / 3.16 · Loop + Near North */
export const CHICAGO_SKYLINE = [
  { n:'Willis Tower', lat:41.8789, lng:-87.6359, w:42, d:42, h:460, s:0, info:'1,450 ft · Sears Tower', spire:90 },
  { n:'Trump International Hotel & Tower', lat:41.8890, lng:-87.6264, w:36, d:36, h:440, s:1, info:'1,389 ft' },
  { n:'Aon Center', lat:41.8853, lng:-87.6215, w:34, d:34, h:360, s:2, info:'1,136 ft' },
  { n:'875 North Michigan (Hancock)', lat:41.8988, lng:-87.6229, w:32, d:32, h:355, s:3, info:'1,128 ft · antennas', spire:80 },
  { n:'Franklin Center', lat:41.8796, lng:-87.6340, w:30, d:36, h:320, s:0, info:'1,007 ft' },
  { n:'Two Prudential Plaza', lat:41.8855, lng:-87.6225, w:28, d:28, h:315, s:1, info:'995 ft' },
  { n:'311 South Wacker', lat:41.8775, lng:-87.6355, w:30, d:30, h:300, s:2, info:'961 ft' },
  { n:'NEMA Chicago', lat:41.8665, lng:-87.6230, w:26, d:26, h:285, s:3, info:'896 ft · South Loop' },
  { n:'Vista Tower', lat:41.8905, lng:-87.6185, w:28, d:28, h:280, s:0, info:'1,191 ft · Lakeshore East' },
  { n:'One Chicago East Tower', lat:41.8960, lng:-87.6310, w:28, d:28, h:270, s:1, info:'River North' },
  { n:'Salesforce Tower Chicago', lat:41.8865, lng:-87.6375, w:32, d:32, h:260, s:2, info:'Wolf Point' },
  { n:'Aqua Tower', lat:41.8865, lng:-87.6200, w:28, d:30, h:270, s:3, info:'860 ft · Jeanne Gang' },
  { n:'Marina City', lat:41.8880, lng:-87.6290, w:24, d:24, h:185, s:0, info:'Corncob towers' },
  { n:'Tribune Tower', lat:41.8905, lng:-87.6235, w:22, d:22, h:145, s:1, info:'Gothic landmark' },
  { n:'Wrigley Building', lat:41.8897, lng:-87.6247, w:24, d:24, h:135, s:2, info:'Clock tower twin' },
];

export const CHICAGO_SKYLINE_POCKETS = [
  { n:'The Loop', lat:41.8815, lng:-87.6290, count:48, rad:240, hmin:50, hmax:220 },
  { n:'River North', lat:41.8920, lng:-87.6300, count:28, rad:180, hmin:40, hmax:180 },
  { n:'Streeterville', lat:41.8930, lng:-87.6200, count:26, rad:170, hmin:45, hmax:200 },
  { n:'West Loop', lat:41.8830, lng:-87.6480, count:22, rad:180, hmin:35, hmax:150 },
  { n:'South Loop', lat:41.8670, lng:-87.6250, count:20, rad:160, hmin:40, hmax:160 },
];

export const CHICAGO_ATTRACTIONS = [
  { kind:'landmark', n:'Willis Tower', lat:41.8789, lng:-87.6359 },
  { kind:'park', n:'Millennium Park', lat:41.8826, lng:-87.6226 },
  { kind:'stadium', n:'Wrigley Field', lat:41.9484, lng:-87.6553 },
  { kind:'arena', n:'United Center', lat:41.8807, lng:-87.6742 },
  { kind:'stadium', n:'Soldier Field', lat:41.8623, lng:-87.6167 },
  { kind:'museum', n:'Art Institute of Chicago', lat:41.8796, lng:-87.6237 },
  { kind:'landmark', n:'Navy Pier', lat:41.8917, lng:-87.6051 },
];

export const CHICAGO_RIVER_LATLNG = [
  [41.888,-87.645],[41.888,-87.635],[41.888,-87.627],[41.889,-87.622],[41.890,-87.617],
];

export const CHICAGO_META = {
  id:'chicago', name:'Chicago', metroName:'Chicagoland', areaName:'Chicago-area',
  slogan:'Windy City · Great Lakes', loadingSub:'Paving the Expressways…',
  wxPlace:'Chicago · The Loop', freewayJumpLabel:'Freeway level — LSD @ Grant Park',
  originLat:41.8781, originLng:-87.6298, groundColor:0xa4b090,
  shields:[{label:'90'},{label:'94'},{label:'290'},{label:'55'},{label:'LSD',small:true}],
};
