/**
 * Merge extruded airport buildings while keeping each footprint's material groups.
 * ExtrudeGeometry puts lids on material 0 and walls on material 1. Passing those meshes
 * through mergeGeometries(..., true) replaces the groups with one group per building whose
 * material index is the building number. A 2-material mesh then draws only the first two
 * buildings and skips the rest of the airport.
 */
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function mergeAirportBuildings(geoms) {
  if (!geoms.length) return null;
  const indexed = geoms[0].index !== null;
  let offset = 0;
  const groups = [];
  for (const g of geoms) {
    const n = indexed ? g.index.count : g.attributes.position.count;
    const src = g.groups && g.groups.length ? g.groups : [{ start: 0, count: n, materialIndex: 0 }];
    for (const grp of src) groups.push({ start: grp.start + offset, count: grp.count, materialIndex: grp.materialIndex });
    offset += n;
  }
  const merged = mergeGeometries(geoms, false);
  if (!merged) return null;
  for (const grp of groups) merged.addGroup(grp.start, grp.count, grp.materialIndex);
  return merged;
}
