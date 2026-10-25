#!/usr/bin/env python3
"""Store each world city's longest real OSM runway (from its pack) in the catalog as apt.rwy,
so intercity take-offs and landings use the real centreline instead of the catalog heading."""
import json, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'src/world/catalog.json')
C = json.load(open(P))
for c in C['cities']:
    f = os.path.join(ROOT, 'public/data/world', c['id'] + '.json')
    if c.get('full') or not os.path.exists(f): continue
    K = json.load(open(f)); q = K.get('q', 1e-5); dl = bool(K.get('d'))
    a = c['apt']; best = None
    for rw in K.get('runways', []):
        w, ref, arr = rw[0], rw[1], rw[2]
        pts = []; x = y = 0
        for i in range(0, len(arr) - 1, 2):
            if dl: x += arr[i]; y += arr[i + 1]
            else: x, y = arr[i], arr[i + 1]
            pts.append((c['lat'] + x * q, c['lng'] + y * q))
        if len(pts) < 2: continue
        (la0, ln0), (la1, ln1) = pts[0], pts[-1]
        kx = 111320 * math.cos(math.radians(a['lat']))
        L = math.hypot((ln1 - ln0) * kx, (la1 - la0) * 110574)
        mid = math.hypot(((ln0 + ln1) / 2 - a['lng']) * kx, ((la0 + la1) / 2 - a['lat']) * 110574)
        if w and w >= 15 and mid < 7000 and (best is None or L > best[0]): best = (L, pts[0], pts[-1], w, ref)
    if best:
        a['rwy'] = [[round(best[1][0], 6), round(best[1][1], 6)], [round(best[2][0], 6), round(best[2][1], 6)]]
        a['w'] = round(best[3]); a['ref'] = best[4] or ''
        print('%-14s %s %5.0f m  %s' % (c['id'], a['code'], best[0], a['ref']))
    else: print('%-14s %s  no runway in pack' % (c['id'], a['code']))
json.dump(C, open(P, 'w'), indent=1, ensure_ascii=False)
