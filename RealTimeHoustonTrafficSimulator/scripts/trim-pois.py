"""Trim world-city attraction packs (public/data/world/pois/*.json): minor parks, churches, memorial plaques and
campus buildings are kept only when they have a Wikipedia/Wikidata tag; capped at 700 places, famous first."""
import json, glob, sys
KEEP = {'theme', 'zoo', 'aquarium', 'museum', 'stadium', 'theatre', 'mall', 'sight', 'beach', 'view', 'art'}
ORDER = ['theme', 'zoo', 'aquarium', 'stadium', 'museum', 'sight', 'monument', 'theatre', 'art', 'mall', 'park', 'beach', 'campus', 'view', 'worship']
for f in sorted(glob.glob(sys.argv[1] if len(sys.argv) > 1 else 'public/data/world/pois/*.json')):
    d = json.load(open(f)); n0 = len(d['p'])
    p = [r for r in d['p'] if r[4] or r[2] in KEEP]
    p.sort(key=lambda r: (-r[4], ORDER.index(r[2]) if r[2] in ORDER else 99))
    d['p'] = p[:700]
    json.dump(d, open(f, 'w'), ensure_ascii=False, separators=(',', ':'))
    print(f.split('/')[-1], n0, '->', len(d['p']))
