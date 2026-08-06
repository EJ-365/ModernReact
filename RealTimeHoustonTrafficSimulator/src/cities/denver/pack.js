/** Denver metro pack — researched freeways, districts, airports, landmarks. */
export const DENVER_ROAD_LATLNG = [
  { id:'i25', name:'I-25 Valley Highway', short:'I-25', closed:false, width:44, lanes:4, ff:55, share:1.5, baseY:0.82, prio:7,
    latlng:[[39.95,-104.99],[39.85,-104.99],[39.78,-104.99],[39.74,-104.99],[39.70,-104.99],[39.65,-104.99],[39.55,-104.99]] },
  { id:'i70', name:'I-70', short:'I-70', closed:false, width:42, lanes:4, ff:60, share:1.3, baseY:0.82, prio:6.5,
    latlng:[[39.78,-105.15],[39.78,-105.05],[39.78,-104.99],[39.78,-104.90],[39.78,-104.80],[39.78,-104.70],[39.86,-104.67]] },
  { id:'i76', name:'I-76', short:'I-76', closed:false, width:36, lanes:3, ff:60, share:0.9, baseY:0.82, prio:5,
    latlng:[[39.82,-105.02],[39.84,-104.95],[39.86,-104.88],[39.88,-104.80]] },
  { id:'i225', name:'I-225', short:'I-225', closed:false, width:38, lanes:3, ff:55, share:1.0, baseY:0.82, prio:5.5,
    latlng:[[39.78,-104.82],[39.72,-104.82],[39.68,-104.83],[39.64,-104.84],[39.62,-104.88]] },
  { id:'us6', name:'US-6 Sixth Avenue Freeway', short:'US-6', closed:false, width:34, lanes:3, ff:50, share:1.05, baseY:0.88, prio:5, arterial:true,
    latlng:[[39.73,-105.15],[39.73,-105.05],[39.73,-104.99],[39.73,-104.92]] },
  { id:'c470', name:'C-470', short:'C-470', closed:false, width:38, lanes:3, ff:60, share:0.95, baseY:0.82, prio:4.5,
    latlng:[[39.62,-105.15],[39.58,-105.10],[39.55,-105.00],[39.55,-104.90],[39.58,-104.82]] },
];

export const DENVER_DISTRICTS = [
  { id:'downtown', n:'Downtown Denver', lat:39.7392, lng:-104.9903, r:280, noHouses:true },
  { id:'lodo', n:'LoDo', lat:39.7530, lng:-104.9990, r:240, noHouses:true },
  { id:'riNo', n:'RiNo', lat:39.7680, lng:-104.9820, r:260 },
  { id:'capHill', n:'Capitol Hill', lat:39.7340, lng:-104.9780, r:240 },
  { id:'cherry', n:'Cherry Creek', lat:39.7170, lng:-104.9520, r:260 },
  { id:'tech', n:'Tech Center', lat:39.6000, lng:-104.8900, r:320, noHouses:true },
  { id:'highlands', n:'Highlands', lat:39.7620, lng:-105.0200, r:280 },
  { id:'fivepoints', n:'Five Points', lat:39.7580, lng:-104.9770, r:220 },
  { id:'aurora', n:'Aurora', lat:39.7294, lng:-104.8319, r:400 },
  { id:'lakewood', n:'Lakewood', lat:39.7047, lng:-105.0814, r:360 },
  { id:'boulder', n:'Boulder', lat:40.0150, lng:-105.2705, r:380 },
  { id:'centennial', n:'Centennial', lat:39.5807, lng:-104.8772, r:320 },
  { id:'westminster', n:'Westminster', lat:39.8367, lng:-105.0372, r:320 },
  { id:'arvada', n:'Arvada', lat:39.8028, lng:-105.0875, r:320 },
  { id:'englewood', n:'Englewood', lat:39.6478, lng:-104.9878, r:280 },
  { id:'dia', n:'DIA / Gateway', lat:39.8561, lng:-104.6737, r:380 },
  { id:'goldentri', n:'Golden Triangle', lat:39.7350, lng:-104.9900, r:200 },
  { id:'stapleton', n:'Central Park', lat:39.7600, lng:-104.8900, r:300 },
];

export const DENVER_AIRPORTS = [
  { id:'den', code:'DEN', name:'Denver International', lat:39.8561, lng:-104.6737, rot:-0.4, intl:true, runLen:780, city:'Denver', elev:'5,434 ft', note:'United hub · largest US airport by area', addr:'8500 Peña Blvd, Denver, CO 80249' },
];

export const DENVER_POIS = [
  { id:'poi_republic', n:'Republic Plaza', lat:39.7425, lng:-104.9895, r:240 },
  { id:'poi_coors', n:'Coors Field', lat:39.7559, lng:-104.9942, r:260 },
  { id:'poi_empower', n:'Empower Field at Mile High', lat:39.7439, lng:-105.0201, r:280 },
  { id:'poi_ball', n:'Ball Arena', lat:39.7487, lng:-105.0077, r:260 },
  { id:'poi_capitol', n:'Colorado State Capitol', lat:39.7392, lng:-104.9849, r:220 },
  { id:'poi_union', n:'Union Station', lat:39.7530, lng:-105.0000, r:240 },
  { id:'poi_redrocks', n:'Red Rocks Amphitheatre', lat:39.6654, lng:-105.2057, r:300 },
  { id:'poi_16th', n:'16th Street Mall', lat:39.7430, lng:-104.9900, r:240 },
  { id:'poi_denverart', n:'Denver Art Museum', lat:39.7371, lng:-104.9892, r:220 },
  { id:'poi_botanic', n:'Denver Botanic Gardens', lat:39.7322, lng:-104.9608, r:240 },
  { id:'poi_meow', n:'Meow Wolf Convergence Station', lat:39.7820, lng:-105.0210, r:240 },
  { id:'poi_cu', n:'University of Colorado Boulder', lat:40.0076, lng:-105.2659, r:300 },
];

export const DENVER_HOTSPOTS = [
  { lat:39.740, lng:-104.990, r:360, k:0.52, name:'Downtown / LoDo' },
  { lat:39.86, lng:-104.67, r:340, k:0.48, name:'DIA' },
  { lat:39.60, lng:-104.89, r:300, k:0.40, name:'Tech Center / I-25' },
  { lat:39.78, lng:-104.99, r:280, k:0.38, name:'I-70 / I-25' },
  { lat:40.01, lng:-105.27, r:260, k:0.32, name:'Boulder' },
];

export const DENVER_CORRIDORS = [
  { road:'i25', label:'I-25 · Tech Center → Downtown', aLat:39.60, aLng:-104.89, bLat:39.74, bLng:-104.99, realMi:12, typMin:22, minMin:14, maxMin:45, toDt:true },
  { road:'i25', label:'I-25 · Thornton → Downtown', aLat:39.87, aLng:-104.99, bLat:39.74, bLng:-104.99, realMi:10, typMin:20, minMin:12, maxMin:40, toDt:true },
  { road:'i70', label:'I-70 · Lakewood → Downtown', aLat:39.78, aLng:-105.08, bLat:39.78, bLng:-104.99, realMi:6, typMin:14, minMin:10, maxMin:30, toDt:true },
  { road:'i70', label:'I-70 · DIA → Downtown', aLat:39.86, aLng:-104.67, bLat:39.74, bLng:-104.99, realMi:24, typMin:35, minMin:25, maxMin:60, toDt:true },
  { road:'us6', label:'US-6 · Golden → Downtown', aLat:39.73, aLng:-105.12, bLat:39.73, bLng:-104.99, realMi:8, typMin:16, minMin:12, maxMin:35, toDt:true },
];

export const DENVER_JUMP_GROUPS = [
  { label:'Denver core', options:[['downtown','Downtown'],['lodo','LoDo'],['riNo','RiNo'],['capHill','Capitol Hill'],['cherry','Cherry Creek'],['highlands','Highlands']] },
  { label:'Metro', options:[['tech','Tech Center'],['aurora','Aurora'],['lakewood','Lakewood'],['centennial','Centennial'],['westminster','Westminster'],['boulder','Boulder']] },
  { label:'Airports', options:[['den','DEN — Denver Intl']] },
  { label:'Attractions', options:[['poi_coors','Coors Field'],['poi_empower','Empower Field'],['poi_ball','Ball Arena'],['poi_capitol','State Capitol'],['poi_union','Union Station'],['poi_redrocks','Red Rocks'],['poi_16th','16th Street Mall']] },
];

export const DENVER_NWS = {
  counties: /\b(Denver|Arapahoe|Jefferson|Adams|Douglas|Boulder)\b/i,
  places: /Denver|Aurora|Lakewood|Boulder|Centennial|Westminster|Arvada|Englewood|Cherry Creek|LoDo|RiNo|Golden/i,
  foot: 'Official NWS alerts for Front Range counties',
  empty: 'No active NWS warnings for the Denver metro.',
};

export const DENVER_WATERS = [
  { n:'South Platte River', lat:39.7500, lng:-105.0050, r:200, tag:'river' },
  { n:'Cherry Creek', lat:39.7300, lng:-104.9700, r:160, tag:'creek' },
];

export const DENVER_CAM_EXTRAS = [{ id:'coors', lat:39.7559, lng:-104.9942, radius:280 }];

export const DENVER_SKYLINE = [
  { n:'Republic Plaza', lat:39.7425, lng:-104.9895, w:32, d:32, h:225, s:0, info:'714 ft · tallest in Denver' },
  { n:'1144 Fifteenth', lat:39.7440, lng:-104.9960, w:28, d:28, h:210, s:1, info:'660 ft' },
  { n:'1801 California', lat:39.7470, lng:-104.9890, w:30, d:30, h:200, s:2, info:'709 ft' },
  { n:'Wells Fargo Center', lat:39.7445, lng:-104.9915, w:28, d:28, h:195, s:3, info:'698 ft · Cash Register' },
  { n:'Four Seasons Hotel & Residences', lat:39.7455, lng:-104.9980, w:26, d:26, h:185, s:0, info:'LoDo edge' },
  { n:'Spire', lat:39.7435, lng:-104.9955, w:24, d:24, h:175, s:1, info:'Residential tower' },
  { n:'Colorado State Bank Building', lat:39.7460, lng:-104.9920, w:28, d:28, h:170, s:2, info:'Downtown' },
  { n:'Independence Plaza', lat:39.7450, lng:-104.9905, w:28, d:28, h:165, s:3, info:'16th & Broadway' },
  { n:'World Trade Center Denver', lat:39.7480, lng:-104.9965, w:26, d:26, h:155, s:0, info:'LoDo' },
  { n:'Larimer Place', lat:39.7495, lng:-104.9990, w:24, d:24, h:140, s:1, info:'LoDo' },
  { n:'The Confluence', lat:39.7540, lng:-105.0020, w:26, d:26, h:135, s:2, info:'Riverfront' },
  { n:'One Tabor Center', lat:39.7465, lng:-104.9985, w:28, d:28, h:130, s:3, info:'16th Street' },
  { n:'Granite Building', lat:39.7485, lng:-104.9900, w:22, d:22, h:110, s:0, info:'Historic core' },
  { n:'DCTC Tower', lat:39.5980, lng:-104.8920, w:28, d:28, h:120, s:1, info:'Tech Center' },
  { n:'Denver Place South', lat:39.7475, lng:-104.9885, w:26, d:26, h:125, s:2, info:'Downtown east' },
];

export const DENVER_SKYLINE_POCKETS = [
  { n:'Downtown / CBD', lat:39.7430, lng:-104.9910, count:40, rad:220, hmin:45, hmax:180 },
  { n:'LoDo', lat:39.7520, lng:-104.9980, count:24, rad:170, hmin:35, hmax:140 },
  { n:'RiNo', lat:39.7680, lng:-104.9820, count:18, rad:160, hmin:30, hmax:110 },
  { n:'Tech Center', lat:39.6000, lng:-104.8900, count:22, rad:200, hmin:35, hmax:130 },
  { n:'Capitol Hill edge', lat:39.7360, lng:-104.9820, count:16, rad:140, hmin:30, hmax:100 },
];

export const DENVER_ATTRACTIONS = [
  { kind:'stadium', n:'Coors Field', lat:39.7559, lng:-104.9942 },
  { kind:'stadium', n:'Empower Field at Mile High', lat:39.7439, lng:-105.0201 },
  { kind:'arena', n:'Ball Arena', lat:39.7487, lng:-105.0077 },
  { kind:'landmark', n:'Colorado State Capitol', lat:39.7392, lng:-104.9849 },
  { kind:'landmark', n:'Union Station', lat:39.7530, lng:-105.0000 },
  { kind:'landmark', n:'Red Rocks Amphitheatre', lat:39.6654, lng:-105.2057 },
  { kind:'museum', n:'Denver Art Museum', lat:39.7371, lng:-104.9892 },
];

export const DENVER_RIVER_LATLNG = [
  [39.780,-105.02],[39.765,-105.01],[39.755,-105.00],[39.745,-104.995],[39.730,-104.990],
];

export const DENVER_META = {
  id:'denver', name:'Denver', metroName:'Front Range', areaName:'Denver-area',
  slogan:'Mile High City · Rockies', loadingSub:'Paving the Front Range…',
  wxPlace:'Denver · Downtown', freewayJumpLabel:'Freeway level — I-25 @ Downtown',
  originLat:39.7392, originLng:-104.9903, groundColor:0xb0a888,
  shields:[{label:'25'},{label:'70'},{label:'225'},{label:'76'},{label:'6',us:true,small:true}],
};
