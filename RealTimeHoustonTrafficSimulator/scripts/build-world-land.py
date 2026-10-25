#!/usr/bin/env python3
"""Natural Earth 1:50m land (public domain) -> compact quantized rings for the globe texture.
  python3 scripts/build-world-land.py ne_50m_land.geojson
Output: public/data/world/land.json  {q:0.05, rings:[[outer, hole…]] of [lng,lat,…] ints}"""
import json, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else '/tmp/ne50.json'
d = json.load(open(src)); rings = []
def add(r):
    out = []; last = None
    for ln, la in r:
        p = (round(ln * 20), round(la * 20))
        if p != last: out += p; last = p
    return out if len(out) >= 8 else None
for f in d['features']:
    g = f['geometry']
    polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    for P in polys:
        rs = [x for x in (add(r) for r in P) if x]
        if rs: rings.append(rs)
json.dump({'q': 0.05, 'source': 'Natural Earth 1:50m land (public domain)', 'rings': rings},
          open(os.path.join(ROOT, 'public/data/world/land.json'), 'w'), separators=(',', ':'))
print(len(rings), os.path.getsize(os.path.join(ROOT, 'public/data/world/land.json')) // 1024, 'KB')
