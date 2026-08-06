/** Seattle metro pack — researched freeways, districts, airports, landmarks. */
export const SEATTLE_ROAD_LATLNG = [
  { id:'i5', name:'I-5', short:'I-5', closed:false, width:44, lanes:4, ff:55, share:1.5, baseY:0.82, prio:7,
    latlng:[[47.78,-122.32],[47.70,-122.32],[47.64,-122.33],[47.61,-122.33],[47.58,-122.32],[47.52,-122.31],[47.45,-122.30],[47.38,-122.29]] },
  { id:'i90', name:'I-90 Mountains to Sound', short:'I-90', closed:false, width:40, lanes:4, ff:60, share:1.25, baseY:0.82, prio:6.5,
    latlng:[[47.595,-122.33],[47.590,-122.28],[47.585,-122.22],[47.580,-122.15],[47.575,-122.08],[47.570,-122.00]] },
  { id:'i405', name:'I-405', short:'I-405', closed:false, width:40, lanes:4, ff:55, share:1.2, baseY:0.82, prio:6,
    latlng:[[47.75,-122.18],[47.68,-122.18],[47.62,-122.19],[47.58,-122.17],[47.52,-122.18],[47.45,-122.20],[47.40,-122.22]] },
  { id:'sr520', name:'SR-520 Evergreen Point', short:'520', closed:false, width:34, lanes:3, ff:50, share:1.05, baseY:0.85, prio:5.5,
    latlng:[[47.645,-122.32],[47.643,-122.28],[47.640,-122.24],[47.638,-122.20],[47.635,-122.15]] },
  { id:'sr99', name:'SR-99 / Aurora / Alaskan Way', short:'99', closed:false, width:32, lanes:3, ff:40, share:1.0, baseY:0.9, prio:5, arterial:true,
    latlng:[[47.70,-122.34],[47.66,-122.35],[47.62,-122.35],[47.61,-122.34],[47.60,-122.34],[47.58,-122.34],[47.55,-122.33]] },
  { id:'i705', name:'I-705 Tacoma Spur', short:'I-705', closed:false, width:32, lanes:3, ff:50, share:0.7, baseY:0.82, prio:4,
    latlng:[[47.26,-122.45],[47.25,-122.44],[47.25,-122.43]] },
];

export const SEATTLE_DISTRICTS = [
  { id:'downtown', n:'Downtown Seattle', lat:47.6062, lng:-122.3321, r:280, noHouses:true },
  { id:'belltown', n:'Belltown', lat:47.6140, lng:-122.3450, r:220, noHouses:true },
  { id:'capHill', n:'Capitol Hill', lat:47.6250, lng:-122.3210, r:260 },
  { id:'slu', n:'South Lake Union', lat:47.6255, lng:-122.3380, r:240, noHouses:true },
  { id:'queenanne', n:'Queen Anne', lat:47.6370, lng:-122.3570, r:260 },
  { id:'fremont', n:'Fremont', lat:47.6510, lng:-122.3500, r:240 },
  { id:'ballard', n:'Ballard', lat:47.6680, lng:-122.3850, r:280 },
  { id:'uDistrict', n:'University District', lat:47.6600, lng:-122.3130, r:280 },
  { id:'intl', n:'International District', lat:47.5985, lng:-122.3240, r:220 },
  { id:'sodo', n:'SODO', lat:47.5800, lng:-122.3350, r:280 },
  { id:'westseattle', n:'West Seattle', lat:47.5710, lng:-122.3860, r:320 },
  { id:'beacon', n:'Beacon Hill', lat:47.5750, lng:-122.3100, r:260 },
  { id:'bellevue', n:'Bellevue', lat:47.6101, lng:-122.2015, r:340, noHouses:true },
  { id:'redmond', n:'Redmond', lat:47.6740, lng:-122.1215, r:320 },
  { id:'kirkland', n:'Kirkland', lat:47.6815, lng:-122.2087, r:300 },
  { id:'renton', n:'Renton', lat:47.4829, lng:-122.2171, r:320 },
  { id:'tacoma', n:'Tacoma', lat:47.2529, lng:-122.4443, r:380 },
  { id:'seaTac', n:'SeaTac', lat:47.4502, lng:-122.3088, r:300 },
  { id:'everett', n:'Everett', lat:47.9790, lng:-122.2021, r:360 },
];

export const SEATTLE_AIRPORTS = [
  { id:'sea', code:'SEA', name:'Seattle–Tacoma International', lat:47.4502, lng:-122.3088, rot:0.0, intl:true, runLen:680, city:'SeaTac', elev:'433 ft', note:'Alaska Airlines hub · Delta Pacific gateway', addr:'17801 International Blvd, Seattle, WA 98158' },
  { id:'bfi', code:'BFI', name:'King County International (Boeing Field)', lat:47.5300, lng:-122.3020, rot:0.15, intl:false, runLen:420, city:'Seattle', elev:'21 ft', note:'GA / cargo / Boeing', addr:'7277 Perimeter Rd S, Seattle, WA 98108' },
];

export const SEATTLE_POIS = [
  { id:'poi_space', n:'Space Needle', lat:47.6205, lng:-122.3493, r:260 },
  { id:'poi_pike', n:'Pike Place Market', lat:47.6097, lng:-122.3425, r:240 },
  { id:'poi_columbia', n:'Columbia Center', lat:47.6046, lng:-122.3305, r:240 },
  { id:'poi_lumen', n:'Lumen Field', lat:47.5952, lng:-122.3316, r:260 },
  { id:'poi_tMobile', n:'T-Mobile Park', lat:47.5914, lng:-122.3325, r:260 },
  { id:'poi_climate', n:'Climate Pledge Arena', lat:47.6221, lng:-122.3540, r:240 },
  { id:'poi_uw', n:'University of Washington', lat:47.6553, lng:-122.3035, r:300 },
  { id:'poi_ferry', n:'Colman Dock / Ferry Terminal', lat:47.6026, lng:-122.3381, r:220 },
  { id:'poi_gumwall', n:'Gum Wall', lat:47.6083, lng:-122.3401, r:180 },
  { id:'poi_kerry', n:'Kerry Park', lat:47.6295, lng:-122.3598, r:200 },
  { id:'poi_amazon', n:'Amazon Spheres', lat:47.6205, lng:-122.3392, r:220 },
  { id:'poi_museum', n:'MoPOP', lat:47.6215, lng:-122.3481, r:220 },
  { id:'poi_gasworks', n:'Gas Works Park', lat:47.6456, lng:-122.3344, r:240 },
];

export const SEATTLE_HOTSPOTS = [
  { lat:47.606, lng:-122.332, r:360, k:0.55, name:'Downtown' },
  { lat:47.62, lng:-122.35, r:280, k:0.42, name:'Seattle Center / SLU' },
  { lat:47.45, lng:-122.31, r:300, k:0.45, name:'Sea-Tac' },
  { lat:47.61, lng:-122.20, r:280, k:0.40, name:'Bellevue / I-405' },
  { lat:47.59, lng:-122.25, r:260, k:0.38, name:'I-90 Bridge' },
];

export const SEATTLE_CORRIDORS = [
  { road:'i5', label:'I-5 · Everett → Downtown', aLat:47.78, aLng:-122.32, bLat:47.606, bLng:-122.332, realMi:14, typMin:28, minMin:18, maxMin:55, toDt:true },
  { road:'i5', label:'I-5 · SeaTac → Downtown', aLat:47.45, aLng:-122.31, bLat:47.606, bLng:-122.332, realMi:13, typMin:24, minMin:16, maxMin:50, toDt:true },
  { road:'i90', label:'I-90 · Bellevue → Downtown', aLat:47.59, aLng:-122.15, bLat:47.596, bLng:-122.33, realMi:10, typMin:18, minMin:12, maxMin:40, toDt:true },
  { road:'sr520', label:'520 · Redmond → Downtown', aLat:47.64, aLng:-122.15, bLat:47.645, bLng:-122.32, realMi:10, typMin:20, minMin:14, maxMin:42, toDt:true },
  { road:'i405', label:'I-405 · Renton → Bellevue', aLat:47.48, aLng:-122.20, bLat:47.61, bLng:-122.19, realMi:12, typMin:22, minMin:14, maxMin:45, toDt:false },
];

export const SEATTLE_JUMP_GROUPS = [
  { label:'Seattle core', options:[['downtown','Downtown'],['belltown','Belltown'],['capHill','Capitol Hill'],['slu','South Lake Union'],['queenanne','Queen Anne'],['intl','International District']] },
  { label:'Neighborhoods', options:[['fremont','Fremont'],['ballard','Ballard'],['uDistrict','U District'],['westseattle','West Seattle'],['sodo','SODO']] },
  { label:'Eastside / South', options:[['bellevue','Bellevue'],['redmond','Redmond'],['kirkland','Kirkland'],['renton','Renton'],['seaTac','SeaTac'],['tacoma','Tacoma']] },
  { label:'Airports', options:[['sea','SEA — Sea-Tac'],['bfi','BFI — Boeing Field']] },
  { label:'Attractions', options:[['poi_space','Space Needle'],['poi_pike','Pike Place'],['poi_lumen','Lumen Field'],['poi_tMobile','T-Mobile Park'],['poi_climate','Climate Pledge'],['poi_uw','UW'],['poi_amazon','Amazon Spheres']] },
];

export const SEATTLE_NWS = {
  counties: /\b(King|Snohomish|Pierce|Kitsap)\b/i,
  places: /Seattle|Bellevue|Redmond|Kirkland|Renton|Tacoma|Everett|SeaTac|Ballard|Fremont|Capitol Hill|Belltown/i,
  foot: 'Official NWS alerts for Puget Sound counties',
  empty: 'No active NWS warnings for the Seattle metro.',
};

export const SEATTLE_WATERS = [
  { n:'Elliott Bay', lat:47.6050, lng:-122.3500, r:360, tag:'bay' },
  { n:'Lake Union', lat:47.6400, lng:-122.3330, r:260, tag:'lake' },
  { n:'Lake Washington', lat:47.6200, lng:-122.2500, r:420, tag:'lake' },
  { n:'Puget Sound', lat:47.5900, lng:-122.4000, r:400, tag:'sound' },
];

export const SEATTLE_CAM_EXTRAS = [{ id:'spaceneedle', lat:47.6205, lng:-122.3493, radius:280 }];

export const SEATTLE_SKYLINE = [
  { n:'Columbia Center', lat:47.6046, lng:-122.3305, w:34, d:34, h:305, s:0, info:'937 ft · tallest in Seattle', spire:40 },
  { n:'1201 Third Avenue', lat:47.6065, lng:-122.3360, w:28, d:28, h:235, s:1, info:'772 ft' },
  { n:'Two Union Square', lat:47.6100, lng:-122.3335, w:30, d:30, h:230, s:2, info:'740 ft' },
  { n:'Seattle Municipal Tower', lat:47.6050, lng:-122.3295, w:28, d:28, h:220, s:3, info:'722 ft' },
  { n:'F5 Tower', lat:47.6055, lng:-122.3315, w:26, d:26, h:210, s:0, info:'660 ft' },
  { n:'Rainier Square Tower', lat:47.6090, lng:-122.3345, w:28, d:28, h:230, s:1, info:'850 ft' },
  { n:'Safeco Plaza', lat:47.6058, lng:-122.3325, w:30, d:30, h:200, s:2, info:'630 ft' },
  { n:'U.S. Bank Centre', lat:47.6085, lng:-122.3355, w:28, d:28, h:190, s:3, info:'607 ft' },
  { n:'Space Needle', lat:47.6205, lng:-122.3493, w:18, d:18, h:190, s:0, info:'605 ft · icon', spire:50 },
  { n:'Arrivé', lat:47.6145, lng:-122.3400, w:24, d:24, h:160, s:1, info:'Belltown' },
  { n:'Insignia North', lat:47.6160, lng:-122.3420, w:26, d:26, h:155, s:2, info:'Denny Triangle' },
  { n:'The Bravern Tower', lat:47.6165, lng:-122.2010, w:26, d:26, h:140, s:3, info:'Bellevue' },
  { n:'Bellevue Towers', lat:47.6150, lng:-122.2000, w:28, d:28, h:145, s:0, info:'Bellevue CBD' },
  { n:'AMLI Arc', lat:47.6220, lng:-122.3370, w:24, d:24, h:130, s:1, info:'South Lake Union' },
  { n:'Smith Tower', lat:47.6020, lng:-122.3318, w:18, d:18, h:115, s:2, info:'1914 landmark' },
];

export const SEATTLE_SKYLINE_POCKETS = [
  { n:'Downtown', lat:47.6060, lng:-122.3320, count:42, rad:220, hmin:45, hmax:200 },
  { n:'Denny Triangle / Belltown', lat:47.6150, lng:-122.3400, count:28, rad:180, hmin:40, hmax:160 },
  { n:'South Lake Union', lat:47.6250, lng:-122.3380, count:22, rad:160, hmin:35, hmax:140 },
  { n:'Bellevue CBD', lat:47.6120, lng:-122.2005, count:24, rad:170, hmin:40, hmax:150 },
  { n:'Pioneer Square', lat:47.6015, lng:-122.3325, count:16, rad:140, hmin:30, hmax:110 },
];

export const SEATTLE_ATTRACTIONS = [
  { kind:'landmark', n:'Space Needle', lat:47.6205, lng:-122.3493 },
  { kind:'landmark', n:'Pike Place Market', lat:47.6097, lng:-122.3425 },
  { kind:'stadium', n:'Lumen Field', lat:47.5952, lng:-122.3316 },
  { kind:'stadium', n:'T-Mobile Park', lat:47.5914, lng:-122.3325 },
  { kind:'arena', n:'Climate Pledge Arena', lat:47.6221, lng:-122.3540 },
  { kind:'school', n:'University of Washington', lat:47.6553, lng:-122.3035 },
  { kind:'park', n:'Gas Works Park', lat:47.6456, lng:-122.3344 },
];

export const SEATTLE_RIVER_LATLNG = [
  [47.660,-122.40],[47.655,-122.38],[47.650,-122.36],[47.645,-122.34],[47.640,-122.33],
];

export const SEATTLE_META = {
  id:'seattle', name:'Seattle', metroName:'Puget Sound', areaName:'Seattle-area',
  slogan:'Emerald City · Pacific Northwest', loadingSub:'Paving the Sound freeways…',
  wxPlace:'Seattle · Downtown', freewayJumpLabel:'Freeway level — I-5 @ Downtown',
  originLat:47.6062, originLng:-122.3321, groundColor:0x98b090,
  shields:[{label:'5'},{label:'90'},{label:'405'},{label:'520'},{label:'99',small:true}],
};
