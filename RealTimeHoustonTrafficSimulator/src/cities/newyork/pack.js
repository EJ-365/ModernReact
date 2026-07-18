/** New York metro pack — researched freeways/bridges, districts, airports, landmarks. */
export const NEWYORK_ROAD_LATLNG = [
  { id:'fdr', name:'FDR Drive', short:'FDR', closed:false, width:34, lanes:3, ff:45, share:1.2, baseY:0.9, prio:6,
    latlng:[[40.703,-74.013],[40.711,-73.992],[40.728,-73.972],[40.744,-73.973],[40.758,-73.958],[40.785,-73.944],[40.805,-73.925]] },
  { id:'wsh', name:'West Side Highway / Henry Hudson', short:'West Side Hwy', closed:false, width:34, lanes:3, ff:45, share:1.15, baseY:0.9, prio:6,
    latlng:[[40.704,-74.017],[40.725,-74.012],[40.748,-74.009],[40.773,-73.990],[40.820,-73.960],[40.851,-73.952],[40.878,-73.922]] },
  { id:'i278', name:'I-278 BQE / Gowanus', short:'I-278', closed:false, width:36, lanes:3, ff:50, share:1.1, baseY:0.82, prio:5.5,
    latlng:[[40.606,-74.045],[40.650,-74.010],[40.685,-73.995],[40.715,-73.955],[40.745,-73.935],[40.770,-73.900],[40.780,-73.880]] },
  { id:'i95', name:'I-95 Cross Bronx / GWB', short:'I-95', closed:false, width:40, lanes:4, ff:55, share:1.25, baseY:0.82, prio:6.5,
    latlng:[[40.840,-74.050],[40.851,-73.960],[40.851,-73.952],[40.838,-73.890],[40.830,-73.850],[40.820,-73.800],[40.920,-73.720]] },
  { id:'i495', name:'I-495 Long Island Expressway', short:'LIE', closed:false, width:40, lanes:4, ff:55, share:1.2, baseY:0.82, prio:6,
    latlng:[[40.745,-73.973],[40.744,-73.930],[40.740,-73.900],[40.740,-73.840],[40.745,-73.780],[40.760,-73.720]] },
  { id:'bqe', name:'Brooklyn-Queens Expressway', short:'BQE', closed:false, width:34, lanes:3, ff:45, share:1.05, baseY:0.85, prio:5.5,
    latlng:[[40.670,-74.000],[40.695,-73.990],[40.715,-73.960],[40.735,-73.940],[40.755,-73.925],[40.765,-73.910]] },
  { id:'gwb', name:'George Washington Bridge approaches', short:'GWB', closed:false, width:40, lanes:4, ff:45, share:1.0, baseY:0.95, prio:5,
    latlng:[[40.8515,-74.020],[40.8515,-73.990],[40.851,-73.960],[40.851,-73.952],[40.848,-73.925]] },
];

export const NEWYORK_DISTRICTS = [
  { id:'fidi', n:'Financial District', lat:40.7074, lng:-74.0113, r:280, noHouses:true },
  { id:'midtown', n:'Midtown Manhattan', lat:40.7549, lng:-73.9840, r:420, noHouses:true },
  { id:'ues', n:'Upper East Side', lat:40.7736, lng:-73.9566, r:320 },
  { id:'uws', n:'Upper West Side', lat:40.7870, lng:-73.9754, r:320 },
  { id:'harlem', n:'Harlem', lat:40.8116, lng:-73.9465, r:360 },
  { id:'chelsea', n:'Chelsea', lat:40.7465, lng:-74.0014, r:260, noHouses:true },
  { id:'greenwich', n:'Greenwich Village', lat:40.7336, lng:-74.0027, r:240, noHouses:true },
  { id:'tribeca', n:'Tribeca', lat:40.7163, lng:-74.0086, r:220, noHouses:true },
  { id:'brooklynhts', n:'Brooklyn Heights', lat:40.6960, lng:-73.9936, r:240 },
  { id:'dtbrooklyn', n:'Downtown Brooklyn', lat:40.6920, lng:-73.9870, r:300, noHouses:true },
  { id:'williamsburg', n:'Williamsburg', lat:40.7081, lng:-73.9571, r:300 },
  { id:'astoria', n:'Astoria', lat:40.7644, lng:-73.9235, r:320 },
  { id:'lic', n:'Long Island City', lat:40.7447, lng:-73.9485, r:300, noHouses:true },
  { id:'flushing', n:'Flushing', lat:40.7654, lng:-73.8318, r:340 },
  { id:'jamaica', n:'Jamaica', lat:40.7020, lng:-73.7900, r:320 },
  { id:'bronx', n:'The Bronx', lat:40.8610, lng:-73.8900, r:400 },
  { id:'statenisland', n:'Staten Island', lat:40.6437, lng:-74.0760, r:380 },
  { id:'jerseycity', n:'Jersey City', lat:40.7178, lng:-74.0431, r:360, noHouses:true },
  { id:'hoboken', n:'Hoboken', lat:40.7440, lng:-74.0324, r:240, noHouses:true },
  { id:'newark', n:'Newark', lat:40.7357, lng:-74.1724, r:420 },
  { id:'yonkers', n:'Yonkers', lat:40.9312, lng:-73.8987, r:380 },
  { id:'soho', n:'SoHo', lat:40.7233, lng:-74.0030, r:220, noHouses:true },
  { id:'eastvillage', n:'East Village', lat:40.7264, lng:-73.9818, r:240, noHouses:true },
  { id:'coneyisland', n:'Coney Island', lat:40.5755, lng:-73.9707, r:280 },
];

export const NEWYORK_AIRPORTS = [
  { id:'jfk', code:'JFK', name:'John F. Kennedy International', lat:40.6413, lng:-73.7781, rot:0.3, intl:true, runLen:700, city:'Queens', elev:'13 ft', note:'NYC primary international hub', addr:'Queens, NY 11430' },
  { id:'lga', code:'LGA', name:'LaGuardia', lat:40.7769, lng:-73.8740, rot:-0.2, intl:true, runLen:520, city:'Queens', elev:'21 ft', note:'Domestic / short-haul', addr:'Queens, NY 11371' },
  { id:'ewr', code:'EWR', name:'Newark Liberty International', lat:40.6895, lng:-74.1745, rot:0.1, intl:true, runLen:680, city:'Newark', elev:'18 ft', note:'United hub · NJ', addr:'3 Brewster Rd, Newark, NJ 07114' },
];

export const NEWYORK_POIS = [
  { id:'poi_empire', n:'Empire State Building', lat:40.7484, lng:-73.9857, r:240 },
  { id:'poi_owtc', n:'One World Trade Center', lat:40.7127, lng:-74.0134, r:260 },
  { id:'poi_chrysler', n:'Chrysler Building', lat:40.7516, lng:-73.9755, r:220 },
  { id:'poi_bb', n:'Brooklyn Bridge', lat:40.7061, lng:-73.9969, r:240 },
  { id:'poi_centralpark', n:'Central Park', lat:40.7829, lng:-73.9654, r:400 },
  { id:'poi_yankee', n:'Yankee Stadium', lat:40.8296, lng:-73.9262, r:280 },
  { id:'poi_citifield', n:'Citi Field', lat:40.7571, lng:-73.8458, r:280 },
  { id:'poi_msg', n:'Madison Square Garden', lat:40.7505, lng:-73.9934, r:240 },
  { id:'poi_liberty', n:'Statue of Liberty', lat:40.6892, lng:-74.0445, r:260 },
  { id:'poi_times', n:'Times Square', lat:40.7580, lng:-73.9855, r:240 },
  { id:'poi_met', n:'Metropolitan Museum of Art', lat:40.7794, lng:-73.9632, r:240 },
  { id:'poi_columbia', n:'Columbia University', lat:40.8075, lng:-73.9626, r:280 },
  { id:'poi_nyu', n:'NYU', lat:40.7295, lng:-73.9965, r:240 },
  { id:'poi_rock', n:'Rockefeller Center', lat:40.7587, lng:-73.9787, r:220 },
];

export const NEWYORK_HOTSPOTS = [
  { lat:40.755, lng:-73.984, r:400, k:0.58, name:'Midtown' },
  { lat:40.712, lng:-74.006, r:360, k:0.50, name:'Lower Manhattan' },
  { lat:40.745, lng:-73.95, r:340, k:0.45, name:'LIE / Queens' },
  { lat:40.851, lng:-73.952, r:320, k:0.42, name:'GWB' },
  { lat:40.64, lng:-73.78, r:300, k:0.38, name:'JFK approach' },
];

export const NEWYORK_CORRIDORS = [
  /* Suburb / borough → Midtown. Labels use "Road · Origin" so chips read "Origin → Downtown". */
  { road:'i495', label:'LIE · Queens', aLat:40.75, aLng:-73.78, bLat:40.755, bLng:-73.984, realMi:12, typMin:32, minMin:22, maxMin:70, toDt:true },
  { road:'bqe', label:'BQE · Brooklyn', aLat:40.69, aLng:-73.99, bLat:40.755, bLng:-73.984, realMi:8, typMin:28, minMin:18, maxMin:65, toDt:true },
  { road:'i95', label:'I-95 · Bronx', aLat:40.85, aLng:-73.86, bLat:40.755, bLng:-73.984, realMi:10, typMin:30, minMin:20, maxMin:70, toDt:true },
  { road:'gwb', label:'GWB · Fort Lee', aLat:40.85, aLng:-74.02, bLat:40.755, bLng:-73.984, realMi:9, typMin:28, minMin:18, maxMin:65, toDt:true },
  { road:'wsh', label:'West Side · Jersey City', aLat:40.72, aLng:-74.04, bLat:40.755, bLng:-73.984, realMi:7, typMin:24, minMin:16, maxMin:55, toDt:true },
  { road:'fdr', label:'FDR · Harlem', aLat:40.81, aLng:-73.93, bLat:40.755, bLng:-73.984, realMi:6, typMin:22, minMin:14, maxMin:50, toDt:true },
  { road:'i278', label:'I-278 · Staten Island', aLat:40.62, aLng:-74.10, bLat:40.755, bLng:-73.984, realMi:16, typMin:35, minMin:25, maxMin:75, toDt:true },
  { road:'i495', label:'LIE · JFK approach', aLat:40.755, aLng:-73.984, bLat:40.66, bLng:-73.80, realMi:14, typMin:30, minMin:22, maxMin:65, toDt:false },
  { road:'wsh', label:'West Side · GWB run', aLat:40.70, aLng:-74.02, bLat:40.851, bLng:-73.952, realMi:11, typMin:25, minMin:18, maxMin:55, toDt:false },
];

export const NEWYORK_JUMP_GROUPS = [
  { label:'Manhattan', options:[['fidi','Financial District'],['midtown','Midtown'],['ues','Upper East Side'],['uws','Upper West Side'],['harlem','Harlem'],['chelsea','Chelsea'],['soho','SoHo']] },
  { label:'Boroughs / NJ', options:[['dtbrooklyn','Downtown Brooklyn'],['williamsburg','Williamsburg'],['astoria','Astoria'],['lic','Long Island City'],['bronx','The Bronx'],['jerseycity','Jersey City'],['newark','Newark']] },
  { label:'Airports', options:[['jfk','JFK'],['lga','LGA — LaGuardia'],['ewr','EWR — Newark']] },
  { label:'Attractions', options:[['poi_empire','Empire State'],['poi_owtc','One WTC'],['poi_yankee','Yankee Stadium'],['poi_citifield','Citi Field'],['poi_msg','Madison Square Garden'],['poi_centralpark','Central Park'],['poi_liberty','Statue of Liberty']] },
];

export const NEWYORK_NWS = {
  counties: /\b(New York|Kings|Queens|Bronx|Richmond|Nassau|Suffolk|Westchester|Bergen|Hudson|Essex|Union)\b/i,
  places: /New York|Manhattan|Brooklyn|Queens|Bronx|Staten Island|Jersey City|Newark|Hoboken|Yonkers|Jamaica|Flushing|Astoria/i,
  foot: 'Official NWS alerts for New York-area counties',
  empty: 'No active NWS warnings for the New York metro.',
};

export const NEWYORK_WATERS = [
  { n:'Hudson River', lat:40.7500, lng:-74.0100, r:280, tag:'river' },
  { n:'East River', lat:40.7400, lng:-73.9700, r:260, tag:'river' },
  { n:'New York Harbor', lat:40.6650, lng:-74.0450, r:360, tag:'harbor' },
  { n:'Jamaica Bay', lat:40.6100, lng:-73.8300, r:440, tag:'bay' },
];

export const NEWYORK_CAM_EXTRAS = [{ id:'midtown', lat:40.7549, lng:-73.9840, radius:360 }];

/* World height ≈ real feet / 3.16 (matches Houston Williams Tower 901 ft → h 285). */
export const NEWYORK_SKYLINE = [
  /* ——— Lower Manhattan / FiDi ——— */
  { n:'One World Trade Center', lat:40.7127, lng:-74.0134, w:42, d:42, h:562, s:0, info:'1776 ft · Freedom Tower' },
  { n:'3 World Trade Center', lat:40.7108, lng:-74.0114, w:34, d:32, h:390, s:1, info:'1079 ft' },
  { n:'4 World Trade Center', lat:40.7104, lng:-74.0119, w:34, d:34, h:310, s:2, info:'978 ft' },
  { n:'7 World Trade Center', lat:40.7133, lng:-74.0119, w:36, d:34, h:235, s:3, info:'743 ft' },
  { n:'40 Wall Street', lat:40.7070, lng:-74.0098, w:26, d:26, h:293, s:2, info:'927 ft · Trump Building' },
  { n:'70 Pine Street', lat:40.7065, lng:-74.0077, w:26, d:24, h:301, s:1, info:'952 ft Art Deco' },
  { n:'Woolworth Building', lat:40.7122, lng:-74.0082, w:28, d:28, h:250, s:2, info:'792 ft Gothic' },
  { n:'200 West Street', lat:40.7146, lng:-74.0147, w:40, d:36, h:236, s:0, info:'Goldman Sachs HQ' },
  { n:'One Manhattan West', lat:40.7527, lng:-74.0058, w:32, d:30, h:315, s:1, info:'996 ft · Hudson Yards edge' },
  /* ——— Midtown ——— */
  { n:'Empire State Building', lat:40.7484, lng:-73.9857, w:38, d:38, h:460, s:1, info:'1454 ft · Art Deco' },
  { n:'Chrysler Building', lat:40.7516, lng:-73.9755, w:30, d:28, h:331, s:2, info:'1046 ft Art Deco crown' },
  { n:'One Vanderbilt', lat:40.7530, lng:-73.9785, w:32, d:32, h:443, s:1, info:'1401 ft · Grand Central' },
  { n:'Bank of America Tower', lat:40.7556, lng:-73.9840, w:32, d:30, h:380, s:2, info:'1200 ft · Bryant Park' },
  { n:'30 Rockefeller Plaza', lat:40.7587, lng:-73.9787, w:40, d:36, h:269, s:3, info:'850 ft · 30 Rock' },
  { n:'MetLife Building', lat:40.7536, lng:-73.9765, w:44, d:28, h:255, s:0, info:'808 ft · Park Avenue' },
  { n:'Citigroup Center', lat:40.7586, lng:-73.9700, w:34, d:34, h:289, s:1, info:'915 ft · slanted top' },
  { n:'Bloomberg Tower', lat:40.7616, lng:-73.9680, w:36, d:30, h:279, s:2, info:'883 · 59th & Lex' },
  { n:'New York Life Building', lat:40.7427, lng:-73.9868, w:32, d:30, h:195, s:2, info:'615 ft gold pyramid' },
  { n:'Flatiron Building', lat:40.7411, lng:-73.9897, w:22, d:40, h:90, s:3, info:'285 ft · wedge' },
  { n:'Madison Square Garden', lat:40.7505, lng:-73.9934, w:72, d:72, h:45, s:0, info:'Arena drum · Penn Station' },
  /* ——— Billionaires’ Row / UES ——— */
  { n:'Central Park Tower', lat:40.7663, lng:-73.9808, w:20, d:20, h:490, s:0, info:'1550 ft pencil' },
  { n:'432 Park Avenue', lat:40.7616, lng:-73.9716, w:18, d:18, h:442, s:0, info:'1396 ft pencil' },
  { n:'111 West 57th Street', lat:40.7648, lng:-73.9778, w:14, d:18, h:450, s:1, info:'1428 ft · Steinway Tower' },
  { n:'220 Central Park South', lat:40.7670, lng:-73.9800, w:26, d:24, h:300, s:3, info:'950 ft' },
  /* ——— Hudson Yards ——— */
  { n:'30 Hudson Yards', lat:40.7540, lng:-74.0010, w:34, d:32, h:402, s:3, info:'1270 ft observation deck' },
  { n:'35 Hudson Yards', lat:40.7546, lng:-74.0024, w:30, d:28, h:318, s:1, info:'1005 ft' },
  { n:'50 Hudson Yards', lat:40.7547, lng:-74.0000, w:40, d:36, h:268, s:0, info:'849 ft' },
  /* ——— Brooklyn / LIC / NJ silhouettes ——— */
  { n:'Brookfield Place Brooklyn', lat:40.6930, lng:-73.9855, w:34, d:32, h:225, s:1, info:'Downtown Brooklyn' },
  { n:'Skyline Tower', lat:40.7475, lng:-73.9412, w:28, d:28, h:241, s:0, info:'762 ft · LIC' },
  { n:'99 Hudson', lat:40.7189, lng:-74.0355, w:28, d:26, h:279, s:2, info:'900 ft · Jersey City' },
  { n:'Goldman Sachs Tower', lat:40.7137, lng:-74.0345, w:36, d:34, h:250, s:1, info:'781 ft · Jersey City' },
];

/** Mid-rise CBD fabric pockets (lat/lng) — planted around landmarks, not house sprawl. */
export const NEWYORK_SKYLINE_POCKETS = [
  { n:'Financial District', lat:40.7075, lng:-74.0110, count:48, rad:260, hmin:55, hmax:220 },
  { n:'Battery / WTC ring', lat:40.7125, lng:-74.0120, count:22, rad:160, hmin:70, hmax:260 },
  { n:'Tribeca loft towers', lat:40.7165, lng:-74.0085, count:16, rad:140, hmin:40, hmax:140 },
  { n:'Midtown core', lat:40.7549, lng:-73.9840, count:70, rad:320, hmin:80, hmax:280 },
  { n:'Times Square / Broadway', lat:40.7580, lng:-73.9855, count:28, rad:170, hmin:70, hmax:220 },
  { n:'Grand Central / Park Ave', lat:40.7527, lng:-73.9772, count:26, rad:180, hmin:90, hmax:260 },
  { n:'Hudson Yards', lat:40.7545, lng:-74.0005, count:24, rad:180, hmin:80, hmax:260 },
  { n:'Chelsea / Nomad', lat:40.7455, lng:-73.9935, count:22, rad:180, hmin:45, hmax:160 },
  { n:'Upper East / Billionaires’', lat:40.7645, lng:-73.9735, count:18, rad:150, hmin:90, hmax:240 },
  { n:'Downtown Brooklyn', lat:40.6925, lng:-73.9865, count:28, rad:220, hmin:50, hmax:180 },
  { n:'Long Island City', lat:40.7460, lng:-73.9430, count:30, rad:220, hmin:55, hmax:200 },
  { n:'Jersey City waterfront', lat:40.7155, lng:-74.0355, count:26, rad:200, hmin:55, hmax:210 },
];

export const NEWYORK_ATTRACTIONS = [
  { kind:'statue', n:'Statue of Liberty', lat:40.6892, lng:-74.0445 },
  { kind:'bridge', n:'Brooklyn Bridge', lat:40.7061, lng:-73.9969 },
  { kind:'park', n:'Central Park', lat:40.7829, lng:-73.9654 },
  { kind:'stadium', n:'Yankee Stadium', lat:40.8296, lng:-73.9262 },
  { kind:'stadium', n:'Citi Field', lat:40.7571, lng:-73.8458 },
  { kind:'arena', n:'Madison Square Garden', lat:40.7505, lng:-73.9934 },
  { kind:'school', n:'Columbia University', lat:40.8075, lng:-73.9626 },
  { kind:'school', n:'NYU', lat:40.7295, lng:-73.9965 },
  { kind:'museum', n:'Metropolitan Museum of Art', lat:40.7794, lng:-73.9632 },
  { kind:'landmark', n:'Rockefeller Center', lat:40.7587, lng:-73.9787 },
  { kind:'landmark', n:'Times Square', lat:40.7580, lng:-73.9855 },
];

export const NEWYORK_RIVER_LATLNG = [
  [40.78,-74.01],[40.76,-74.01],[40.74,-74.01],[40.72,-74.012],[40.70,-74.015],[40.68,-74.02],
];

export const NEWYORK_META = {
  id:'newyork', name:'New York', metroName:'Greater New York', areaName:'NYC-area',
  slogan:'The City That Never Sleeps', loadingSub:'Paving Tri-State freeways…',
  wxPlace:'New York · Midtown', freewayJumpLabel:'Freeway level — FDR @ Midtown',
  originLat:40.71278, originLng:-74.00601, groundColor:0xa8b090,
  shields:[{label:'FDR',small:true},{label:'95'},{label:'278'},{label:'495'},{label:'BQE',small:true}],
};
