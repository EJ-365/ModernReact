/** New Orleans metro pack — researched freeways, districts, airports, landmarks. */
export const NEWORLEANS_ROAD_LATLNG = [
  { id:'i10', name:'I-10', short:'I-10', closed:false, width:44, lanes:4, ff:55, share:1.45, baseY:0.82, prio:7,
    latlng:[[29.98,-90.25],[29.97,-90.18],[29.96,-90.12],[29.95,-90.08],[29.95,-90.05],[29.96,-89.95],[29.98,-89.88]] },
  { id:'i610', name:'I-610', short:'I-610', closed:false, width:40, lanes:3, ff:55, share:1.25, baseY:0.82, prio:6,
    latlng:[[30.00,-90.12],[30.00,-90.08],[30.00,-90.04],[30.00,-90.00]] },
  { id:'us90', name:'US-90 Business / Westbank Expwy', short:'US-90', closed:false, width:38, lanes:3, ff:50, share:1.2, baseY:0.82, prio:5.5,
    latlng:[[29.93,-90.15],[29.94,-90.10],[29.94,-90.07],[29.95,-90.05]] },
  { id:'claiborne', name:'Claiborne Avenue / I-10', short:'Claiborne', closed:false, width:36, lanes:3, ff:40, share:1.15, baseY:0.8, prio:5,
    latlng:[[29.98,-90.10],[29.97,-90.09],[29.96,-90.08],[29.95,-90.07],[29.94,-90.07]] },
  { id:'causeway', name:'Lake Pontchartrain Causeway', short:'Causeway', closed:false, width:32, lanes:2, ff:55, share:1.0, baseY:0.85, prio:5.5,
    latlng:[[30.10,-90.12],[30.05,-90.12],[30.00,-90.12],[29.98,-90.12]] },
  { id:'i55', name:'I-55', short:'I-55', closed:false, width:38, lanes:3, ff:60, share:1.1, baseY:0.82, prio:5,
    latlng:[[30.10,-90.45],[30.05,-90.40],[30.00,-90.35],[29.98,-90.28]] },
];

export const NEWORLEANS_DISTRICTS = [
  { id:'downtown', n:'CBD / Downtown', lat:29.9511, lng:-90.0715, r:260, noHouses:true },
  { id:'frenchquarter', n:'French Quarter', lat:29.9584, lng:-90.0644, r:220, noHouses:true },
  { id:'garden', n:'Garden District', lat:29.9290, lng:-90.0840, r:240 },
  { id:'marigny', n:'Marigny', lat:29.9640, lng:-90.0550, r:220 },
  { id:'bywater', n:'Bywater', lat:29.9650, lng:-90.0400, r:240 },
  { id:'midcity', n:'Mid-City', lat:29.9750, lng:-90.1000, r:280 },
  { id:'uptown', n:'Uptown', lat:29.9350, lng:-90.1100, r:280 },
  { id:'lakeview', n:'Lakeview', lat:30.0050, lng:-90.1000, r:280 },
  { id:'gentilly', n:'Gentilly', lat:30.0000, lng:-90.0600, r:280 },
  { id:'airport', n:'Kenner / Airport', lat:29.9934, lng:-90.2580, r:340 },
  { id:'metairie', n:'Metairie', lat:29.9840, lng:-90.1520, r:320 },
  { id:'algiers', n:'Algiers', lat:29.9400, lng:-90.0400, r:280 },
  { id:'warehouse', n:'Warehouse District', lat:29.9450, lng:-90.0680, r:220, noHouses:true },
  { id:'treme', n:'Tremé', lat:29.9680, lng:-90.0750, r:220 },
];

export const NEWORLEANS_AIRPORTS = [
  { id:'msy', code:'MSY', name:'Louis Armstrong New Orleans International', lat:29.9934, lng:-90.2580, rot:0.1, intl:true, runLen:760, city:'Kenner', elev:'4 ft', note:'MSY · Gulf Coast hub', addr:'1 Terminal Dr, Kenner, LA 70062' },
];

export const NEWORLEANS_POIS = [
  { id:'poi_superdome', n:'Caesars Superdome', lat:29.9511, lng:-90.0812, r:300 },
  { id:'poi_smoothie', n:'Smoothie King Center', lat:29.9490, lng:-90.0820, r:260 },
  { id:'poi_jackson', n:'Jackson Square', lat:29.9574, lng:-90.0629, r:200 },
  { id:'poi_bourbon', n:'Bourbon Street', lat:29.9580, lng:-90.0650, r:200 },
  { id:'poi_audubon', n:'Audubon Park / Zoo', lat:29.9220, lng:-90.1260, r:260 },
  { id:'poi_citypark', n:'City Park', lat:29.9950, lng:-90.0950, r:280 },
  { id:'poi_aquarium', n:'Audubon Aquarium', lat:29.9500, lng:-90.0600, r:220 },
  { id:'poi_convention', n:'Convention Center', lat:29.9450, lng:-90.0620, r:240 },
  { id:'poi_tulane', n:'Tulane University', lat:29.9400, lng:-90.1200, r:260 },
  { id:'poi_cecil', n:'French Market', lat:29.9600, lng:-90.0580, r:200 },
];

export const NEWORLEANS_HOTSPOTS = [
  { lat:29.951, lng:-90.072, r:360, k:0.55, name:'CBD / Quarter' },
  { lat:29.99, lng:-90.26, r:340, k:0.48, name:'MSY Airport' },
  { lat:29.95, lng:-90.08, r:300, k:0.50, name:'Superdome' },
  { lat:29.98, lng:-90.15, r:280, k:0.40, name:'Metairie' },
  { lat:29.93, lng:-90.11, r:260, k:0.38, name:'Uptown' },
];

export const NEWORLEANS_CORRIDORS = [
  { road:'i10', label:'I-10 · Airport → CBD', aLat:29.99, aLng:-90.26, bLat:29.95, bLng:-90.07, realMi:12, typMin:22, minMin:14, maxMin:45, toDt:true },
  { road:'i10', label:'I-10 · East → CBD', aLat:29.98, aLng:-89.90, bLat:29.95, bLng:-90.07, realMi:10, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'causeway', label:'Causeway · North Shore → Metairie', aLat:30.10, aLng:-90.12, bLat:29.98, bLng:-90.12, realMi:12, typMin:20, minMin:14, maxMin:35, toDt:false },
  { road:'us90', label:'Westbank Expwy → CBD', aLat:29.93, aLng:-90.15, bLat:29.95, bLng:-90.07, realMi:6, typMin:14, minMin:10, maxMin:30, toDt:true },
];

export const NEWORLEANS_JUMP_GROUPS = [
  { label:'New Orleans core', options:[['downtown','CBD'],['frenchquarter','French Quarter'],['warehouse','Warehouse District'],['garden','Garden District'],['marigny','Marigny'],['bywater','Bywater']] },
  { label:'Neighborhoods', options:[['midcity','Mid-City'],['uptown','Uptown'],['lakeview','Lakeview'],['gentilly','Gentilly'],['metairie','Metairie'],['algiers','Algiers'],['airport','Kenner / Airport']] },
  { label:'Airports', options:[['msy','MSY — Louis Armstrong']] },
  { label:'Attractions', options:[['poi_superdome','Caesars Superdome'],['poi_jackson','Jackson Square'],['poi_bourbon','Bourbon Street'],['poi_audubon','Audubon'],['poi_citypark','City Park'],['poi_aquarium','Aquarium']] },
];

export const NEWORLEANS_NWS = {
  counties: /\b(Orleans|Jefferson|St\.?\s*Bernard|St\.?\s*Tammany|Plaquemines|St\.?\s*Charles)\b/i,
  places: /New Orleans|Metairie|Kenner|Gretna|Slidell|French Quarter|Bywater|Uptown|Lakeview|Algiers/i,
  foot: 'Official NWS alerts for Greater New Orleans parishes',
  empty: 'No active NWS warnings for the New Orleans metro.',
};

export const NEWORLEANS_WATERS = [
  { n:'Mississippi River', lat:29.9400, lng:-90.0600, r:260, tag:'river' },
  { n:'Lake Pontchartrain', lat:30.0500, lng:-90.1000, r:300, tag:'lake' },
];

export const NEWORLEANS_CAM_EXTRAS = [{ id:'superdome', lat:29.9511, lng:-90.0812, radius:320 }];

export const NEWORLEANS_SKYLINE = [
  { n:'Hancock Whitney Center', lat:29.9515, lng:-90.0720, w:34, d:34, h:212, s:0, info:'697 ft · tallest in Louisiana', spire:20 },
  { n:'Place St. Charles', lat:29.9505, lng:-90.0730, w:30, d:30, h:197, s:1, info:'645 ft' },
  { n:'Energy Centre', lat:29.9500, lng:-90.0710, w:28, d:28, h:192, s:2, info:'645 ft' },
  { n:'First Bank and Trust Tower', lat:29.9510, lng:-90.0700, w:28, d:28, h:160, s:3, info:'CBD' },
  { n:'One Shell Square', lat:29.9495, lng:-90.0725, w:30, d:30, h:212, s:0, info:'Historic tallest' },
  { n:'400 Poydras Tower', lat:29.9485, lng:-90.0700, w:26, d:26, h:145, s:1, info:'CBD' },
  { n:'Hilton New Orleans Riverside', lat:29.9460, lng:-90.0630, w:28, d:28, h:140, s:2, info:'Riverfront' },
  { n:'Sheraton New Orleans', lat:29.9520, lng:-90.0705, w:26, d:26, h:135, s:3, info:'Canal Street' },
  { n:'JW Marriott', lat:29.9510, lng:-90.0690, w:26, d:26, h:130, s:0, info:'CBD' },
  { n:'Harrah\'s New Orleans', lat:29.9465, lng:-90.0660, w:30, d:30, h:120, s:1, info:'Casino' },
  { n:'World Trade Center', lat:29.9480, lng:-90.0635, w:28, d:28, h:125, s:2, info:'Riverfront' },
  { n:'Texaco Center', lat:29.9490, lng:-90.0715, w:26, d:26, h:115, s:3, info:'CBD' },
  { n:'Poydras Center', lat:29.9495, lng:-90.0740, w:24, d:24, h:110, s:0, info:'CBD' },
  { n:'Orleans Tower', lat:29.9525, lng:-90.0735, w:24, d:24, h:105, s:1, info:'CBD' },
  { n:'Canal Place', lat:29.9515, lng:-90.0650, w:26, d:26, h:100, s:2, info:'Canal / River' },
];

export const NEWORLEANS_SKYLINE_POCKETS = [
  { n:'CBD', lat:29.9511, lng:-90.0715, count:34, rad:200, hmin:40, hmax:170 },
  { n:'Warehouse / River', lat:29.9450, lng:-90.0650, count:20, rad:160, hmin:30, hmax:130 },
  { n:'French Quarter edge', lat:29.9580, lng:-90.0650, count:14, rad:140, hmin:25, hmax:90 },
  { n:'Mid-City', lat:29.9750, lng:-90.1000, count:16, rad:150, hmin:25, hmax:100 },
  { n:'Metairie', lat:29.9840, lng:-90.1520, count:18, rad:160, hmin:30, hmax:110 },
];

export const NEWORLEANS_ATTRACTIONS = [
  { kind:'stadium', n:'Caesars Superdome', lat:29.9511, lng:-90.0812 },
  { kind:'arena', n:'Smoothie King Center', lat:29.9490, lng:-90.0820 },
  { kind:'park', n:'Jackson Square', lat:29.9574, lng:-90.0629 },
  { kind:'park', n:'Audubon Park', lat:29.9220, lng:-90.1260 },
  { kind:'park', n:'City Park', lat:29.9950, lng:-90.0950 },
  { kind:'museum', n:'Audubon Aquarium', lat:29.9500, lng:-90.0600 },
  { kind:'school', n:'Tulane University', lat:29.9400, lng:-90.1200 },
];

export const NEWORLEANS_RIVER_LATLNG = [
  [29.98,-90.02],[29.96,-90.04],[29.95,-90.06],[29.94,-90.07],[29.93,-90.09],[29.92,-90.12],
];

export const NEWORLEANS_META = {
  id:'neworleans', name:'New Orleans', metroName:'Greater New Orleans', areaName:'New Orleans-area',
  slogan:'The Big Easy · Louisiana', loadingSub:'Paving the Crescent City…',
  wxPlace:'New Orleans · CBD', freewayJumpLabel:'Freeway level — I-10 @ CBD',
  originLat:29.9511, originLng:-90.0715, groundColor:0x98a888,
  shields:[{label:'10'},{label:'610'},{label:'90'},{label:'55',small:true}],
};
