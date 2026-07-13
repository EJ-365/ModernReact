/**
 * Build a runtime city pack (world coords) from researched lat/lng content.
 */
import {
  AUSTIN_ROAD_LATLNG,
  AUSTIN_DISTRICTS,
  AUSTIN_AIRPORTS,
  AUSTIN_POIS,
  AUSTIN_HOTSPOTS,
  AUSTIN_CORRIDORS,
  AUSTIN_JUMP_GROUPS,
  AUSTIN_NWS,
  AUSTIN_WATERS,
  AUSTIN_CAM_EXTRAS,
  AUSTIN_LADYBIRD_LATLNG,
} from './pack.js';

/**
 * @param {{ geoToWorld: (lat:number,lng:number)=>{x:number,z:number} }} geo
 */
export function buildAustinRuntimePack(geo) {
  const toXZ = (lat, lng) => {
    const w = geo.geoToWorld(lat, lng);
    return { x: w.x, z: w.z };
  };

  const roads = AUSTIN_ROAD_LATLNG.map((r) => {
    const { latlng, ...rest } = r;
    return {
      ...rest,
      pts: latlng.map(([lat, lng]) => {
        const p = toXZ(lat, lng);
        return [p.x, p.z];
      }),
    };
  });

  const districts = AUSTIN_DISTRICTS.map((d) => {
    const p = toXZ(d.lat, d.lng);
    return { id: d.id, n: d.n, x: p.x, z: p.z, r: d.r, lat: d.lat, lng: d.lng };
  });

  const airports = AUSTIN_AIRPORTS.map((a) => {
    const p = toXZ(a.lat, a.lng);
    return { ...a, x: p.x, z: p.z };
  });

  const pois = AUSTIN_POIS.map((p0) => {
    const p = toXZ(p0.lat, p0.lng);
    return { ...p0, x: p.x, z: p.z };
  });

  const hotspots = AUSTIN_HOTSPOTS.map((h) => {
    const p = toXZ(h.lat, h.lng);
    return { x: p.x, z: p.z, r: h.r, k: h.k, name: h.name };
  });

  const corridors = AUSTIN_CORRIDORS.map((c) => {
    const a = toXZ(c.aLat, c.aLng);
    const b = toXZ(c.bLat, c.bLng);
    return {
      road: c.road,
      label: c.label,
      ax: a.x,
      az: a.z,
      bx: b.x,
      bz: b.z,
      realMi: c.realMi,
      typMin: c.typMin,
      minMin: c.minMin,
      maxMin: c.maxMin,
      toDt: c.toDt,
    };
  });

  const waters = AUSTIN_WATERS.map((w) => {
    const p = toXZ(w.lat, w.lng);
    return { n: w.n, x: p.x, z: p.z, r: w.r, tag: w.tag };
  });

  const camExtras = AUSTIN_CAM_EXTRAS.map((c) => {
    const p = toXZ(c.lat, c.lng);
    return { id: c.id, target: [p.x, p.z], radius: c.radius };
  });

  const ladyBird = AUSTIN_LADYBIRD_LATLNG.map(([lat, lng]) => {
    const p = toXZ(lat, lng);
    return [p.x, p.z];
  });

  return {
    id: 'austin',
    useBuiltinRoads: false,
    skipOsmLod: true,
    skipOsmCorridors: true,
    slogan: 'Live Music Capital · Texas',
    loadingSub: 'Paving Central Texas freeways…',
    wxPlace: 'Austin · Downtown',
    liveTimeLabel: 'Live — real Austin time',
    timeHint: 'Traffic & sky follow live Austin time. Pick a speed for a day/night time-lapse.',
    boardSublabel: 'Austin airports · live FlightAware departures & arrivals',
    flightsEmpty: 'Listening for live Austin ADS-B…',
    freewayJumpLabel: 'Freeway level — I-35 @ Downtown',
    liveFlightsOnly: 'Austin arrivals & departures only',
    boardLabel: 'Austin board',
    verifiedLabel: 'Austin-verified',
    wxLiveLabel: 'Austin live · Open-Meteo',
    roads,
    districts,
    airports,
    pois,
    hotspots,
    corridors,
    jumpGroups: AUSTIN_JUMP_GROUPS,
    nws: AUSTIN_NWS,
    waters,
    camExtras,
    ladyBird,
    boardApts: airports.map((a) => a.code),
    shields: [
      { label: '35' },
      { label: '1', small: true },
      { label: '183', us: true, small: true },
      { label: '71', small: true },
      { label: '360', circle: true, small: true },
      { label: '130', small: true },
    ],
    aptCoords: Object.fromEntries(
      airports.map((a) => [a.code, { lat: a.lat, lng: a.lng, x: a.x, z: a.z }]),
    ),
  };
}
