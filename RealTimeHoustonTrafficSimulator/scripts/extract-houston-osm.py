#!/usr/bin/env python3
"""Extract Houston roads + land cover from an OSM PBF into metre-scale packs.

Usage:
  osmium extract -b -95.98,29.28,-94.75,30.22 texas-latest.osm.pbf -o houston.osm.pbf
  python3 scripts/extract-houston-osm.py houston.osm.pbf

Writes public/data/houston/{roads-major,roads-minor,roads-local,landcover}.json
World x/z are metres from Downtown (same formula as src/core/geo.js, unitsPerMile=1609.344).
"""
import json, math, os, sys
import osmium

LAT0, LNG0, UPM = 29.7604, -95.3698, 1609.344
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'houston')


def w(lng, lat):
    return ((lng - LNG0) * 59.9 * UPM + 60, -(lat - LAT0) * 69 * UPM + 60)


def dp(pts, eps):
    """Douglas-Peucker on [(x,z)]."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, az = pts[a]
        bx, bz = pts[b]
        dx, dz = bx - ax, bz - az
        L = math.hypot(dx, dz)
        best, bi = -1, -1
        for i in range(a + 1, b):
            px, pz = pts[i]
            d = (abs(dx * (az - pz) - dz * (ax - px)) / L) if L > 1e-6 else math.hypot(px - ax, pz - az)
            if d > best:
                best, bi = d, i
        if best > eps:
            keep[bi] = True
            stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def flat(pts):
    out = []
    for x, z in pts:
        out += [round(x, 1), round(z, 1)]
    return out


MAJOR = {'motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link'}
MINOR = {'secondary', 'tertiary', 'secondary_link', 'tertiary_link'}
LOCAL = {'residential', 'unclassified', 'living_street'}
DEFAULT_LANES = {'motorway': 4, 'trunk': 3, 'primary': 2, 'secondary': 2, 'tertiary': 1,
                 'motorway_link': 1, 'trunk_link': 1, 'primary_link': 1, 'secondary_link': 1,
                 'tertiary_link': 1, 'residential': 1, 'unclassified': 1, 'living_street': 1}
LANE_W = {'motorway': 3.66, 'trunk': 3.6, 'motorway_link': 3.66, 'trunk_link': 3.6}


def num(v, d=None):
    try:
        return float(str(v).split(';')[0].replace('m', '').strip())
    except Exception:
        return d


def land_class(t):
    lu, na, le, am = t.get('landuse'), t.get('natural'), t.get('leisure'), t.get('amenity')
    if na in ('water',) or lu in ('reservoir', 'basin') or t.get('waterway') == 'riverbank':
        return 'water'
    if na in ('wetland',):
        return 'wetland'
    if na in ('wood',) or lu == 'forest':
        return 'wood'
    if na in ('scrub', 'heath'):
        return 'scrub'
    if le in ('golf_course',):
        return 'golf'
    if le in ('park', 'garden', 'recreation_ground', 'nature_reserve') or lu in ('recreation_ground', 'village_green'):
        return 'park'
    if le in ('pitch', 'stadium', 'track'):
        return 'pitch'
    if lu in ('grass', 'meadow') or na == 'grassland':
        return 'grass'
    if lu in ('farmland', 'farmyard', 'orchard'):
        return 'farm'
    if am == 'parking' and t.get('parking', 'surface') in ('surface', ''):
        return 'parking'
    if lu in ('industrial', 'railway', 'port', 'quarry', 'landfill', 'construction', 'brownfield'):
        return 'industrial'
    if lu in ('commercial', 'retail'):
        return 'commercial'
    if lu == 'residential':
        return 'residential'
    if lu == 'cemetery':
        return 'cemetery'
    return None


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.roads = {'major': [], 'minor': [], 'local': []}
        self.land = {}
        self.water_lines = []
        self.rail = []
        self.landmarks = []

    def way(self, wy):
        t = wy.tags
        hw = t.get('highway')
        try:
            pts = [w(n.lon, n.lat) for n in wy.nodes]
        except osmium.InvalidLocationError:
            return
        if len(pts) < 2:
            return
        if hw in MAJOR or hw in MINOR or hw in LOCAL:
            grp = 'major' if hw in MAJOR else ('minor' if hw in MINOR else 'local')
            ow = t.get('oneway') in ('yes', '1', 'true') or hw in ('motorway', 'motorway_link') or t.get('junction') == 'roundabout'
            lanes = num(t.get('lanes'))
            if not lanes:
                lanes = DEFAULT_LANES[hw] * (1 if ow else 2)
            lanes = int(max(1, min(lanes, 12)))
            width = num(t.get('width')) or lanes * LANE_W.get(hw, 3.3) + (3.0 if hw in ('motorway', 'trunk') else 0.6)
            r = {'h': hw, 'l': lanes, 'w': round(width, 1), 'p': flat(dp(pts, 0.6 if grp != 'local' else 1.2))}
            if t.get('name'):
                r['n'] = t.get('name')
            if t.get('ref'):
                r['r'] = t.get('ref')
            if ow:
                r['o'] = 1
            if t.get('bridge') and t.get('bridge') != 'no':
                r['b'] = 1
            if t.get('tunnel') and t.get('tunnel') != 'no':
                r['t'] = 1
            ly = num(t.get('layer'))
            if ly:
                r['y'] = int(max(-3, min(5, ly)))
            if t.get('junction') == 'roundabout':
                r['j'] = 1
            r['id'] = wy.id
            self.roads[grp].append(r)
            return
        ww = t.get('waterway')
        if ww in ('river', 'canal', 'stream') and not wy.is_closed():
            wd = num(t.get('width')) or {'river': 40, 'canal': 14, 'stream': 5}[ww]
            self.water_lines.append({'k': ww, 'w': wd, 'n': t.get('name', ''), 'p': flat(dp(pts, 2.0))})
            return
        if t.get('railway') in ('rail', 'light_rail') and t.get('service') is None:
            r = {'k': t.get('railway'), 'p': flat(dp(pts, 1.0))}
            if t.get('bridge') and t.get('bridge') != 'no':
                r['b'] = 1
            self.rail.append(r)

    def area(self, a):
        t = a.tags
        if t.get('building') and t.get('name') in ('NRG Stadium', 'Reliant Stadium', 'NRG Astrodome', 'Astrodome', 'NRG Center', 'NRG Arena'):
            self.landmarks.append({'n': t.get('name'), 'rings': self._rings(a, 0.3)})
            return
        k = land_class(t)
        if not k:
            return
        rings = self._rings(a, 2.5 if k in ('residential', 'farm', 'industrial') else 1.2)
        if rings:
            self.land.setdefault(k, []).append(rings)

    def _rings(self, a, eps):
        out = []
        try:
            for outer in a.outer_rings():
                ring = dp([w(n.lon, n.lat) for n in outer], eps)
                if len(ring) < 4:
                    continue
                holes = []
                for inner in a.inner_rings(outer):
                    hr = dp([w(n.lon, n.lat) for n in inner], eps)
                    if len(hr) >= 4:
                        holes.append(flat(hr))
                out.append([flat(ring)] + holes)
        except osmium.InvalidLocationError:
            return []
        return out


def main():
    src = sys.argv[1]
    h = H()
    h.apply_file(src, locations=True, idx='flex_mem')
    os.makedirs(OUT, exist_ok=True)
    meta = {'v': 1, 'origin': {'lat': LAT0, 'lng': LNG0}, 'unitsPerMile': UPM,
            'attribution': '© OpenStreetMap contributors (ODbL)'}
    for g, lst in h.roads.items():
        with open(os.path.join(OUT, 'roads-%s.json' % g), 'w') as f:
            json.dump({**meta, 'count': len(lst), 'roads': lst}, f, separators=(',', ':'))
        print(g, len(lst))
    with open(os.path.join(OUT, 'landcover.json'), 'w') as f:
        json.dump({**meta, 'classes': h.land, 'waterways': h.water_lines, 'rail': h.rail,
                   'landmarks': h.landmarks}, f, separators=(',', ':'))
    print('land', {k: len(v) for k, v in h.land.items()}, 'waterways', len(h.water_lines),
          'rail', len(h.rail), 'landmarks', [l['n'] for l in h.landmarks])


if __name__ == '__main__':
    main()
