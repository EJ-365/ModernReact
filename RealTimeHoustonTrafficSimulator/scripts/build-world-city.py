#!/usr/bin/env python3
"""Build lightweight world-city packs from local OpenStreetMap extracts (free, offline).

  python3 scripts/build-world-city.py [city ids…] [--buildings]

Inputs: src/world/catalog.json, PBF extracts in $OSM_DIR (BBBike city extracts or
Geofabrik regions, see catalog `src`), optional land polygons ($LAND_SHP, from
osmdata.openstreetmap.de) for the sea/coast. Needs osmium-tool, shapely, pyshp.
Outputs:
  public/data/world/<id>.json             roads, rail, water, sea, parks, airport
  public/data/cities/<id>/buildings.json  v2 building pack (same format as Houston)
Existing building packs are kept unless --buildings is passed.
"""
import json, math, os, re, subprocess, sys, tempfile
from shapely.geometry import shape, box, Polygon, MultiPolygon, LineString, MultiLineString
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = json.load(open(os.path.join(ROOT, 'src/world/catalog.json')))
OSM_DIR = os.environ.get('OSM_DIR', os.path.expanduser('~/tools/hts/osm'))
LAND_SHP = os.environ.get('LAND_SHP', os.path.join(OSM_DIR, 'land-polygons-split-4326/land_polygons.shp'))
Q = 1e-5
CORE_KM, STREET_KM, MAJOR_KM, APT_KM = 2.3, 3.6, 14.0, 4.5
MAX_BLD = 16000

def bbox_km(lat, lng, km):
    dl = km / 111.32; dn = km / (111.32 * math.cos(math.radians(lat)))
    return (lng - dn, lat - dl, lng + dn, lat + dl)

def union_bbox(*bs):
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))

def pbf_for(c):
    s = c['src']
    if s == 'texas': return os.path.join(OSM_DIR, 'texas.osm.pbf')
    return os.path.join(OSM_DIR, 'world', s + '.osm.pbf')

def run(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL)

def feats(path):
    for line in open(path):
        line = line.strip().lstrip('\x1e')
        if line: yield json.loads(line)

def num(v):
    if v is None: return float('nan')
    s = str(v).strip().lower().replace(',', '.')
    m = re.match(r'^-?[0-9]+(\.[0-9]+)?', s)
    if not m: return float('nan')
    n = float(m.group(0))
    return n * 0.3048 if re.search(r"ft|feet|'", s) else n

DEF = {'skyscraper':120,'tower':60,'office':24,'commercial':14,'hotel':30,'apartments':18,'residential':9,'house':7,'detached':7,
       'retail':7,'church':16,'cathedral':30,'mosque':16,'temple':12,'stadium':32,'parking':12,'garage':4,'industrial':10,'warehouse':9,
       'school':10,'university':16,'college':16,'dormitory':18,'hospital':24,'civic':14,'government':16,'train_station':14,
       'terminal':22,'hangar':16,'roof':5,'kiosk':3}

def heights(t, region_default):
    h = num(t.get('height', t.get('building:height'))); lv = num(t.get('building:levels')); rl = num(t.get('roof:levels'))
    if math.isnan(h) and not math.isnan(lv): h = min(lv, 165) * 3.3 + (0 if math.isnan(rl) else rl * 2.5) + 1.5
    if math.isnan(h): h = DEF.get(t.get('building') or t.get('building:part') or '', region_default)
    if h > 900: h *= 0.3048
    mh = num(t.get('min_height'))
    if math.isnan(mh):
        ml = num(t.get('building:min_level')); mh = 0 if math.isnan(ml) else ml * 3.3
    return round(min(h, 830) * 10) / 10, round(max(0, min(mh, h - 1)) * 10) / 10

NAMED = {'white':0xf2f0ea,'grey':0x9a9a96,'gray':0x9a9a96,'lightgrey':0xc8c8c4,'lightgray':0xc8c8c4,'darkgrey':0x5a5a58,'darkgray':0x5a5a58,
         'black':0x2a2a2a,'red':0xa8473a,'darkred':0x7a2e26,'brown':0x7a5a40,'beige':0xd8c8a4,'tan':0xcfb58e,'yellow':0xd9c66a,'orange':0xc9803f,
         'cream':0xeee4c8,'ivory':0xf0ead6,'pink':0xd8a0a0,'blue':0x5878a0,'lightblue':0x9fbfd8,'green':0x5f8a5a,'silver':0xbfc4c8,'sandybrown':0xd4a46a}
MAT = {'brick':0x9a5a44,'glass':0x6f8aa0,'concrete':0xb4b0a8,'stone':0xc9bfa8,'sandstone':0xd2bf94,'marble':0xe6e2da,'metal':0x9aa0a6,
       'plaster':0xe2dccd,'wood':0x8a6a4a,'steel':0x8d959c,'limestone':0xd8ccb0}

def color_of(v):
    if not v: return 0
    s = str(v).strip().lower().replace(' ', '').replace('_', '')
    if re.match(r'^#?[0-9a-f]{6}$', s): return int(s.lstrip('#'), 16)
    if re.match(r'^#[0-9a-f]{3}$', s): return int(''.join(ch * 2 for ch in s[1:]), 16)
    return NAMED.get(s, 0)

def enc_ring(coords, oLat, oLng):
    out = []
    for ln, la in coords: out += [round((la - oLat) / Q), round((ln - oLng) / Q)]
    return out

def enc_delta(coords, oLat, oLng):
    out = []; px = py = 0
    for ln, la in coords:
        a = round((la - oLat) / Q); b = round((ln - oLng) / Q)
        out += [a - px, b - py]; px, py = a, b
    return out

def dp_keep(L, tol, keep):
    """Douglas-Peucker that never drops a vertex shared with another road (junctions)."""
    cs = list(L.coords)
    if len(cs) < 2: return cs
    out = [cs[0]]; start = 0
    for i in range(1, len(cs)):
        if i == len(cs) - 1 or (round(cs[i][0], 7), round(cs[i][1], 7)) in keep:
            seg = LineString(cs[start:i + 1]).simplify(tol) if i - start > 1 else LineString(cs[start:i + 1])
            out += list(seg.coords)[1:]; start = i
    return out

def polys_of(g):
    if g.is_empty: return []
    if isinstance(g, Polygon): return [g]
    if isinstance(g, MultiPolygon): return list(g.geoms)
    return [p for p in getattr(g, 'geoms', []) if isinstance(p, Polygon)]

def lines_of(g):
    if isinstance(g, LineString): return [g]
    if isinstance(g, MultiLineString): return list(g.geoms)
    return [p for p in getattr(g, 'geoms', []) if isinstance(p, LineString)]

ROAD = {'motorway':0,'motorway_link':0,'trunk':1,'trunk_link':1,'primary':2,'primary_link':2,'secondary':3,'secondary_link':3,
        'tertiary':4,'tertiary_link':4,'residential':5,'unclassified':5,'living_street':5}

def build(c, do_bld):
    cid = c['id']; lat, lng = c['lat'], c['lng']; a = c['apt']
    pbf = pbf_for(c)
    if not os.path.exists(pbf): print('  missing', pbf); return
    major = bbox_km(lat, lng, MAJOR_KM); aptb = bbox_km(a['lat'], a['lng'], APT_KM)
    ext = union_bbox(major, aptb)
    tmp = tempfile.mkdtemp(prefix='wc-' + cid + '-')
    cut = os.path.join(tmp, 'cut.osm.pbf')
    run('osmium', 'extract', '-b', ','.join('%.5f' % v for v in ext), pbf, '-o', cut, '--overwrite', '-s', 'smart')
    base_f = os.path.join(tmp, 'base.osm.pbf'); base_j = os.path.join(tmp, 'base.geojsonseq')
    run('osmium', 'tags-filter', cut, 'w/highway=' + ','.join(ROAD), 'w/railway=rail,light_rail', 'nwr/natural=water,wood,beach,scrub',
        'nwr/water', 'nwr/waterway=riverbank,river,canal', 'nwr/leisure=park,garden,golf_course,pitch,nature_reserve',
        'nwr/landuse=grass,forest,meadow,recreation_ground,cemetery,village_green', 'nwr/aeroway', '-o', base_f, '--overwrite')
    run('osmium', 'export', base_f, '-o', base_j, '-f', 'geojsonseq', '--overwrite', '-a', 'type,id')
    core = box(*bbox_km(lat, lng, CORE_KM)); street = box(*bbox_km(lat, lng, STREET_KM))
    majorB = box(*major); aptB = box(*aptb); world = majorB.union(aptB)
    railB = box(*bbox_km(lat, lng, 9.0)); parkB = box(*bbox_km(lat, lng, 8.0))
    roads, rail, water, parks, rwy, twy, apron = [], [], [], [], [], [], []
    seen = {}; keep = set()
    for f in feats(base_j):
        if f['properties'].get('highway') in ROAD and f['geometry']['type'] == 'LineString':
            for ln, la in f['geometry']['coordinates']:
                k = (round(ln, 7), round(la, 7))
                if k in seen: keep.add(k)
                seen[k] = 1
    seen = None
    tol = 0.00004
    for f in feats(base_j):
        t = f['properties']; g = shape(f['geometry'])
        if g.is_empty: continue
        hw = t.get('highway'); aw = t.get('aeroway')
        if hw in ROAD and isinstance(g, (LineString, MultiLineString)):
            if t.get('tunnel') in ('yes', 'building_passage') or t.get('layer', '0').startswith('-'): continue
            cls = ROAD[hw]
            lim = street if cls == 5 else (street if cls == 4 and not g.intersects(core) else majorB)
            if cls == 4: lim = box(*bbox_km(lat, lng, 7.0))
            g = g.intersection(lim)
            for L in lines_of(g):
                pts = dp_keep(L, tol, keep)
                if len(pts) < 2: continue
                nm = (t.get('ref') if cls <= 1 and t.get('ref') else t.get('name', '')) if cls <= 3 else ''
                roads.append([cls, 1 if t.get('bridge') not in (None, 'no') else 0, 1 if t.get('oneway') == 'yes' or hw.startswith('motorway') else 0,
                              (nm or '')[:40], enc_delta(pts, lat, lng)])
        elif t.get('railway') in ('rail', 'light_rail') and isinstance(g, (LineString, MultiLineString)):
            if t.get('tunnel') == 'yes' or t.get('service'): continue
            for L in lines_of(g.intersection(railB)):
                L = L.simplify(tol)
                if len(L.coords) >= 2: rail.append(enc_delta(L.coords, lat, lng))
        elif aw in ('runway', 'taxiway') and isinstance(g, (LineString, MultiLineString)):
            w = num(t.get('width')); w = (w if not math.isnan(w) else (45 if aw == 'runway' else 23))
            for L in lines_of(g.intersection(world)):
                if len(L.coords) < 2: continue
                (rwy if aw == 'runway' else twy).append([round(w), (t.get('ref') or '')[:12], enc_delta(L.simplify(0.00001).coords, lat, lng)])
        elif isinstance(g, (Polygon, MultiPolygon)):
            kind = None
            if aw == 'apron': kind = 'apron'
            elif t.get('natural') == 'water' or t.get('water') or t.get('waterway') == 'riverbank': kind = 'water'
            elif t.get('leisure') or t.get('landuse') or t.get('natural') in ('wood', 'scrub', 'beach'):
                kind = 'sand' if t.get('natural') == 'beach' else ('wood' if t.get('natural') in ('wood', 'scrub') or t.get('landuse') == 'forest' else 'park')
            if not kind: continue
            if kind in ('park', 'wood', 'sand'):
                if g.area < 5e-7: continue
                g = g.intersection(parkB)
            else:
                g = g.intersection(world)
            for P in polys_of(g):
                if P.area < 2e-8: continue
                P = P.simplify(tol)
                if P.is_empty or not isinstance(P, Polygon): continue
                row = [enc_delta(P.exterior.coords[:-1], lat, lng)] + [enc_delta(h.coords[:-1], lat, lng) for h in P.interiors if len(h.coords) > 3]
                if kind == 'apron': apron.append(row)
                elif kind == 'water': water.append(row)
                else: parks.append([kind] + row)
        elif t.get('waterway') in ('river', 'canal') and isinstance(g, (LineString, MultiLineString)):
            w = num(t.get('width')); w = w if not math.isnan(w) else (26 if t['waterway'] == 'river' else 12)
            for L in lines_of(g.intersection(majorB)):
                L = L.simplify(tol)
                if len(L.coords) >= 2: water.append(['line', round(w), enc_delta(L.coords, lat, lng)])
    sea = []
    if os.path.exists(LAND_SHP):
        import shapefile
        sf = shapefile.Reader(LAND_SHP)
        land = []
        e = world.bounds
        for i, rec in enumerate(sf.iterShapes()):
            bb = rec.bbox
            if bb[2] < e[0] or bb[0] > e[2] or bb[3] < e[1] or bb[1] > e[3]: continue
            g = shape(rec.__geo_interface__)
            if not g.is_valid: g = g.buffer(0)
            land.append(g.intersection(box(*e)))
        landU = unary_union(land) if land else Polygon()
        seaG = box(*e).difference(landU)
        for P in polys_of(seaG):
            if P.area < 1e-7: continue
            P = P.simplify(0.00006)
            if isinstance(P, Polygon) and not P.is_empty:
                sea.append([enc_delta(P.exterior.coords[:-1], lat, lng)] + [enc_delta(h.coords[:-1], lat, lng) for h in P.interiors if len(h.coords) > 3])
    # terminals / hangars at the airport (outside the building core)
    bld_f = os.path.join(tmp, 'b.osm.pbf'); bld_j = os.path.join(tmp, 'b.geojsonseq')
    run('osmium', 'tags-filter', cut, 'nwr/building', 'nwr/building:part', '-o', bld_f, '--overwrite')
    run('osmium', 'export', bld_f, '-o', bld_j, '-f', 'geojsonseq', '--overwrite', '-a', 'type,id')
    region_default = 9 if c.get('drive') else 14
    rows, apt_bld = [], []
    for f in feats(bld_j):
        t = f['properties']
        if t.get('building') == 'no' or t.get('location') == 'underground' or t.get('building:part') == 'no': continue
        try: g = shape(f['geometry'])
        except Exception: continue
        if not isinstance(g, (Polygon, MultiPolygon)): continue
        cen = g.centroid
        in_core = core.contains(cen); in_apt = aptB.contains(cen) and not in_core
        if not (in_core or in_apt): continue
        h, mh = heights(t, region_default)
        if h < 2.5 or h - mh < 1: continue
        for P in polys_of(g):
            ar = P.area * (111320 ** 2) * math.cos(math.radians(lat))
            if ar < 14: continue
            if in_apt:
                if ar < 400: continue
                apt_bld.append([h, enc_delta(P.simplify(0.00001).exterior.coords[:-1], lat, lng)])
                continue
            d = math.hypot((cen.y - lat) * 111.32, (cen.x - lng) * 111.32 * math.cos(math.radians(lat)))
            ring = enc_ring(P.exterior.coords[:-1], lat, lng)
            holes = [enc_ring(hh.coords[:-1], lat, lng) for hh in P.interiors if len(hh.coords) > 3]
            col = color_of(t.get('building:colour')) or MAT.get(str(t.get('building:material', '')).lower(), 0)
            row = [h, mh, col, color_of(t.get('roof:colour')), str(t.get('name', ''))[:60], ring]
            if holes: row.append(holes)
            rows.append((d, bool(t.get('building:part')) and not t.get('building'), row))
    rows.sort(key=lambda r: r[0])
    rows = [r[2] for r in rows[:MAX_BLD]]
    bdir = os.path.join(ROOT, 'public/data/cities', cid); os.makedirs(bdir, exist_ok=True)
    bpath = os.path.join(bdir, 'buildings.json')
    if c.get('full'): rows = []
    if not c.get('full') and (do_bld or not os.path.exists(bpath)):
        s, w, n, e2 = core.bounds[1], core.bounds[0], core.bounds[3], core.bounds[2]
        json.dump({'v': 2, 'city': cid, 'source': 'OpenStreetMap', 'attribution': '© OpenStreetMap contributors (ODbL)',
                   'origin': [lat, lng], 'q': Q, 'tiles': [[round(s, 4), round(w, 4), round(n, 4), round(e2, 4)]], 'count': len(rows), 'buildings': rows},
                  open(bpath, 'w'), separators=(',', ':'), ensure_ascii=False)
    # main runway: longest runway line near the catalog airport
    best = None
    for wd, ref, arr in rwy:
        sa = sum(arr[0::2]); sb = sum(arr[1::2])
        p0 = (lat + arr[0] * Q, lng + arr[1] * Q); p1 = (lat + sa * Q, lng + sb * Q)
        L = math.hypot((p1[0] - p0[0]) * 111320, (p1[1] - p0[1]) * 111320 * math.cos(math.radians(lat)))
        if not best or L > best[0]: best = (L, ref, p0, p1, wd)
    apt = dict(a)
    if best:
        apt.update(len=round(best[0]), rwy=[[round(best[2][0], 6), round(best[2][1], 6)], [round(best[3][0], 6), round(best[3][1], 6)]], ref=best[1], w=best[4])
    out = {'v': 1, 'd': 1, 'id': cid, 'origin': [lat, lng], 'q': Q, 'attribution': '© OpenStreetMap contributors (ODbL)',
           'core': CORE_KM, 'extent': [round(v, 5) for v in ext], 'apt': apt,
           'roads': roads, 'rail': rail, 'water': water, 'sea': sea, 'parks': parks,
           'runways': rwy, 'taxiways': twy, 'aprons': apron, 'aptBuildings': apt_bld}
    op = os.path.join(ROOT, 'public/data/world', cid + '.json')
    json.dump(out, open(op, 'w'), separators=(',', ':'), ensure_ascii=False)
    subprocess.run(['rm', '-rf', tmp])
    print('  %-12s roads %5d rail %4d water %4d sea %3d parks %4d rwy %2d twy %3d aptB %3d bld %5d  %4.0f KB + %4.0f KB' % (
        cid, len(roads), len(rail), len(water), len(sea), len(parks), len(rwy), len(twy), len(apt_bld), len(rows),
        os.path.getsize(op) / 1024, os.path.getsize(bpath) / 1024 if os.path.exists(bpath) else 0))

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    do_bld = '--buildings' in sys.argv
    for c in CAT['cities']:
        if args and c['id'] not in args: continue
        print(c['id']); sys.stdout.flush()
        try: build(c, do_bld)
        except subprocess.CalledProcessError as e: print('  osmium failed', e)
