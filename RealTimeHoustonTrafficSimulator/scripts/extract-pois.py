#!/usr/bin/env python3
"""Popular places / attractions from an OSM .pbf -> compact JSON for the icon layer.
usage: extract-pois.py in.osm.pbf out.json [south west north east]
Record: [lat, lng, category, name, hasWiki]. Data © OpenStreetMap contributors (ODbL)."""
import sys, json, math, osmium

ALWAYS = {('tourism', 'museum'): 'museum', ('tourism', 'zoo'): 'zoo', ('tourism', 'theme_park'): 'theme', ('tourism', 'aquarium'): 'aquarium',
          ('leisure', 'water_park'): 'theme', ('amenity', 'planetarium'): 'museum'}
FAMOUS = {('tourism', 'attraction'): 'sight', ('tourism', 'gallery'): 'art', ('tourism', 'viewpoint'): 'view', ('amenity', 'theatre'): 'theatre',
          ('amenity', 'arts_centre'): 'theatre', ('amenity', 'concert_hall'): 'theatre', ('shop', 'mall'): 'mall', ('historic', 'monument'): 'monument',
          ('historic', 'memorial'): 'monument', ('historic', 'battlefield'): 'monument', ('historic', 'castle'): 'monument', ('natural', 'beach'): 'beach',
          ('leisure', 'stadium'): 'stadium', ('leisure', 'park'): 'park', ('leisure', 'garden'): 'park', ('tourism', 'attraction;museum'): 'museum', ('amenity', 'place_of_worship'): 'worship',
          ('building', 'cathedral'): 'worship', ('man_made', 'tower'): 'sight', ('amenity', 'university'): 'campus',
          ('amenity', 'marketplace'): 'mall', ('tourism', 'theme_park'): 'theme'}
ORDER = ['theme', 'zoo', 'aquarium', 'stadium', 'museum', 'sight', 'monument', 'theatre', 'art', 'mall', 'park', 'beach', 'campus', 'view', 'worship']

def cat_of(t):
    fam = 'wikidata' in t or 'wikipedia' in t
    best = None
    for k, v in t:
        c = ALWAYS.get((k, v)) or (FAMOUS.get((k, v)) if fam else None)
        if c and (best is None or ORDER.index(c) < ORDER.index(best)): best = c
    return best

class H(osmium.SimpleHandler):
    def __init__(s, bb):
        super().__init__(); s.out = []; s.bb = bb
    def add(s, t, lat, lng):
        if s.bb and not (s.bb[0] <= lat <= s.bb[2] and s.bb[1] <= lng <= s.bb[3]): return
        n = t.get('name:en') or t.get('name')
        if not n: return
        c = cat_of(t)
        if c: s.out.append([round(lat, 6), round(lng, 6), c, n, 1 if ('wikidata' in t or 'wikipedia' in t) else 0])
    def node(s, n):
        if n.location.valid(): s.add(n.tags, n.location.lat, n.location.lon)
    def way(s, w):
        try: pts = [(x.lat, x.lon) for x in w.nodes if x.location.valid()]
        except Exception: return
        if pts: s.add(w.tags, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))

src, dst = sys.argv[1], sys.argv[2]
bb = [float(x) for x in sys.argv[3:7]] if len(sys.argv) >= 7 else None
h = H(bb); h.apply_file(src, locations=True, idx='flex_mem')
keep = []
h.out.sort(key=lambda r: (-r[4], ORDER.index(r[2])))
for r in h.out:
    if any(q[3] == r[3] and abs(q[0] - r[0]) < 0.004 and abs(q[1] - r[1]) < 0.004 for q in keep): continue
    if r[2] in ('worship', 'park') and not r[4]: continue
    keep.append(r)
json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 'p': [r[:5] for r in keep]}, open(dst, 'w'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(keep), Counter(r[2] for r in keep).most_common())
