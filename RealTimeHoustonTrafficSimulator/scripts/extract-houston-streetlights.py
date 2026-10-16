#!/usr/bin/env python3
"""Houston street lighting from OSM into public/data/houston/streetlights.json.

Usage: python3 scripts/extract-houston-streetlights.py houston.osm.pbf
  lamps: mapped highway=street_lamp nodes [x,z,...]
  lit:   ids of major-road ways tagged lit=yes (poles placed on the rendered deck at runtime)
  litMinor: lit=yes minor/local streets as polylines {h,p}"""
import json, os, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
X = import_module('extract-houston-osm')
MINOR = {'tertiary', 'tertiary_link', 'residential', 'unclassified', 'living_street'}


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.lamps, self.lit, self.minor = [], [], []

    def node(self, n):
        if n.tags.get('highway') == 'street_lamp':
            x, z = X.w(n.location.lon, n.location.lat)
            self.lamps += [round(x, 1), round(z, 1)]

    def way(self, wy):
        h = wy.tags.get('highway')
        if not h or wy.tags.get('lit') != 'yes':
            return
        if h in MINOR:
            try:
                pts = [X.w(n.lon, n.lat) for n in wy.nodes]
            except osmium.InvalidLocationError:
                return
            if len(pts) >= 2:
                self.minor.append({'h': h, 'p': X.flat(X.dp(pts, 1.0))})
        elif h.startswith(('motorway', 'trunk', 'primary', 'secondary')):
            self.lit.append(wy.id)


def main():
    h = H()
    h.apply_file(sys.argv[1], locations=True, idx='flex_mem')
    path = os.path.join(X.OUT, 'streetlights.json')
    with open(path, 'w') as f:
        json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 'lamps': h.lamps, 'lit': h.lit, 'litMinor': h.minor}, f, separators=(',', ':'))
    print('lamps', len(h.lamps) // 2, 'lit major', len(h.lit), 'lit minor', len(h.minor), os.path.getsize(path))


if __name__ == '__main__':
    main()
