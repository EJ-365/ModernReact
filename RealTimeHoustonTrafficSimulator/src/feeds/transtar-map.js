/**
 * Houston TranStar title → road / direction mapping (pure).
 * Geometry resolution (nearestArc) is injected by app.html when available.
 */

/** @type {{ re: RegExp, id: string }[]} */
export const TRANSTAR_ROAD_MAP = [
  { re: /beltway\s*8|sam houston toll/i, id: 'bw8' },
  { re: /hardy/i, id: 'hardy' },
  { re: /westpark/i, id: 'westpark' },
  { re: /grand parkway|sh-?99|tx-?99/i, id: 'tx99' },
  { re: /sh-?249|tomball/i, id: 'sh249' },
  { re: /sh-?288|south fwy/i, id: 'sh288' },
  { re: /sh-?225|la porte/i, id: 'sh225' },
  { re: /sh-?146/i, id: 'sh146' },
  { re: /us-?290|northwest fwy/i, id: 'us290' },
  { re: /ih-?69\s*eastex|us-?59\s*eastex|eastex/i, id: 'us59' },
  { re: /ih-?69\s*southwest|us-?59\s*southwest|southwest fwy|us-?59/i, id: 'us59' },
  { re: /ih-?10\s*(katy|east|west)|i-?10|katy fwy|east fwy/i, id: 'i10' },
  { re: /ih-?45\s*(gulf|north)|i-?45|gulf fwy|north fwy/i, id: 'i45' },
  { re: /ih-?610|i-?610|the loop/i, id: 'i610' },
  { re: /fm\s*1960/i, id: 'fm1960' },
  { re: /sh-?6\b|hwy\s*6/i, id: 'sh6' },
  { re: /fm\s*1093|westpark.*extension/i, id: 'fm1093' },
  { re: /sh-?35\b/i, id: 'sh35' },
  { re: /fort bend.*toll|fb toll/i, id: 'fbpkwy' },
];

/**
 * Named corridor end hints for travel-time geometry (world units).
 * @type {Record<string, { re: RegExp, ax: number, az: number, bx: number, bz: number }[]>}
 */
export const TRANSTAR_CORRIDOR_HINTS = {
  i10: [
    { re: /katy|barker|sh-?99|beltway 8-?west|610 west|downtown/i, ax: -3450, az: -330, bx: 60, bz: -200 },
    { re: /east|spur-?330|baytown|610 east/i, ax: 60, az: -200, bx: 3600, bz: -250 },
  ],
  us59: [
    { re: /richmond|rosenberg|fort\s*bend/i, ax: -4600, az: 3400, bx: 260, bz: 60 },
    { re: /southwest|sugar|missouri|stafford/i, ax: -2900, az: 2000, bx: 260, bz: 60 },
    { re: /eastex|kingwood|humble|airport/i, ax: 1320, az: -3500, bx: 260, bz: 60 },
  ],
  i45: [
    { re: /north|woodlands|conroe|tomball|hardy/i, ax: -1090, az: -3400, bx: 40, bz: 60 },
    { re: /gulf|galveston|clear creek|nasa|webster|league/i, ax: 40, az: 60, bx: 7290, bz: 6804 },
  ],
  us290: [{ re: /.*/, ax: -6861, az: -4281, bx: 40, bz: -210 }],
  sh288: [{ re: /.*/, ax: 380, az: 2600, bx: -634, bz: 5500 }],
  bw8: [{ re: /.*/, ax: -1820, az: -40, bx: 1820, bz: -40 }],
  i610: [{ re: /.*/, ax: -980, az: -30, bx: 980, bz: -30 }],
  hardy: [{ re: /.*/, ax: 100, az: -420, bx: 760, bz: -3600 }],
  westpark: [{ re: /.*/, ax: -5414, az: 428, bx: -1045, bz: 555 }],
  sh249: [{ re: /.*/, ax: -950, az: -935, bx: -3050, bz: -4000 }],
  sh225: [{ re: /.*/, ax: 600, az: 320, bx: 3420, bz: 920 }],
  tx99: [
    { re: /katy|cypress|290/i, ax: -5653, az: -181, bx: -3276, bz: -3484 },
    { re: /tomball|249|spring/i, ax: -3276, az: -3484, bx: -760, bz: -5078 },
    { re: /kingwood|humble|59/i, ax: -760, az: -5078, bx: 2636, bz: -3194 },
    { re: /baytown|146|east/i, ax: 2636, az: -3194, bx: 5026, bz: -152 },
    { re: /league|rosharon|sugar/i, ax: 5026, az: -152, bx: -3276, bz: 2167 },
  ],
  fm1093: [{ re: /.*/, ax: -5666, az: -296, bx: -3276, bz: 2457 }],
  sh35: [{ re: /.*/, ax: 1127, az: 2891, bx: 1630, bz: 4920 }],
  fbpkwy: [{ re: /.*/, ax: 150, az: 190, bx: -3276, bz: 2167 }],
};

/**
 * @param {string} title
 * @returns {string|null}
 */
export function mapTranStarRoadId(title) {
  const t = String(title || '');
  for (const m of TRANSTAR_ROAD_MAP) if (m.re.test(t)) return m.id;
  return null;
}

/**
 * Text-only direction heuristic (no road graph).
 * @param {string} title
 * @param {string} roadId
 * @returns {1|-1}
 */
export function mapTranStarDirSignHeuristic(title, roadId) {
  const t = String(title || '').toLowerCase();
  if (/eastbound|northbound|inbound/.test(t)) {
    if (roadId === 'i10' || roadId === 'westpark' || roadId === 'sh225') return 1;
    if (
      roadId === 'i45' ||
      roadId === 'sh288' ||
      roadId === 'hardy' ||
      roadId === 'sh249' ||
      roadId === 'tx99' ||
      roadId === 'sh6'
    )
      return 1;
    if (roadId === 'us290') return -1;
    if (roadId === 'us59') return /eastex|north/.test(t) ? 1 : -1;
    return 1;
  }
  if (/westbound|southbound|outbound/.test(t)) {
    if (roadId === 'i10' || roadId === 'westpark' || roadId === 'sh225') return -1;
    if (
      roadId === 'i45' ||
      roadId === 'sh288' ||
      roadId === 'hardy' ||
      roadId === 'sh249' ||
      roadId === 'tx99' ||
      roadId === 'sh6'
    )
      return -1;
    if (roadId === 'us290') return 1;
    if (roadId === 'us59') return /eastex|north/.test(t) ? -1 : 1;
    return -1;
  }
  return 1;
}

/**
 * @typedef {Object} TranStarDirDeps
 * @property {(id: string) => any} [findRoadByKey]
 * @property {(road: any, x: number, z: number) => number} [nearestArc]
 */

/**
 * Full direction sign: geometry when deps present, else heuristic.
 * @param {string} title
 * @param {string} roadId
 * @param {TranStarDirDeps} [deps]
 * @returns {1|-1}
 */
export function mapTranStarDirSign(title, roadId, deps = {}) {
  const t = String(title || '').toLowerCase();
  const findRoadByKey = deps.findRoadByKey;
  const nearestArc = deps.nearestArc;
  const road = findRoadByKey ? findRoadByKey(roadId) : null;
  if (!road || !nearestArc) return mapTranStarDirSignHeuristic(title, roadId);

  const hints = TRANSTAR_CORRIDOR_HINTS[roadId];
  if (hints) {
    for (const h of hints) {
      if (!h.re.test(t)) continue;
      const a = nearestArc(road, h.ax, h.az);
      const b = nearestArc(road, h.bx, h.bz);
      return b >= a ? 1 : -1;
    }
  }
  return mapTranStarDirSignHeuristic(title, roadId);
}

/**
 * @param {string} desc
 * @returns {number|null}
 */
export function parseTravelMinutes(desc) {
  const m =
    String(desc || '').match(/travel\s*time\s*:\s*(\d+)\s*min/i) ||
    String(desc || '').match(/(\d+)\s*minutes?/i);
  return m ? Number(m[1]) : null;
}
