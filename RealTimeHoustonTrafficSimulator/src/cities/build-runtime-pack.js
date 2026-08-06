/**
 * Shared lat/lng → world runtime pack builder for non-Houston metros.
 * @param {{ geoToWorld: (lat:number,lng:number)=>{x:number,z:number} }} geo
 * @param {object} src — city pack source (roads, districts, airports, …)
 */
export function buildLatLngRuntimePack(geo, src) {
  const toXZ = (lat, lng) => {
    const w = geo.geoToWorld(lat, lng);
    return { x: w.x, z: w.z };
  };

  const roads = (src.roads || []).map((r) => {
    const { latlng, ...rest } = r;
    return {
      ...rest,
      pts: (latlng || []).map(([lat, lng]) => {
        const p = toXZ(lat, lng);
        return [p.x, p.z];
      }),
    };
  });

  const districts = (src.districts || []).map((d) => {
    const p = toXZ(d.lat, d.lng);
    return { id: d.id, n: d.n, x: p.x, z: p.z, r: d.r, lat: d.lat, lng: d.lng, noHouses: !!d.noHouses };
  });

  const airports = (src.airports || []).map((a) => {
    const p = toXZ(a.lat, a.lng);
    return { ...a, x: p.x, z: p.z };
  });

  const pois = (src.pois || []).map((p0) => {
    const p = toXZ(p0.lat, p0.lng);
    return { ...p0, x: p.x, z: p.z };
  });

  const hotspots = (src.hotspots || []).map((h) => {
    const p = toXZ(h.lat, h.lng);
    return { x: p.x, z: p.z, r: h.r, k: h.k, name: h.name };
  });

  const corridors = (src.corridors || []).map((c) => {
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

  const waters = (src.waters || []).map((w) => {
    const p = toXZ(w.lat, w.lng);
    return { n: w.n, x: p.x, z: p.z, r: w.r, tag: w.tag };
  });

  const camExtras = (src.camExtras || []).map((c) => {
    const p = toXZ(c.lat, c.lng);
    return { id: c.id, target: [p.x, p.z], radius: c.radius };
  });

  const skyline = (src.skyline || []).map((L) => {
    const p = toXZ(L.lat, L.lng);
    return { ...L, x: p.x, z: p.z };
  });

  const skylinePockets = (src.skylinePockets || []).map((P) => {
    const p = toXZ(P.lat, P.lng);
    return { ...P, x: p.x, z: p.z };
  });

  const attractions = (src.attractions || []).map((A) => {
    const p = toXZ(A.lat, A.lng);
    return { ...A, x: p.x, z: p.z };
  });

  const river = (src.riverLatLng || []).map(([lat, lng]) => {
    const p = toXZ(lat, lng);
    return [p.x, p.z];
  });

  const name = src.name || src.id || 'City';

  return {
    id: src.id,
    useBuiltinRoads: false,
    skipOsmLod: true,
    skipOsmCorridors: true,
    metroName: src.metroName || ('Greater ' + name),
    areaName: src.areaName || (name + '-area'),
    slogan: src.slogan || (name + ' · Live'),
    loadingSub: src.loadingSub || ('Paving ' + name + ' freeways…'),
    wxPlace: src.wxPlace || (name + ' · Downtown'),
    liveTimeLabel: src.liveTimeLabel || ('Live — real ' + name + ' time'),
    timeHint:
      src.timeHint ||
      ('Traffic & sky follow live ' + name + ' time. Pick a speed for a day/night time-lapse.'),
    boardSublabel:
      boardSublabel || (name + ' airports · boards paused · free ADS-B sky'),
    flightsEmpty: src.flightsEmpty || ('Listening for live ' + name + ' ADS-B…'),
    freewayJumpLabel: src.freewayJumpLabel || ('Freeway level — Downtown'),
    liveFlightsOnly: src.liveFlightsOnly || (name + ' arrivals & departures only'),
    boardLabel: src.boardLabel || (name + ' board'),
    verifiedLabel: src.verifiedLabel || (name + '-verified'),
    wxLiveLabel: src.wxLiveLabel || (name + ' live · Open-Meteo'),
    originLat: src.originLat,
    originLng: src.originLng,
    groundColor: src.groundColor,
    roads,
    districts,
    airports,
    pois,
    hotspots,
    corridors,
    jumpGroups: src.jumpGroups || [],
    nws: src.nws || null,
    waters,
    camExtras,
    skyline,
    skylinePockets,
    attractions,
    river,
    ladyBird: river,
    boardApts: airports.map((a) => a.code),
    shields: src.shields || [],
    aptCoords: Object.fromEntries(
      airports.map((a) => [a.code, { lat: a.lat, lng: a.lng, x: a.x, z: a.z }]),
    ),
  };
}
