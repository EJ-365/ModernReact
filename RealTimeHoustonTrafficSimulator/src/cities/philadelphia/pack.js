/** Philadelphia metro pack — researched freeways, districts, airports, landmarks. */
export const PHILADELPHIA_ROAD_LATLNG = [
  { id:'i95', name:'I-95', short:'I-95', closed:false, width:44, lanes:4, ff:55, share:1.45, baseY:0.82, prio:7,
    latlng:[[40.05,-75.06],[39.98,-75.10],[39.95,-75.14],[39.93,-75.15],[39.90,-75.16],[39.87,-75.18]] },
  { id:'i76', name:'I-76 Schuylkill', short:'I-76', closed:false, width:42, lanes:3, ff:50, share:1.35, baseY:0.82, prio:6.5,
    latlng:[[39.98,-75.28],[39.96,-75.22],[39.95,-75.18],[39.95,-75.16],[39.94,-75.14]] },
  { id:'i676', name:'I-676 Vine Street', short:'I-676', closed:false, width:38, lanes:3, ff:50, share:1.25, baseY:0.82, prio:6,
    latlng:[[39.96,-75.20],[39.96,-75.17],[39.96,-75.15],[39.96,-75.13]] },
  { id:'us1', name:'US-1 Roosevelt Blvd', short:'US-1', closed:false, width:36, lanes:3, ff:45, share:1.2, baseY:0.8, prio:5.5,
    latlng:[[40.08,-75.05],[40.04,-75.08],[40.00,-75.12],[39.97,-75.14],[39.95,-75.16]] },
  { id:'i476', name:'I-476 Blue Route', short:'I-476', closed:false, width:40, lanes:3, ff:60, share:1.15, baseY:0.82, prio:6,
    latlng:[[40.10,-75.30],[40.02,-75.30],[39.95,-75.30],[39.90,-75.30]] },
  { id:'kelly', name:'Kelly Drive', short:'Kelly', closed:false, width:28, lanes:2, ff:35, share:0.9, baseY:0.75, prio:4,
    latlng:[[39.98,-75.20],[39.97,-75.18],[39.96,-75.17],[39.95,-75.17]] },
];

export const PHILADELPHIA_DISTRICTS = [
  { id:'downtown', n:'Center City', lat:39.9526, lng:-75.1652, r:280, noHouses:true },
  { id:'oldcity', n:'Old City', lat:39.9500, lng:-75.1450, r:220, noHouses:true },
  { id:'university', n:'University City', lat:39.9520, lng:-75.1930, r:260 },
  { id:'fishtown', n:'Fishtown', lat:39.9700, lng:-75.1350, r:240 },
  { id:'southphilly', n:'South Philadelphia', lat:39.9200, lng:-75.1600, r:300 },
  { id:'northphilly', n:'North Philadelphia', lat:39.9900, lng:-75.1550, r:300 },
  { id:'westphilly', n:'West Philadelphia', lat:39.9600, lng:-75.2100, r:280 },
  { id:'manayunk', n:'Manayunk', lat:40.0250, lng:-75.2250, r:260 },
  { id:'chestnut', n:'Chestnut Hill', lat:40.0750, lng:-75.2100, r:260 },
  { id:'airport', n:'Airport / Tinicum', lat:39.8721, lng:-75.2411, r:340 },
  { id:'camden', n:'Camden waterfront', lat:39.9450, lng:-75.1200, r:260 },
  { id:'queen', n:'Queen Village', lat:39.9350, lng:-75.1500, r:220 },
  { id:'rittenhouse', n:'Rittenhouse', lat:39.9490, lng:-75.1720, r:200, noHouses:true },
  { id:'noliberty', n:'Northern Liberties', lat:39.9650, lng:-75.1400, r:220 },
];

export const PHILADELPHIA_AIRPORTS = [
  { id:'phl', code:'PHL', name:'Philadelphia International', lat:39.8721, lng:-75.2411, rot:0.2, intl:true, runLen:760, city:'Philadelphia', elev:'36 ft', note:'American hub · Delaware River', addr:'8000 Essington Ave, Philadelphia, PA 19153' },
];

export const PHILADELPHIA_POIS = [
  { id:'poi_liberty', n:'Independence Hall', lat:39.9489, lng:-75.1500, r:220 },
  { id:'poi_bell', n:'Liberty Bell', lat:39.9496, lng:-75.1503, r:200 },
  { id:'poi_love', n:'Love Park', lat:39.9540, lng:-75.1655, r:200 },
  { id:'poi_art', n:'Philadelphia Museum of Art', lat:39.9656, lng:-75.1810, r:260 },
  { id:'poi_lincoln', n:'Lincoln Financial Field', lat:39.9008, lng:-75.1675, r:300 },
  { id:'poi_citizens', n:'Citizens Bank Park', lat:39.9060, lng:-75.1665, r:280 },
  { id:'poi_wells', n:'Wells Fargo Center', lat:39.9012, lng:-75.1720, r:280 },
  { id:'poi_penn', n:'University of Pennsylvania', lat:39.9522, lng:-75.1932, r:280 },
  { id:'poi_temple', n:'Temple University', lat:39.9812, lng:-75.1554, r:260 },
  { id:'poi_boathouse', n:'Boathouse Row', lat:39.9700, lng:-75.1880, r:220 },
  { id:'poi_reading', n:'Reading Terminal Market', lat:39.9530, lng:-75.1590, r:200 },
];

export const PHILADELPHIA_HOTSPOTS = [
  { lat:39.953, lng:-75.165, r:360, k:0.55, name:'Center City' },
  { lat:39.87, lng:-75.24, r:340, k:0.48, name:'PHL Airport' },
  { lat:39.90, lng:-75.17, r:300, k:0.45, name:'Sports Complex' },
  { lat:39.95, lng:-75.19, r:280, k:0.42, name:'University City' },
  { lat:39.95, lng:-75.15, r:260, k:0.40, name:'Old City' },
];

export const PHILADELPHIA_CORRIDORS = [
  { road:'i95', label:'I-95 · Airport → Center City', aLat:39.87, aLng:-75.24, bLat:39.95, bLng:-75.17, realMi:8, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'i76', label:'I-76 · West → Center City', aLat:39.96, aLng:-75.25, bLat:39.95, bLng:-75.17, realMi:6, typMin:14, minMin:10, maxMin:35, toDt:true },
  { road:'i676', label:'Vine Street · across Center City', aLat:39.96, aLng:-75.20, bLat:39.96, bLng:-75.13, realMi:4, typMin:12, minMin:8, maxMin:28, toDt:false },
  { road:'us1', label:'Roosevelt Blvd · Northeast → Center City', aLat:40.05, aLng:-75.06, bLat:39.95, bLng:-75.17, realMi:12, typMin:28, minMin:18, maxMin:50, toDt:true },
];

export const PHILADELPHIA_JUMP_GROUPS = [
  { label:'Center City', options:[['downtown','Center City'],['rittenhouse','Rittenhouse'],['oldcity','Old City'],['university','University City'],['fishtown','Fishtown']] },
  { label:'Neighborhoods', options:[['southphilly','South Philly'],['northphilly','North Philly'],['westphilly','West Philly'],['manayunk','Manayunk'],['noliberty','Northern Liberties']] },
  { label:'Airports', options:[['phl','PHL — Philadelphia Intl']] },
  { label:'Attractions', options:[['poi_liberty','Independence Hall'],['poi_art','Art Museum'],['poi_lincoln','Lincoln Financial Field'],['poi_citizens','Citizens Bank Park'],['poi_wells','Wells Fargo Center'],['poi_penn','Penn']] },
];

export const PHILADELPHIA_NWS = {
  counties: /\b(Philadelphia|Delaware|Montgomery|Bucks|Camden|Gloucester|Burlington)\b/i,
  places: /Philadelphia|Center City|University City|Camden|Cherry Hill|King of Prussia|Conshohocken|South Philly|Fishtown/i,
  foot: 'Official NWS alerts for Greater Philadelphia counties',
  empty: 'No active NWS warnings for the Philadelphia metro.',
};

export const PHILADELPHIA_WATERS = [
  { n:'Delaware River', lat:39.9500, lng:-75.1350, r:240, tag:'river' },
  { n:'Schuylkill River', lat:39.9600, lng:-75.1800, r:200, tag:'river' },
];

export const PHILADELPHIA_CAM_EXTRAS = [{ id:'artmuseum', lat:39.9656, lng:-75.1810, radius:300 }];

export const PHILADELPHIA_SKYLINE = [
  { n:'Comcast Technology Center', lat:39.9549, lng:-75.1685, w:36, d:36, h:340, s:0, info:'1,121 ft · tallest in Philly', spire:60 },
  { n:'Comcast Center', lat:39.9547, lng:-75.1684, w:34, d:34, h:297, s:1, info:'975 ft' },
  { n:'One Liberty Place', lat:39.9520, lng:-75.1680, w:32, d:32, h:288, s:2, info:'945 ft', spire:40 },
  { n:'Two Liberty Place', lat:39.9515, lng:-75.1675, w:30, d:30, h:258, s:3, info:'848 ft' },
  { n:'Bny Mellon Center', lat:39.9510, lng:-75.1690, w:30, d:30, h:241, s:0, info:'792 ft' },
  { n:'Three Logan Square', lat:39.9555, lng:-75.1700, w:28, d:28, h:225, s:1, info:'739 ft' },
  { n:'G. Fred DiBona Jr. Building', lat:39.9530, lng:-75.1670, w:28, d:28, h:190, s:2, info:'625 ft' },
  { n:'One Commerce Square', lat:39.9535, lng:-75.1650, w:28, d:28, h:180, s:3, info:'Center City' },
  { n:'W Hotel / Residences', lat:39.9505, lng:-75.1640, w:26, d:26, h:170, s:0, info:'Center City' },
  { n:'Cira Centre', lat:39.9550, lng:-75.1820, w:28, d:28, h:160, s:1, info:'University City' },
  { n:'FMC Tower', lat:39.9540, lng:-75.1800, w:26, d:26, h:150, s:2, info:'University City' },
  { n:'Municipal Services Building', lat:39.9535, lng:-75.1645, w:28, d:28, h:140, s:3, info:'City Hall area' },
  { n:'Philadelphia City Hall', lat:39.9526, lng:-75.1636, w:40, d:40, h:167, s:0, info:'548 ft · William Penn', spire:30 },
  { n:'Aramark Tower', lat:39.9500, lng:-75.1600, w:26, d:26, h:130, s:1, info:'Center City' },
  { n:'Wells Fargo Building', lat:39.9518, lng:-75.1660, w:26, d:26, h:135, s:2, info:'Center City' },
];

export const PHILADELPHIA_SKYLINE_POCKETS = [
  { n:'Center City', lat:39.9526, lng:-75.1652, count:40, rad:220, hmin:45, hmax:200 },
  { n:'University City', lat:39.9520, lng:-75.1930, count:24, rad:180, hmin:35, hmax:150 },
  { n:'Old City', lat:39.9500, lng:-75.1450, count:18, rad:150, hmin:30, hmax:120 },
  { n:'South Philly', lat:39.9200, lng:-75.1600, count:16, rad:160, hmin:30, hmax:110 },
  { n:'Waterfront', lat:39.9450, lng:-75.1400, count:14, rad:140, hmin:30, hmax:100 },
];

export const PHILADELPHIA_ATTRACTIONS = [
  { kind:'museum', n:'Independence Hall', lat:39.9489, lng:-75.1500 },
  { kind:'museum', n:'Philadelphia Museum of Art', lat:39.9656, lng:-75.1810 },
  { kind:'stadium', n:'Lincoln Financial Field', lat:39.9008, lng:-75.1675 },
  { kind:'stadium', n:'Citizens Bank Park', lat:39.9060, lng:-75.1665 },
  { kind:'arena', n:'Wells Fargo Center', lat:39.9012, lng:-75.1720 },
  { kind:'school', n:'University of Pennsylvania', lat:39.9522, lng:-75.1932 },
  { kind:'park', n:'Boathouse Row', lat:39.9700, lng:-75.1880 },
];

export const PHILADELPHIA_RIVER_LATLNG = [
  [40.00,-75.07],[39.97,-75.12],[39.95,-75.14],[39.93,-75.14],[39.90,-75.15],
];

export const PHILADELPHIA_META = {
  id:'philadelphia', name:'Philadelphia', metroName:'Greater Philadelphia', areaName:'Philadelphia-area',
  slogan:'City of Brotherly Love · Pennsylvania', loadingSub:'Paving the Schuylkill…',
  wxPlace:'Philadelphia · Center City', freewayJumpLabel:'Freeway level — I-95 @ Center City',
  originLat:39.9526, originLng:-75.1652, groundColor:0xa8b0a0,
  shields:[{label:'95'},{label:'76'},{label:'676'},{label:'476'},{label:'1',small:true}],
};
