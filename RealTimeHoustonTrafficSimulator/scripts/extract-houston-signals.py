#!/usr/bin/env python3
"""Houston traffic signals from OSM into public/data/houston/signals.json.

Usage: python3 scripts/extract-houston-signals.py houston.osm.pbf
Each signal node: [x, z] in the metre world (same projection as roads)."""
import json, os, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
X = import_module('extract-houston-osm')


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.s = []

    def node(self, n):
        if n.tags.get('highway') == 'traffic_signals' or n.tags.get('crossing') == 'traffic_signals':
            x, z = X.w(n.location.lon, n.location.lat)
            self.s.append([round(x, 1), round(z, 1)])


def main():
    h = H()
    h.apply_file(sys.argv[1], locations=False)
    path = os.path.join(X.OUT, 'signals.json')
    with open(path, 'w') as f:
        json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 's': h.s}, f, separators=(',', ':'))
    print('signals', len(h.s), os.path.getsize(path))


if __name__ == '__main__':
    main()
