import './font-imports.js';

// Each entry: family (CSS name), group, connected (cursive script: render whole
// words so joins stay intact), weight (default pen thickness bias), xh (target
// x-height multiplier — some styles are written smaller/larger by nature).
export const FONTS = [
  { id: 'caveat', family: 'Caveat', label: 'Everyday Notes', group: 'Everyday', connected: false, xh: 1.0 },
  { id: 'kalam', family: 'Kalam', label: 'Student Print', group: 'Everyday', connected: false, xh: 0.95 },
  { id: 'patrick', family: 'Patrick Hand', label: 'Tidy Print', group: 'Neat print', connected: false, xh: 0.95 },
  { id: 'indie', family: 'Indie Flower', label: 'Round & Friendly', group: 'Everyday', connected: false, xh: 0.92 },
  { id: 'shadows', family: 'Shadows Into Light', label: 'Light Hand', group: 'Everyday', connected: false, xh: 0.95 },
  { id: 'nanum', family: 'Nanum Pen Script', label: 'Gel Pen Quick', group: 'Everyday', connected: false, xh: 1.05 },
  { id: 'justme', family: 'Just Me Again Down Here', label: 'Narrow Jotter', group: 'Quick & messy', connected: false, xh: 1.05 },
  { id: 'reenie', family: 'Reenie Beanie', label: 'Rushed Scribble', group: 'Quick & messy', connected: false, xh: 1.05 },
  { id: 'loved', family: 'Loved by the King', label: 'Scratchy Tall', group: 'Quick & messy', connected: false, xh: 1.0 },
  { id: 'waiting', family: 'Waiting for the Sunrise', label: 'Loose Diary', group: 'Quick & messy', connected: false, xh: 0.95 },
  { id: 'sueellen', family: 'Sue Ellen Francisco', label: 'Skinny Margins', group: 'Quick & messy', connected: false, xh: 1.0 },
  { id: 'rainbow', family: 'Over the Rainbow', label: 'Airy Print', group: 'Neat print', connected: false, xh: 0.95 },
  { id: 'architect', family: 'Architects Daughter', label: 'Drafting Caps', group: 'Neat print', connected: false, xh: 0.9 },
  { id: 'coming', family: 'Coming Soon', label: 'Rounded Print', group: 'Neat print', connected: false, xh: 0.88 },
  { id: 'schoolbell', family: 'Schoolbell', label: 'Classroom', group: 'Neat print', connected: false, xh: 0.92 },
  { id: 'gloria', family: 'Gloria Hallelujah', label: 'Comic Margin', group: 'Bold & marker', connected: false, xh: 0.85 },
  { id: 'covered', family: 'Covered By Your Grace', label: 'Felt Tip', group: 'Bold & marker', connected: false, xh: 1.0 },
  { id: 'gochi', family: 'Gochi Hand', label: 'Chunky Kid', group: 'Bold & marker', connected: false, xh: 0.95 },
  { id: 'homemade', family: 'Homemade Apple', label: 'Real Cursive', group: 'Cursive', connected: true, xh: 0.85 },
  { id: 'cedarville', family: 'Cedarville Cursive', label: 'School Cursive', group: 'Cursive', connected: true, xh: 0.9 },
  { id: 'nothing', family: 'Nothing You Could Do', label: 'Messy Cursive', group: 'Cursive', connected: true, xh: 0.9 },
  { id: 'labelle', family: 'La Belle Aurore', label: 'Love Letter', group: 'Cursive', connected: true, xh: 0.9 },
  { id: 'dawning', family: 'Dawning of a New Day', label: 'Thin Cursive', group: 'Cursive', connected: true, xh: 0.95 },
  { id: 'zeyada', family: 'Zeyada', label: 'Doctor\u2019s Note', group: 'Cursive', connected: true, xh: 1.0 },
  { id: 'squarepeg', family: 'Square Peg', label: 'Loopy Casual', group: 'Cursive', connected: true, xh: 1.0 },
  { id: 'dancing', family: 'Dancing Script', label: 'Formal Script', group: 'Cursive', connected: true, xh: 0.95 },
  { id: 'sacramento', family: 'Sacramento', label: 'Monoline Script', group: 'Cursive', connected: true, xh: 0.95 },
  { id: 'delafield', family: 'Mrs Saint Delafield', label: 'Signature', group: 'Cursive', connected: true, xh: 0.9 },
];

export const FONT_GROUPS = ['Everyday', 'Neat print', 'Quick & messy', 'Cursive', 'Bold & marker', 'Your handwriting'];

const customFonts = new Map();

export function getFont(id) {
  return FONTS.find((f) => f.id === id) || customFonts.get(id) || FONTS[0];
}
export function listCustomFonts() { return [...customFonts.values()]; }

export async function registerCustomFont(name, buffer, connected = false) {
  const family = 'PW Custom ' + name.replace(/[^\w ]+/g, '').slice(0, 40);
  const face = new FontFace(family, buffer);
  await face.load();
  document.fonts.add(face);
  const id = 'custom:' + family;
  const entry = { id, family, label: name.replace(/\.(ttf|otf|woff2?)$/i, ''), group: 'Your handwriting', connected, xh: 1, custom: true };
  customFonts.set(id, entry);
  metricsCache.delete(family);
  glyphCache.delete(family);
  return entry;
}

const SAMPLE = 'The quick brown fox jumps over the lazy dog 0123456789 .,;:!?\'"()-';
export async function ensureFont(font) {
  await document.fonts.load(`40px "${font.family}"`, SAMPLE);
}
export async function ensureAllFonts(list = FONTS) {
  await Promise.all(list.map(ensureFont));
}

let mctx;
function measureCtx() {
  if (!mctx) mctx = document.createElement('canvas').getContext('2d');
  return mctx;
}

// Real glyph metrics of the font, measured at 100px. Used to normalise every
// style to the same x-height so switching fonts keeps text on the ruled lines.
const metricsCache = new Map();
export function fontMetrics(font) {
  if (metricsCache.has(font.family)) return metricsCache.get(font.family);
  const c = measureCtx();
  c.font = `100px "${font.family}"`;
  const x = c.measureText('xvwz');
  const H = c.measureText('HbdlkT');
  const g = c.measureText('gjpqy');
  const sp = c.measureText(' ');
  const m = {
    xh: Math.max(20, x.actualBoundingBoxAscent),
    asc: Math.max(40, H.actualBoundingBoxAscent),
    desc: Math.max(10, g.actualBoundingBoxDescent),
    space: Math.max(14, sp.width),
  };
  metricsCache.set(font.family, m);
  return m;
}

// Detect whether the font really has a glyph for ch (otherwise the browser would
// silently fall back to a system font, which instantly looks fake).
const glyphCache = new Map();
export function hasGlyph(family, ch) {
  let m = glyphCache.get(family);
  if (!m) { m = new Map(); glyphCache.set(family, m); }
  if (m.has(ch)) return m.get(ch);
  const c = measureCtx();
  c.font = `100px "${family}", monospace`;
  const a = c.measureText(ch).width;
  c.font = `100px "${family}", serif`;
  const b = c.measureText(ch).width;
  c.font = `100px monospace`;
  const mono = c.measureText(ch).width;
  const ok = Math.abs(a - b) < 0.01 && !(a === mono && a === 0);
  m.set(ch, ok);
  return ok;
}

const SUBS = {
  '\u2018': "'", '\u2019': "'", '\u201A': "'", '\u201B': "'", '\u2032': "'",
  '\u201C': '"', '\u201D': '"', '\u201E': '"', '\u2033': '"', '\u00AB': '"', '\u00BB': '"',
  '\u2013': '-', '\u2014': '-', '\u2015': '-', '\u2212': '-', '\u2010': '-', '\u2011': '-',
  '\u2026': '...', '\u2022': '-', '\u25CF': '-', '\u25E6': '-', '\u2023': '-', '\u2043': '-', '\u00B7': '.',
  '\u00A0': ' ', '\u2009': ' ', '\u200A': ' ', '\u202F': ' ', '\u2002': ' ', '\u2003': ' ',
  '\u2122': 'TM', '\u00A9': '(c)', '\u00AE': '(R)', '\u00D7': 'x', '\u2192': '->', '\u2190': '<-', '\u2264': '<=', '\u2265': '>=',
  '\u00BD': '1/2', '\u00BC': '1/4', '\u00BE': '3/4', '\u2713': 'v', '\u2714': 'v', '\u00B0': 'o',
};

export function sanitizeForFont(text, family) {
  let out = '';
  for (const ch of text) {
    if (ch === '\n' || ch === ' ' || ch === '\t') { out += ch; continue; }
    if (hasGlyph(family, ch)) { out += ch; continue; }
    if (SUBS[ch] !== undefined) {
      const s = SUBS[ch];
      out += [...s].every((c) => c === ' ' || hasGlyph(family, c)) ? s : '';
      continue;
    }
    const base = ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    if (base && base !== ch && [...base].every((c) => hasGlyph(family, c))) { out += base; continue; }
    if (/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\uFE0F\u200D]/u.test(ch)) continue; // emoji: people don't hand-draw those
    out += hasGlyph(family, '?') ? '' : '';
  }
  return out;
}
