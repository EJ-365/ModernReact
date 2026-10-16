#!/usr/bin/env python3
"""Extract Houston toll gantries (highway=toll_gantry, barrier=toll_booth) from an OSM PBF into
public/data/houston/tolls.json: position, carriageway heading, lane count and road name.

Usage: python3 scripts/extract-houston-tolls.py houston.osm.pbf"""
import json, math, os, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
X = import_module('extract-houston-osm')

ROADS = {'motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary'}


class Nodes(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.g = {}

    def node(self, n):
        t = n.tags
        if t.get('highway') == 'toll_gantry' or t.get('barrier') == 'toll_booth':
            self.g[n.id] = {'x': 0, 'z': 0, 'kind': 'gantry' if t.get('highway') == 'toll_gantry' else 'booth',
                            'n': t.get('name', ''), 'lon': n.location.lon, 'lat': n.location.lat}


class Ways(osmium.SimpleHandler):
    def __init__(self, g):
        super().__init__()
        self.g = g
        self.hit = {}

    def way(self, w):
        hw = w.tags.get('highway')
        if hw not in ROADS:
            return
        refs = [n.ref for n in w.nodes]
        for i, r in enumerate(refs):
            if r not in self.g or r in self.hit:
                continue
            a = w.nodes[max(0, i - 1)].location
            b = w.nodes[min(len(refs) - 1, i + 1)].location
            ax, az = X.w(a.lon, a.lat)
            bx, bz = X.w(b.lon, b.lat)
            try:
                lanes = int(str(w.tags.get('lanes', '')).split(';')[0])
            except ValueError:
                lanes = 3 if hw in ('motorway', 'trunk') else 1 if hw.endswith('_link') else 2
            ow = w.tags.get('oneway') == 'yes' or hw in ('motorway', 'motorway_link')
            self.hit[r] = {'h': math.atan2(bx - ax, bz - az), 'l': max(1, min(8, lanes if ow else max(1, lanes // 2))),
                           'ow': ow, 'road': w.tags.get('ref') or w.tags.get('name') or '', 'hw': hw}


def main():
    nh = Nodes()
    nh.apply_file(sys.argv[1])
    wh = Ways(nh.g)
    wh.apply_file(sys.argv[1], locations=True, idx='flex_mem')
    out = []
    for nid, g in nh.g.items():
        h = wh.hit.get(nid)
        if not h:
            continue
        x, z = X.w(g['lon'], g['lat'])
        out.append({'x': round(x, 1), 'z': round(z, 1), 'h': round(h['h'], 4), 'l': h['l'], 'ow': h['ow'],
                    'k': g['kind'], 'n': g['n'], 'r': h['road'], 'hw': h['hw']})
    path = os.path.join(X.OUT, 'tolls.json')
    with open(path, 'w') as f:
        json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 'tolls': out}, f, separators=(',', ':'))
    print(len(nh.g), 'tagged,', len(out), 'on roads ->', path, os.path.getsize(path))


if __name__ == '__main__':
    main()
