#!/usr/bin/env python3
"""Houston place names (city/town/suburb/neighbourhood/...) from OSM into public/data/houston/places.json.

Usage: python3 scripts/extract-houston-places.py houston.osm.pbf
Each place: [x, z, rank, name] in the metre world; rank 0 = city ... 4 = hamlet/locality."""
import json, os, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
X = import_module('extract-houston-osm')
RANK = {'city': 0, 'town': 1, 'borough': 2, 'suburb': 2, 'quarter': 3, 'village': 3, 'neighbourhood': 3, 'hamlet': 4}


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.p = []

    def node(self, n):
        pl = n.tags.get('place')
        name = n.tags.get('name')
        if pl in RANK and name:
            x, z = X.w(n.location.lon, n.location.lat)
            self.p.append([round(x), round(z), RANK[pl], name])


def main():
    h = H()
    h.apply_file(sys.argv[1], locations=False)
    seen, out = set(), []
    for p in sorted(h.p, key=lambda q: q[2]):
        key = (p[3], round(p[0] / 2000), round(p[1] / 2000))
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    path = os.path.join(X.OUT, 'places.json')
    with open(path, 'w') as f:
        json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 'p': out}, f, separators=(',', ':'), ensure_ascii=False)
    print('places', len(out), os.path.getsize(path))


if __name__ == '__main__':
    main()
