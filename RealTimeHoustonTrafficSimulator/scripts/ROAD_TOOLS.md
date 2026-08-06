# Houston road data — recommended tools

The sim uses Three.js ribbon meshes with baked lane-marking textures (centerline → CatmullRom → UV asphalt). Bad OSM merges caused black screens earlier; boot freeways stay on legacy corridors (`USE_OSM_BOOT=false`).

## Best local pipeline (already in repo)

```bash
npm run roads:fetch   # Overpass tiles + BBBike Houston fallback
npm run roads:merge   # clean merge + roads-boot.js + spatial index
```

After a clean merge (reversal rate low), set `USE_OSM_BOOT=true` in `app.html`.

## Advanced sources / 3D road tools

| Tool | What | Link |
|------|------|------|
| **BBBike Houston extract** | Ready city OSM dump (fallback in fetch) | https://download.bbbike.org/osm/bbbike/Houston/ |
| **Geofabrik Texas PBF** + **Osmium** | Full-state clip/filter highways | https://download.geofabrik.de/north-america/us/texas.html |
| **OSMnx (Python)** | Graph-clean street network → GeoJSON | `pip install osmnx` |
| **map3d / Overpass → Three.js** | Real OSM roads as asphalt ribbons | https://github.com/Oli97430/map3d |
| **QGIS + QuickOSM** | Visual QA of corridors before import | https://qgis.org/ |
| **TxDOT Roadway Inventory / RHINo** | Official Texas centerlines | TxDOT open data portal |
| **MapLibre / MVT tiles** | Stream vector tiles → Three meshes | three.js discourse vector-tile threads |

## QA check before enabling OSM boot

```bash
node -e "global.window={};eval(require('fs').readFileSync('public/data/roads-boot.js','utf8')); const r=window.OSM_ROAD_BOOT.roads; let rev=0; for(const road of r){for(let i=2;i<road.pts.length;i++){const c=road.pts[i-2],a=road.pts[i-1],b=road.pts[i]; const ax=a[0]-c[0],az=a[1]-c[1],bx=b[0]-a[0],bz=b[1]-a[1]; const la=Math.hypot(ax,az),lb=Math.hypot(bx,bz); if(la>0.2&&lb>0.2&&ax*bx+az*bz<-0.55*la*lb)rev++;}} console.log({roads:r.length,reversals:rev});"
```

Target: **reversals near 0** (old bad boot had ~783).
