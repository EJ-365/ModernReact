/** Los Angeles metro pack — researched freeways, districts, airports, landmarks. */
export const LOSANGELES_ROAD_LATLNG = [
  { id:'i10', name:'I-10 Santa Monica Freeway', short:'I-10', closed:false, width:48, lanes:5, ff:65, share:1.5, baseY:0.82, prio:7,
    latlng:[[34.0175,-118.491],[34.031,-118.445],[34.037,-118.355],[34.0395,-118.271],[34.036,-118.24],[34.045,-118.15],[34.06,-118.08],[34.065,-117.90]] },
  { id:'i5', name:'I-5 Golden State / Santa Ana', short:'I-5', closed:false, width:48, lanes:5, ff:65, share:1.5, baseY:0.82, prio:7,
    latlng:[[34.31,-118.48],[34.18,-118.31],[34.10,-118.25],[34.055,-118.22],[34.04,-118.215],[33.94,-118.12],[33.82,-117.98],[33.68,-117.78]] },
  { id:'i110', name:'I-110 Harbor Freeway', short:'I-110', closed:false, width:42, lanes:4, ff:60, share:1.25, baseY:0.82, prio:6,
    latlng:[[34.148,-118.15],[34.10,-118.20],[34.06,-118.245],[34.05,-118.258],[34.04,-118.273],[33.98,-118.282],[33.88,-118.285],[33.74,-118.28]] },
  { id:'i405', name:'I-405 San Diego Freeway', short:'I-405', closed:false, width:48, lanes:5, ff:65, share:1.55, baseY:0.82, prio:7,
    latlng:[[34.25,-118.47],[34.155,-118.465],[34.09,-118.45],[34.05,-118.44],[34.01,-118.42],[33.945,-118.37],[33.87,-118.35],[33.76,-118.20]] },
  { id:'us101', name:'US-101 Hollywood / Ventura', short:'US-101', closed:false, width:42, lanes:4, ff:60, share:1.3, baseY:0.82, prio:6.5,
    latlng:[[34.17,-118.60],[34.155,-118.45],[34.125,-118.345],[34.085,-118.29],[34.07,-118.26],[34.056,-118.243],[34.04,-118.20]] },
  { id:'i210', name:'I-210 Foothill Freeway', short:'I-210', closed:false, width:40, lanes:4, ff:65, share:1.1, baseY:0.82, prio:5.5,
    latlng:[[34.31,-118.47],[34.25,-118.32],[34.165,-118.20],[34.145,-118.08],[34.14,-117.97],[34.12,-117.82],[34.11,-117.72]] },
  { id:'i105', name:'I-105 Century Freeway', short:'I-105', closed:false, width:40, lanes:4, ff:65, share:1.05, baseY:0.82, prio:5.5,
    latlng:[[33.931,-118.396],[33.929,-118.36],[33.93,-118.30],[33.93,-118.21],[33.93,-118.12],[33.93,-118.08]] },
  { id:'sr91', name:'SR-91 Artesia / Riverside', short:'SR-91', closed:false, width:40, lanes:4, ff:65, share:1.1, baseY:0.82, prio:5,
    latlng:[[33.85,-118.34],[33.88,-118.22],[33.875,-118.08],[33.86,-117.96],[33.855,-117.82],[33.89,-117.55]] },
];

export const LOSANGELES_DISTRICTS = [
  { id:'dtla', n:'Downtown LA', lat:34.0522, lng:-118.2437, r:420 },
  { id:'hollywood', n:'Hollywood', lat:34.0928, lng:-118.3287, r:360 },
  { id:'santamonica', n:'Santa Monica', lat:34.0195, lng:-118.4912, r:380 },
  { id:'beverlyhills', n:'Beverly Hills', lat:34.0736, lng:-118.4004, r:320 },
  { id:'westhollywood', n:'West Hollywood', lat:34.0900, lng:-118.3617, r:260 },
  { id:'pasadena', n:'Pasadena', lat:34.1478, lng:-118.1445, r:420 },
  { id:'glendale', n:'Glendale', lat:34.1425, lng:-118.2551, r:400 },
  { id:'burbank', n:'Burbank', lat:34.1808, lng:-118.3090, r:380 },
  { id:'longbeach', n:'Long Beach', lat:33.7701, lng:-118.1937, r:480 },
  { id:'anaheim', n:'Anaheim', lat:33.8366, lng:-117.9143, r:440 },
  { id:'irvine', n:'Irvine', lat:33.6846, lng:-117.8265, r:460 },
  { id:'torrance', n:'Torrance', lat:33.8358, lng:-118.3406, r:360 },
  { id:'inglewood', n:'Inglewood', lat:33.9617, lng:-118.3531, r:300 },
  { id:'culvercity', n:'Culver City', lat:34.0211, lng:-118.3965, r:280 },
  { id:'koreatown', n:'Koreatown', lat:34.0610, lng:-118.3009, r:280 },
  { id:'silverlake', n:'Silver Lake', lat:34.0869, lng:-118.2702, r:260 },
  { id:'venice', n:'Venice', lat:33.9850, lng:-118.4695, r:300 },
  { id:'malibu', n:'Malibu', lat:34.0259, lng:-118.7798, r:420 },
  { id:'shermanoaks', n:'Sherman Oaks', lat:34.1510, lng:-118.4492, r:320 },
  { id:'westwood', n:'Westwood', lat:34.0635, lng:-118.4455, r:260 },
  { id:'santaana', n:'Santa Ana', lat:33.7455, lng:-117.8677, r:400 },
  { id:'newportbeach', n:'Newport Beach', lat:33.6189, lng:-117.9298, r:360 },
  { id:'pomona', n:'Pomona', lat:34.0551, lng:-117.7500, r:380 },
  { id:'compton', n:'Compton', lat:33.8958, lng:-118.2201, r:320 },
];

export const LOSANGELES_AIRPORTS = [
  { id:'lax', code:'LAX', name:'Los Angeles International', lat:33.9425, lng:-118.4081, rot:0.05, intl:true, runLen:680, city:'Los Angeles', elev:'128 ft', note:'West Coast mega-hub', addr:'1 World Way, Los Angeles, CA 90045' },
  { id:'bur', code:'BUR', name:'Hollywood Burbank', lat:34.2006, lng:-118.3585, rot:0.1, intl:true, runLen:480, city:'Burbank', elev:'778 ft', note:'Valley commercial field', addr:'2627 N Hollywood Way, Burbank, CA 91505' },
  { id:'lgb', code:'LGB', name:'Long Beach', lat:33.8177, lng:-118.1516, rot:-0.15, intl:true, runLen:460, city:'Long Beach', elev:'60 ft', note:'JetBlue / GA', addr:'4100 Donald Douglas Dr, Long Beach, CA 90808' },
  { id:'sna', code:'SNA', name:'John Wayne / Orange County', lat:33.6757, lng:-117.8682, rot:0.2, intl:true, runLen:500, city:'Santa Ana', elev:'56 ft', note:'Orange County commercial', addr:'18601 Airport Way, Santa Ana, CA 92707' },
];

export const LOSANGELES_POIS = [
  { id:'poi_usbank', n:'US Bank Tower', lat:34.0509, lng:-118.2545, r:220 },
  { id:'poi_wilshiregrand', n:'Wilshire Grand Center', lat:34.0500, lng:-118.2595, r:220 },
  { id:'poi_crypto', n:'Crypto.com Arena', lat:34.0430, lng:-118.2673, r:260 },
  { id:'poi_dodger', n:'Dodger Stadium', lat:34.0736, lng:-118.2398, r:280 },
  { id:'poi_hollywoodsign', n:'Hollywood Sign', lat:34.1341, lng:-118.3215, r:240 },
  { id:'poi_smpier', n:'Santa Monica Pier', lat:34.0100, lng:-118.4965, r:240 },
  { id:'poi_getty', n:'Getty Center', lat:34.0780, lng:-118.4741, r:280 },
  { id:'poi_ucla', n:'UCLA', lat:34.0689, lng:-118.4452, r:300 },
  { id:'poi_griffith', n:'Griffith Observatory', lat:34.1184, lng:-118.3004, r:240 },
  { id:'poi_lacma', n:'LACMA', lat:34.0639, lng:-118.3592, r:240 },
  { id:'poi_sofi', n:'SoFi Stadium', lat:33.9535, lng:-118.3392, r:300 },
  { id:'poi_disney', n:'Disneyland', lat:33.8121, lng:-117.9190, r:320 },
  { id:'poi_rosebowl', n:'Rose Bowl', lat:34.1613, lng:-118.1676, r:260 },
  { id:'poi_disneyhall', n:'Walt Disney Concert Hall', lat:34.0553, lng:-118.2498, r:220 },
];

export const LOSANGELES_HOTSPOTS = [
  { lat:34.0522, lng:-118.2437, r:420, k:0.55, name:'DTLA' },
  { lat:34.09, lng:-118.33, r:360, k:0.48, name:'Hollywood / 101' },
  { lat:34.05, lng:-118.44, r:380, k:0.50, name:'I-405 · Westside' },
  { lat:33.94, lng:-118.40, r:340, k:0.42, name:'LAX approach' },
  { lat:34.02, lng:-118.49, r:320, k:0.40, name:'Santa Monica / I-10' },
];

export const LOSANGELES_CORRIDORS = [
  { road:'i10', label:'I-10 · Santa Monica → DTLA', aLat:34.02, aLng:-118.49, bLat:34.0522, bLng:-118.2437, realMi:15, typMin:28, minMin:18, maxMin:70, toDt:true },
  { road:'i405', label:'I-405 · LAX → Westwood', aLat:33.94, aLng:-118.40, bLat:34.06, bLng:-118.45, realMi:10, typMin:22, minMin:14, maxMin:55, toDt:false },
  { road:'i5', label:'I-5 · Santa Ana → DTLA', aLat:33.75, aLng:-117.87, bLat:34.0522, bLng:-118.2437, realMi:32, typMin:45, minMin:32, maxMin:90, toDt:true },
  { road:'us101', label:'US-101 · Hollywood → DTLA', aLat:34.09, aLng:-118.33, bLat:34.0522, bLng:-118.2437, realMi:8, typMin:18, minMin:12, maxMin:45, toDt:true },
  { road:'i110', label:'I-110 · San Pedro → DTLA', aLat:33.74, aLng:-118.28, bLat:34.0522, bLng:-118.2437, realMi:22, typMin:35, minMin:25, maxMin:70, toDt:true },
];

export const LOSANGELES_JUMP_GROUPS = [
  { label:'LA core', options:[['dtla','Downtown LA'],['hollywood','Hollywood'],['koreatown','Koreatown'],['westwood','Westwood'],['beverlyhills','Beverly Hills'],['westhollywood','West Hollywood']] },
  { label:'Westside / Coast', options:[['santamonica','Santa Monica'],['venice','Venice'],['malibu','Malibu'],['culvercity','Culver City'],['inglewood','Inglewood']] },
  { label:'Valley / East', options:[['pasadena','Pasadena'],['glendale','Glendale'],['burbank','Burbank'],['shermanoaks','Sherman Oaks'],['pomona','Pomona']] },
  { label:'OC / South Bay', options:[['longbeach','Long Beach'],['anaheim','Anaheim'],['irvine','Irvine'],['santaana','Santa Ana'],['newportbeach','Newport Beach'],['torrance','Torrance']] },
  { label:'Airports', options:[['lax','LAX'],['bur','BUR — Burbank'],['lgb','LGB — Long Beach'],['sna','SNA — John Wayne']] },
  { label:'Attractions', options:[['poi_dodger','Dodger Stadium'],['poi_sofi','SoFi Stadium'],['poi_crypto','Crypto.com Arena'],['poi_disney','Disneyland'],['poi_hollywoodsign','Hollywood Sign'],['poi_getty','Getty Center'],['poi_ucla','UCLA']] },
];

export const LOSANGELES_NWS = {
  areas: ['CA'],
  counties: /\b(Los Angeles|Orange|Ventura|San Bernardino|Riverside)\b/i,
  places: /Los Angeles|Long Beach|Anaheim|Santa Ana|Irvine|Pasadena|Glendale|Burbank|Santa Monica|Torrance|Inglewood|Pomona|Fullerton|Huntington Beach|Ontario|Riverside|Ventura|Oxnard/i,
  foot: 'Official NWS alerts for Los Angeles-area counties',
  empty: 'No active NWS warnings for the Los Angeles metro.',
};

export const LOSANGELES_WATERS = [
  { n:'Los Angeles River', lat:34.0600, lng:-118.2250, r:180, tag:'river' },
  { n:'Santa Monica Bay', lat:34.0000, lng:-118.5200, r:520, tag:'bay' },
  { n:'San Pedro Bay', lat:33.7400, lng:-118.2200, r:480, tag:'harbor' },
  { n:'Echo Park Lake', lat:34.0730, lng:-118.2606, r:120, tag:'lake' },
];

export const LOSANGELES_CAM_EXTRAS = [{ id:'hollywood', lat:34.0928, lng:-118.3287, radius:340 }];

export const LOSANGELES_SKYLINE = [
  { n:'Wilshire Grand Center', lat:34.0500, lng:-118.2595, w:34, d:32, h:300, s:1, info:'1100 ft · tallest in CA' },
  { n:'US Bank Tower', lat:34.0509, lng:-118.2545, w:32, d:32, h:280, s:0, info:'1018 ft' },
  { n:'Aon Center', lat:34.0493, lng:-118.2555, w:30, d:30, h:240, s:2, info:'858 ft' },
  { n:'Two California Plaza', lat:34.0515, lng:-118.2515, w:28, d:28, h:210, s:1, info:'750 ft' },
  { n:'Gas Company Tower', lat:34.0505, lng:-118.2530, w:28, d:26, h:205, s:3, info:'749 ft' },
  { n:'Bank of America Plaza', lat:34.0528, lng:-118.2548, w:28, d:28, h:200, s:0, info:'735 ft' },
  { n:'777 Tower', lat:34.0485, lng:-118.2615, w:30, d:26, h:195, s:2, info:'725 ft' },
  { n:'City National Tower', lat:34.0482, lng:-118.2560, w:26, d:26, h:185, s:1, info:'699 ft' },
];

export const LOSANGELES_ATTRACTIONS = [
  { kind:'stadium', n:'Dodger Stadium', lat:34.0736, lng:-118.2398 },
  { kind:'stadium', n:'SoFi Stadium', lat:33.9535, lng:-118.3392 },
  { kind:'arena', n:'Crypto.com Arena', lat:34.0430, lng:-118.2673 },
  { kind:'school', n:'UCLA', lat:34.0689, lng:-118.4452 },
  { kind:'museum', n:'Getty Center', lat:34.0780, lng:-118.4741 },
  { kind:'stadium', n:'Rose Bowl', lat:34.1613, lng:-118.1676 },
  { kind:'sign', n:'Hollywood Sign', lat:34.1341, lng:-118.3215, letters:'HOLLYWOOD' },
  { kind:'themepark', n:'Disneyland', lat:33.8121, lng:-117.9190 },
];

export const LOSANGELES_RIVER_LATLNG = [
  [34.12,-118.24],[34.08,-118.23],[34.05,-118.225],[34.02,-118.22],[33.98,-118.22],[33.94,-118.23],
];

export const LOSANGELES_META = {
  id:'losangeles', name:'Los Angeles', metroName:'Greater Los Angeles', areaName:'LA-area',
  slogan:'City of Angels · California', loadingSub:'Paving Southern California freeways…',
  wxPlace:'Los Angeles · Downtown', freewayJumpLabel:'Freeway level — I-110 @ DTLA',
  originLat:34.05223, originLng:-118.24368, groundColor:0xc4b890,
  shields:[{label:'10'},{label:'5'},{label:'110'},{label:'405'},{label:'101',us:true},{label:'105'}],
};
