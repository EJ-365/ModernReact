/**
 * Dallas–Fort Worth metro pack — researched freeways, districts, airports, landmarks.
 * Origin: Downtown Dallas 32.7797, -96.7980. AT&T Stadium is in Arlington.
 */
export const DALLAS_ROAD_LATLNG = [
  { id:'i35e', name:'Interstate 35E — Stemmons / R.L. Thornton', short:'I-35E', closed:false, width:44, lanes:4, ff:65, share:1.45, baseY:0.82, prio:7,
    latlng:[[33.10,-96.90],[32.95,-96.88],[32.88,-96.86],[32.82,-96.84],[32.7797,-96.82],[32.75,-96.81],[32.70,-96.80],[32.60,-96.82],[32.50,-96.85]] },
  { id:'i30', name:'Interstate 30 — Tom Landry Freeway', short:'I-30', closed:false, width:44, lanes:4, ff:65, share:1.4, baseY:0.82, prio:7,
    latlng:[[32.75,-97.20],[32.75,-97.05],[32.75,-96.95],[32.76,-96.85],[32.7797,-96.80],[32.78,-96.70],[32.78,-96.55],[32.78,-96.40]] },
  { id:'i45', name:'Interstate 45 — Julius Schepps', short:'I-45', closed:false, width:40, lanes:4, ff:65, share:1.2, baseY:0.82, prio:6,
    latlng:[[32.90,-96.75],[32.85,-96.76],[32.80,-96.77],[32.7797,-96.78],[32.72,-96.78],[32.65,-96.78],[32.55,-96.80],[32.45,-96.82]] },
  { id:'us75', name:'US-75 — Central Expressway', short:'US-75', closed:false, width:40, lanes:4, ff:60, share:1.25, baseY:0.82, prio:6.5,
    latlng:[[33.10,-96.80],[33.00,-96.80],[32.92,-96.80],[32.85,-96.80],[32.80,-96.795],[32.7797,-96.795]] },
  { id:'i635', name:'Interstate 635 — LBJ Freeway', short:'I-635', closed:false, width:42, lanes:4, ff:65, share:1.3, baseY:0.82, prio:6,
    latlng:[[32.95,-97.00],[32.95,-96.90],[32.92,-96.80],[32.90,-96.70],[32.88,-96.60],[32.85,-96.55],[32.80,-96.55],[32.75,-96.60]] },
  { id:'dnt', name:'Dallas North Tollway', short:'DNT', closed:false, width:36, lanes:3, ff:65, share:1.1, baseY:0.82, prio:5.5,
    latlng:[[33.10,-96.82],[33.00,-96.82],[32.92,-96.82],[32.85,-96.82],[32.80,-96.815],[32.7797,-96.81]] },
  { id:'i20', name:'Interstate 20', short:'I-20', closed:false, width:42, lanes:4, ff:65, share:1.15, baseY:0.82, prio:5.5,
    latlng:[[32.70,-97.20],[32.70,-97.05],[32.70,-96.90],[32.70,-96.80],[32.70,-96.65],[32.70,-96.50]] },
  { id:'woodall', name:'Spur 366 — Woodall Rodgers', short:'Woodall Rodgers', closed:false, width:34, lanes:3, ff:50, share:0.9, baseY:0.9, prio:5, arterial:true,
    latlng:[[32.790,-96.820],[32.790,-96.810],[32.790,-96.800],[32.790,-96.790],[32.788,-96.780]] },
];

export const DALLAS_DISTRICTS = [
  { id:'downtown', n:'Downtown Dallas', lat:32.7797, lng:-96.7980, r:360, noHouses:true },
  { id:'uptown', n:'Uptown', lat:32.8010, lng:-96.8000, r:280, noHouses:true },
  { id:'victory', n:'Victory Park', lat:32.7905, lng:-96.8103, r:240, noHouses:true },
  { id:'deepellum', n:'Deep Ellum', lat:32.7845, lng:-96.7810, r:240 },
  { id:'bishoparts', n:'Bishop Arts', lat:32.7490, lng:-96.8280, r:240 },
  { id:'oaklawn', n:'Oak Lawn', lat:32.8050, lng:-96.8100, r:260 },
  { id:'knox', n:'Knox-Henderson', lat:32.8150, lng:-96.7850, r:220 },
  { id:'lakewood', n:'Lakewood', lat:32.8200, lng:-96.7500, r:280 },
  { id:'prestonhollow', n:'Preston Hollow', lat:32.8700, lng:-96.8000, r:320 },
  { id:'parkcities', n:'Park Cities', lat:32.8450, lng:-96.7850, r:280 },
  { id:'fortworth', n:'Downtown Fort Worth', lat:32.7555, lng:-97.3308, r:360, noHouses:true },
  { id:'arlington', n:'Arlington', lat:32.7357, lng:-97.1081, r:420 },
  { id:'irving', n:'Irving', lat:32.8140, lng:-96.9489, r:400 },
  { id:'plano', n:'Plano', lat:33.0198, lng:-96.6989, r:440 },
  { id:'frisco', n:'Frisco', lat:33.1507, lng:-96.8236, r:420 },
  { id:'mckinney', n:'McKinney', lat:33.1972, lng:-96.6397, r:400 },
  { id:'garland', n:'Garland', lat:32.9126, lng:-96.6389, r:380 },
  { id:'mesquite', n:'Mesquite', lat:32.7668, lng:-96.5992, r:340 },
  { id:'grandprairie', n:'Grand Prairie', lat:32.7459, lng:-96.9978, r:360 },
  { id:'carrollton', n:'Carrollton', lat:32.9537, lng:-96.8903, r:340 },
  { id:'richardson', n:'Richardson', lat:32.9483, lng:-96.7299, r:340 },
  { id:'addison', n:'Addison', lat:32.9618, lng:-96.8292, r:260 },
  { id:'grapevine', n:'Grapevine', lat:32.9343, lng:-97.0781, r:320 },
  { id:'southlake', n:'Southlake', lat:32.9412, lng:-97.1342, r:300 },
];

export const DALLAS_AIRPORTS = [
  { id:'dfw', code:'DFW', name:'Dallas/Fort Worth International', lat:32.8998, lng:-97.0403, rot:0.0, intl:true, runLen:700, city:'DFW Metroplex', elev:'607 ft', note:'World’s 2nd-busiest · American Airlines hub', addr:'2400 Aviation Dr, DFW Airport, TX 75261' },
  { id:'dal', code:'DAL', name:'Dallas Love Field', lat:32.8471, lng:-96.8518, rot:0.2, intl:true, runLen:520, city:'Dallas', elev:'487 ft', note:'Southwest Airlines hometown hub', addr:'8008 Herb Kelleher Way, Dallas, TX 75235' },
  { id:'ads', code:'ADS', name:'Addison Airport', lat:32.9686, lng:-97.0180, rot:-0.1, intl:false, runLen:400, city:'Addison', elev:'644 ft', note:'Busy North Dallas GA field', addr:'4505 Claire Chennault Dr, Addison, TX 75001' },
];

export const DALLAS_POIS = [
  { id:'poi_reunion', n:'Reunion Tower', lat:32.7752, lng:-96.8091, r:260 },
  { id:'poi_attstad', n:'AT&T Stadium', lat:32.7473, lng:-97.0945, r:320 },
  { id:'poi_globelife', n:'Globe Life Field', lat:32.7472, lng:-97.0835, r:300 },
  { id:'poi_aac', n:'American Airlines Center', lat:32.7905, lng:-96.8103, r:280 },
  { id:'poi_boa', n:'Bank of America Plaza', lat:32.7797, lng:-96.7965, r:220 },
  { id:'poi_fountain', n:'Fountain Place', lat:32.7845, lng:-96.7995, r:220 },
  { id:'poi_dealey', n:'Dealey Plaza', lat:32.7787, lng:-96.8085, r:220 },
  { id:'poi_fairpark', n:'Fair Park', lat:32.7815, lng:-96.7555, r:300 },
  { id:'poi_smu', n:'SMU', lat:32.8412, lng:-96.7845, r:280 },
  { id:'poi_nasher', n:'Nasher Sculpture Center', lat:32.7880, lng:-96.8005, r:220 },
  { id:'poi_perot', n:'Perot Museum', lat:32.7868, lng:-96.8065, r:240 },
  { id:'poi_klyde', n:'Klyde Warren Park', lat:32.7895, lng:-96.8015, r:240 },
  { id:'poi_sundance', n:'Sundance Square', lat:32.7555, lng:-97.3308, r:280 },
  { id:'poi_stockyards', n:'Fort Worth Stockyards', lat:32.7885, lng:-97.3470, r:280 },
];

export const DALLAS_HOTSPOTS = [
  { lat:32.7797, lng:-96.7980, r:420, k:0.55, name:'Downtown Dallas' },
  { lat:32.80, lng:-96.80, r:360, k:0.45, name:'Uptown / AAC' },
  { lat:32.85, lng:-96.80, r:340, k:0.42, name:'US-75 Central' },
  { lat:32.75, lng:-97.09, r:380, k:0.48, name:'Arlington stadiums' },
  { lat:32.90, lng:-97.04, r:360, k:0.40, name:'DFW Airport' },
];

export const DALLAS_CORRIDORS = [
  { road:'us75', label:'US-75 · Plano', aLat:33.02, aLng:-96.70, bLat:32.7797, bLng:-96.7980, realMi:22, typMin:32, minMin:24, maxMin:65, toDt:true },
  { road:'dnt', label:'Tollway · Frisco', aLat:33.15, aLng:-96.82, bLat:32.7797, bLng:-96.7980, realMi:28, typMin:35, minMin:28, maxMin:70, toDt:true },
  { road:'i30', label:'I-30 · Arlington', aLat:32.75, aLng:-97.09, bLat:32.7797, bLng:-96.7980, realMi:18, typMin:25, minMin:18, maxMin:50, toDt:true },
  { road:'i35e', label:'I-35E · Denton approach', aLat:33.05, aLng:-96.90, bLat:32.7797, bLng:-96.7980, realMi:24, typMin:30, minMin:22, maxMin:60, toDt:true },
  { road:'i30', label:'I-30 · Fort Worth', aLat:32.7555, aLng:-97.3308, bLat:32.7797, bLng:-96.7980, realMi:32, typMin:40, minMin:32, maxMin:75, toDt:true },
];

export const DALLAS_JUMP_GROUPS = [
  { label:'Dallas core', options:[['downtown','Downtown Dallas'],['uptown','Uptown'],['victory','Victory Park'],['deepellum','Deep Ellum'],['bishoparts','Bishop Arts'],['parkcities','Park Cities']] },
  { label:'North suburbs', options:[['plano','Plano'],['frisco','Frisco'],['mckinney','McKinney'],['richardson','Richardson'],['addison','Addison'],['carrollton','Carrollton']] },
  { label:'West / Mid-cities', options:[['arlington','Arlington'],['irving','Irving'],['fortworth','Fort Worth'],['grandprairie','Grand Prairie'],['grapevine','Grapevine']] },
  { label:'Airports', options:[['dfw','DFW International'],['dal','DAL — Love Field'],['ads','ADS — Addison']] },
  { label:'Attractions', options:[['poi_reunion','Reunion Tower'],['poi_attstad','AT&T Stadium'],['poi_globelife','Globe Life Field'],['poi_aac','American Airlines Center'],['poi_dealey','Dealey Plaza'],['poi_sundance','Sundance Square'],['poi_stockyards','Stockyards']] },
];

export const DALLAS_NWS = {
  counties: /\b(Dallas|Tarrant|Collin|Denton|Rockwall|Ellis|Kaufman|Johnson|Parker)\b/i,
  places: /Dallas|Fort Worth|Arlington|Plano|Irving|Frisco|McKinney|Garland|Grand Prairie|Mesquite|Carrollton|Richardson|Grapevine|Southlake|Addison/i,
  foot: 'Official NWS alerts for Dallas–Fort Worth-area counties',
  empty: 'No active NWS warnings for the Dallas–Fort Worth metro.',
};

export const DALLAS_WATERS = [
  { n:'Trinity River', lat:32.7700, lng:-96.8200, r:220, tag:'river' },
  { n:'White Rock Lake', lat:32.8100, lng:-96.7250, r:280, tag:'lake' },
  { n:'Lake Lewisville', lat:33.0800, lng:-96.9800, r:400, tag:'lake' },
  { n:'Joe Pool Lake', lat:32.6200, lng:-97.0000, r:320, tag:'lake' },
];

export const DALLAS_CAM_EXTRAS = [{ id:'arlington', lat:32.7473, lng:-97.0945, radius:380 }];

/* World height ≈ real feet / 3.16 · coords from Wikipedia / SkyscraperCenter */
export const DALLAS_SKYLINE = [
  { n:'Bank of America Plaza', lat:32.77997, lng:-96.80397, w:38, d:36, h:291, s:1, info:'921 ft · tallest in Dallas', spire:28 },
  { n:'Renaissance Tower', lat:32.78119, lng:-96.80183, w:36, d:34, h:280, s:0, info:'886 ft · twin antennas' },
  { n:'Comerica Bank Tower', lat:32.7815, lng:-96.7964, w:34, d:34, h:249, s:2, info:'787 ft · 60 floors' },
  { n:'Dallas Arts Tower', lat:32.7878, lng:-96.7966, w:32, d:30, h:233, s:1, info:'738 ft · JPMorgan Chase' },
  { n:'Fountain Place', lat:32.7846, lng:-96.8025, w:34, d:34, h:228, s:3, info:'720 ft prism' },
  { n:'Trammell Crow Center', lat:32.7875, lng:-96.7988, w:30, d:28, h:217, s:2, info:'686 ft · 2001 Ross' },
  { n:'1700 Pacific', lat:32.7830, lng:-96.7978, w:30, d:28, h:209, s:0, info:'660 ft' },
  { n:'Santander Tower', lat:32.7825, lng:-96.7960, w:28, d:26, h:204, s:1, info:'645 ft · Thanksgiving Tower' },
  { n:'The Sinclair', lat:32.7808, lng:-96.7995, w:28, d:26, h:199, s:3, info:'629 ft residential' },
  { n:'The National', lat:32.7812, lng:-96.8008, w:32, d:30, h:198, s:0, info:'625 ft · Elm Place' },
  { n:'Energy Plaza', lat:32.7840, lng:-96.7998, w:30, d:28, h:191, s:2, info:'627 ft' },
  { n:'Museum Tower', lat:32.7885, lng:-96.8005, w:26, d:26, h:170, s:1, info:'560 ft · Arts District' },
  { n:'Cityplace Tower', lat:32.8055, lng:-96.7925, w:34, d:32, h:170, s:0, info:'560 ft · North Central' },
  { n:'Reunion Tower', lat:32.7752, lng:-96.8091, w:16, d:16, h:140, s:0, info:'561 ft observation sphere', cyl:true, spire:38 },
  { n:'Burnett Plaza', lat:32.7558, lng:-97.3312, w:34, d:32, h:205, s:1, info:'873 ft · Fort Worth tallest' },
  { n:'Wells Fargo Tower FTW', lat:32.7552, lng:-97.3320, w:30, d:28, h:168, s:2, info:'546 ft · Fort Worth' },
  { n:'Frost Tower FTW', lat:32.7515, lng:-97.3308, w:28, d:26, h:155, s:3, info:'518 ft · Fort Worth' },
];

export const DALLAS_SKYLINE_POCKETS = [
  { n:'Downtown Dallas core', lat:32.7810, lng:-96.7995, count:55, rad:280, hmin:60, hmax:200 },
  { n:'Arts District', lat:32.7890, lng:-96.7980, count:18, rad:160, hmin:50, hmax:170 },
  { n:'Uptown Dallas', lat:32.8010, lng:-96.8000, count:28, rad:200, hmin:45, hmax:150 },
  { n:'Victory Park', lat:32.7905, lng:-96.8103, count:16, rad:150, hmin:40, hmax:140 },
  { n:'Cityplace / Central', lat:32.8050, lng:-96.7930, count:14, rad:160, hmin:40, hmax:140 },
  { n:'Downtown Fort Worth', lat:32.7555, lng:-97.3308, count:32, rad:240, hmin:45, hmax:170 },
];

export const DALLAS_ATTRACTIONS = [
  { kind:'tower', n:'Reunion Tower', lat:32.7752, lng:-96.8091 },
  { kind:'stadium', n:'AT&T Stadium', lat:32.7473, lng:-97.0945 },
  { kind:'stadium', n:'Globe Life Field', lat:32.7472, lng:-97.0835 },
  { kind:'arena', n:'American Airlines Center', lat:32.7905, lng:-96.8103 },
  { kind:'school', n:'SMU', lat:32.8412, lng:-96.7845 },
  { kind:'museum', n:'Perot Museum', lat:32.7868, lng:-96.8065 },
  { kind:'landmark', n:'Dealey Plaza', lat:32.7787, lng:-96.8083 },
  { kind:'landmark', n:'Fort Worth Stockyards', lat:32.7885, lng:-97.3470 },
];

export const DALLAS_RIVER_LATLNG = [
  [32.82,-96.85],[32.80,-96.84],[32.78,-96.83],[32.77,-96.82],[32.75,-96.81],[32.72,-96.80],
];

export const DALLAS_META = {
  id:'dallas', name:'Dallas', metroName:'Dallas–Fort Worth', areaName:'DFW-area',
  slogan:'Big D · Metroplex', loadingSub:'Paving North Texas freeways…',
  wxPlace:'Dallas · Downtown', freewayJumpLabel:'Freeway level — I-35E @ Downtown',
  originLat:32.7797, originLng:-96.7980, groundColor:0xb4c890,
  shields:[{label:'35E'},{label:'30'},{label:'45'},{label:'75',us:true},{label:'635'},{label:'DNT',small:true}],
};
