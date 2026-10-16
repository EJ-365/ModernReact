#!/usr/bin/env python3
"""Extract Houston airport geometry (aeroway=*) from an OSM PBF into public/data/houston/airports.json.

Usage: python3 scripts/extract-houston-aeroway.py houston.osm.pbf
Runways/taxiways are centrelines with widths; aerodromes/aprons/terminals/hangars are polygon rings.
Coordinates use the same metre world as extract-houston-osm.py."""
import json, os, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
from importlib import import_module
X = import_module('extract-houston-osm')


def is_tower(t):
    return t.get('aeroway') in ('control_tower', 'tower') or t.get('tower:type') in ('airport_control', 'aircraft_control') or t.get('service') == 'aircraft_control'


class H(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.out = {'aerodromes': [], 'aprons': [], 'terminals': [], 'hangars': [], 'runways': [], 'taxiways': [], 'towers': [], 'gates': [], 'stands': [], 'bridges': []}

    def node(self, n):
        a = n.tags.get('aeroway')
        try:
            x, z = X.w(n.location.lon, n.location.lat)
        except osmium.InvalidLocationError:
            return
        if is_tower(n.tags):
            self.out['towers'].append({'x': round(x, 1), 'z': round(z, 1), 'h': X.num(n.tags.get('height')) or 0, 'n': n.tags.get('name', '')})
        elif a == 'gate':
            self.out['gates'].append([round(x, 1), round(z, 1)])
        elif a == 'parking_position':
            self.out['stands'].append([round(x, 1), round(z, 1)])

    def way(self, wy):
        a = wy.tags.get('aeroway')
        if a == 'jet_bridge' and not wy.is_closed():
            try:
                pts = [X.w(n.lon, n.lat) for n in wy.nodes]
            except osmium.InvalidLocationError:
                return
            if len(pts) >= 2:
                self.out['bridges'].append(X.flat(pts))
            return
        if a == 'parking_position' and not wy.is_closed():
            try:
                pts = [X.w(n.lon, n.lat) for n in wy.nodes]
            except osmium.InvalidLocationError:
                return
            if len(pts) >= 2:
                self.out['stands'].append([round(pts[0][0], 1), round(pts[0][1], 1), round(pts[-1][0], 1), round(pts[-1][1], 1)])
            return
        if a not in ('runway', 'taxiway', 'taxilane') or wy.is_closed():
            return
        try:
            pts = [X.w(n.lon, n.lat) for n in wy.nodes]
        except osmium.InvalidLocationError:
            return
        if len(pts) < 2:
            return
        wd = X.num(wy.tags.get('width')) or (45 if a == 'runway' else 23 if a == 'taxiway' else 12)
        r = {'p': X.flat(X.dp(pts, 0.5)), 'w': round(min(wd, 80), 1)}
        if wy.tags.get('ref'):
            r['ref'] = wy.tags.get('ref')
        self.out['runways' if a == 'runway' else 'taxiways'].append(r)

    def area(self, ar):
        a = ar.tags.get('aeroway')
        if is_tower(ar.tags):
            try:
                for outer in ar.outer_rings():
                    pts = [X.w(n.lon, n.lat) for n in outer]
                    cx = sum(p[0] for p in pts) / len(pts); cz = sum(p[1] for p in pts) / len(pts)
                    self.out['towers'].append({'x': round(cx, 1), 'z': round(cz, 1), 'h': X.num(ar.tags.get('height')) or 0, 'n': ar.tags.get('name', '')})
                    break
            except osmium.InvalidLocationError:
                pass
            return
        key = {'aerodrome': 'aerodromes', 'apron': 'aprons', 'terminal': 'terminals', 'hangar': 'hangars'}.get(a)
        if not key:
            return
        try:
            for outer in ar.outer_rings():
                ring = X.dp([X.w(n.lon, n.lat) for n in outer], 1.0 if key != 'aerodromes' else 3.0)
                if len(ring) >= 4:
                    item = {'r': X.flat(ring)}
                    if key == 'aerodromes' and ar.tags.get('iata'):
                        item['iata'] = ar.tags.get('iata')
                    if key == 'aerodromes' and ar.tags.get('icao'):
                        item['icao'] = ar.tags.get('icao')
                    if key in ('aerodromes', 'terminals') and ar.tags.get('name'):
                        item['n'] = ar.tags.get('name')
                    if key in ('terminals', 'hangars'):
                        item['h'] = X.num(ar.tags.get('height')) or (X.num(ar.tags.get('building:levels'), 0) * 4.5 or (18 if key == 'terminals' else 12))
                    self.out[key].append(item)
        except osmium.InvalidLocationError:
            return


def main():
    h = H()
    h.apply_file(sys.argv[1], locations=True, idx='flex_mem')
    path = os.path.join(X.OUT, 'airports.json')
    with open(path, 'w') as f:
        json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', **h.out}, f, separators=(',', ':'))
    print({k: len(v) for k, v in h.out.items()}, os.path.getsize(path))


if __name__ == '__main__':
    main()
