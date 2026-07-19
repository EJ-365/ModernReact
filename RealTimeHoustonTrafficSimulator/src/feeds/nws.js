export function nwsAreaCodes(pack, fallback = 'TX') {
  const configured = pack && pack.nws && pack.nws.areas;
  const values = Array.isArray(configured) ? configured : (configured ? [configured] : []);
  const areas = [...new Set(
    values.map((value) => String(value).trim().toUpperCase()).filter((value) => /^[A-Z]{2}$/.test(value)),
  )];
  return areas.length ? areas : [fallback];
}

export function mergeNwsFeatures(payloads) {
  const features = [];
  const seen = new Set();
  for (const payload of payloads) {
    for (const feature of (payload && Array.isArray(payload.features)) ? payload.features : []) {
      const id = feature && (feature.id || (feature.properties && feature.properties.id));
      if (id && seen.has(id)) continue;
      if (id) seen.add(id);
      features.push(feature);
    }
  }
  return features;
}
