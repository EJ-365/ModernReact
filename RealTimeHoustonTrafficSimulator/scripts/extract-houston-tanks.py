#!/usr/bin/env python3
"""Houston storage tanks + silos from OSM into public/data/houston/tanks.json.

Usage: python3 scripts/extract-houston-tanks.py houston.osm.pbf
Each tank: [x, z, radius_m, height_m, kind] with kind 0=storage_tank, 1=silo (metre world)."""
import json, math, os, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
X = import_module('extract-houston-osm')


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.t = []

    def add(self, x, z, r, tags):
        kind = 1 if tags.get('man_made') == 'silo' else 0
        h = X.num(tags.get('height'))
        if not h:
            h = max(8.0, min(40.0, r * 2.4)) if kind else max(5.0, min(20.0, r * 0.75 + 3))
        self.t.append([round(x, 1), round(z, 1), round(r, 1), round(h, 1), kind])

    def node(self, n):
        if n.tags.get('man_made') in ('storage_tank', 'silo'):
            x, z = X.w(n.location.lon, n.location.lat)
            d = X.num(n.tags.get('diameter'))
            self.add(x, z, (d / 2) if d else 6.0, n.tags)

    def area(self, a):
        if a.tags.get('man_made') not in ('storage_tank', 'silo'):
            return
        try:
            for outer in a.outer_rings():
                pts = [X.w(n.lon, n.lat) for n in outer]
                if len(pts) < 4:
                    continue
                ar, cx, cz = 0.0, 0.0, 0.0
                for i in range(len(pts) - 1):
                    (x0, z0), (x1, z1) = pts[i], pts[i + 1]
                    c = x0 * z1 - x1 * z0
                    ar += c; cx += (x0 + x1) * c; cz += (z0 + z1) * c
                if abs(ar) < 1e-6:
                    continue
                cx /= 3 * ar; cz /= 3 * ar
                r = math.sqrt(abs(ar) / 2 / math.pi)
                if 1.0 <= r <= 70:
                    self.add(cx, cz, r, a.tags)
        except osmium.InvalidLocationError:
            return


def main():
    h = H()
    h.apply_file(sys.argv[1], locations=True, idx='flex_mem')
    path = os.path.join(X.OUT, 'tanks.json')
    with open(path, 'w') as f:
        json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 't': h.t}, f, separators=(',', ':'))
    print('tanks', len(h.t), os.path.getsize(path))


if __name__ == '__main__':
    main()
