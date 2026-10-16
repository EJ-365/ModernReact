#!/usr/bin/env python3
"""Split public/data/houston/{roads-minor,roads-local,landcover}.json into 4 km tiles for streaming.

Writes public/data/houston/tiles/<layer>/<tx>_<tz>.json and tiles/index.json.
roads-major.json stays a single file (it is loaded eagerly)."""
import json, os, collections

D = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'houston')
T = 4000.0


def key_of(flat):
    xs, zs = flat[0::2], flat[1::2]
    cx, cz = (min(xs) + max(xs)) / 2, (min(zs) + max(zs)) / 2
    return int(cx // T), int(cz // T)


def dump(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(obj, f, separators=(',', ':'))


def main():
    index = {'v': 1, 'tile': T, 'layers': {}}
    for layer in ('minor', 'local'):
        src = json.load(open(os.path.join(D, 'roads-%s.json' % layer)))
        tiles = collections.defaultdict(list)
        for r in src['roads']:
            tiles[key_of(r['p'])].append(r)
        for (tx, tz), lst in tiles.items():
            dump(os.path.join(D, 'tiles', layer, '%d_%d.json' % (tx, tz)), {'roads': lst})
        index['layers'][layer] = sorted('%d_%d' % k for k in tiles)
        print(layer, len(tiles), 'tiles')
    lc = json.load(open(os.path.join(D, 'landcover.json')))
    tiles = collections.defaultdict(lambda: {'classes': collections.defaultdict(list), 'waterways': [], 'rail': []})
    for cls, polys in lc['classes'].items():
        for poly in polys:
            tiles[key_of(poly[0][0])]['classes'][cls].append(poly)
    for kind in ('waterways', 'rail'):
        for ln in lc[kind]:
            tiles[key_of(ln['p'])][kind].append(ln)
    for (tx, tz), obj in tiles.items():
        dump(os.path.join(D, 'tiles', 'land', '%d_%d.json' % (tx, tz)), obj)
    index['layers']['land'] = sorted('%d_%d' % k for k in tiles)
    index['landmarks'] = lc['landmarks']
    index['attribution'] = lc['attribution']
    dump(os.path.join(D, 'tiles', 'index.json'), index)
    print('land', len(tiles), 'tiles')


if __name__ == '__main__':
    main()
