"""Houston-area water towers from OSM (man_made=water_tower), each tagged with the city whose
limits it stands in (boundary=administrative, admin_level=8).
Usage: python3 scripts/extract-houston-water-towers.py houston.osm.pbf > public/data/houston/water-towers.json
Needs: pip install osmium shapely"""
import json, math, sys
import osmium
import shapely.wkb as wkblib
from shapely.geometry import Point

fab = osmium.geom.WKBFactory()
towers, cities = [], []


class H(osmium.SimpleHandler):
    def add(self, tags, lat, lng):
        if tags.get('man_made') == 'water_tower':
            towers.append({'lat': round(lat, 6), 'lng': round(lng, 6), 'name': tags.get('name') or tags.get('operator') or '', 'h': tags.get('height')})

    def node(self, n):
        self.add({t.k: t.v for t in n.tags}, n.location.lat, n.location.lon)

    def way(self, w):
        t = {x.k: x.v for x in w.tags}
        if t.get('man_made') != 'water_tower':
            return
        try:
            p = [(n.location.lat, n.location.lon) for n in list(w.nodes)]
            self.add(t, sum(a for a, _ in p) / len(p), sum(b for _, b in p) / len(p))
        except osmium.InvalidLocationError:
            pass

    def area(self, a):
        t = {x.k: x.v for x in a.tags}
        if t.get('boundary') == 'administrative' and t.get('admin_level') == '8' and 'name' in t:
            try:
                cities.append((t['name'], wkblib.loads(fab.create_multipolygon(a), hex=True)))
            except Exception:
                pass


H().apply_file(sys.argv[1], locations=True)
out = []
for o in towers:
    # a tower mapped as both a node and a footprint way: keep one
    if any(math.hypot((o['lat'] - q['lat']) * 111000, (o['lng'] - q['lng']) * 96000) < 40 for q in out):
        continue
    p = Point(o['lng'], o['lat'])
    o['city'] = next((n for n, g in cities if g.contains(p)), '')
    try:
        o['h'] = round(float(str(o['h']).split()[0]), 1) if o['h'] else None
    except ValueError:
        o['h'] = None
    out.append(o)
json.dump({'v': 1, 'attribution': '© OpenStreetMap contributors (ODbL)', 't': [[o['lat'], o['lng'], o['city'], o['name'], o['h']] for o in out]}, sys.stdout, separators=(',', ':'))
print(len(out), 'towers', file=sys.stderr)
