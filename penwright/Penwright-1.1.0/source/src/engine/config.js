export const PENS = {
  ballpoint: { label: 'Ballpoint', desc: 'Oil ink, skips & blobs', thick: 0.04, alpha: 0.97, alphaVar: 0.12, grain: 'ballpoint', bleed: 0.12, blur: 0.03, grad: 0.8, blob: 0.035 },
  gel: { label: 'Gel pen', desc: 'Smooth, saturated line', thick: 0.12, alpha: 0.97, alphaVar: 0.05, grain: 'light', bleed: 0.3, blur: 0.05, grad: 0.9, blob: 0.01 },
  fountain: { label: 'Fountain pen', desc: 'Wet ink, shading & pooling', thick: 0.18, alpha: 0.92, alphaVar: 0.18, grain: 'none', bleed: 0.5, blur: 0.07, grad: 0.55, pool: 0.32, flow: true, blob: 0.02 },
  fineliner: { label: 'Fineliner', desc: 'Even technical line', thick: -0.12, alpha: 0.97, alphaVar: 0.03, grain: 'light', bleed: 0.15, blur: 0.03, grad: 0.95, blob: 0 },
  felt: { label: 'Felt tip', desc: 'Bold, soaks into paper', thick: 0.55, alpha: 0.93, alphaVar: 0.07, grain: 'felt', bleed: 0.55, blur: 0.1, grad: 0.85, pool: 0.15, blob: 0 },
  pencil: { label: 'Pencil (HB)', desc: 'Graphite on paper tooth', thick: -0.05, alpha: 0.78, alphaVar: 0.22, grain: 'pencil', bleed: 0, grad: 0.55, blob: 0, pencil: true },
};

export const INKS = [
  { id: 'blue', label: 'Bic blue', color: '#1d3a94' },
  { id: 'black', label: 'Black', color: '#1a1a1f' },
  { id: 'royal', label: 'Royal blue', color: '#2346b0' },
  { id: 'blueblack', label: 'Blue-black', color: '#1c2747' },
  { id: 'red', label: 'Teacher red', color: '#b5202b' },
  { id: 'green', label: 'Green', color: '#1d6a3c' },
  { id: 'purple', label: 'Purple', color: '#5b2a86' },
  { id: 'sepia', label: 'Sepia', color: '#5a3a1e' },
  { id: 'graphite', label: 'Graphite', color: '#3d3e42' },
];

export const FINISHES = {
  clean: { label: 'Digital', desc: 'Crisp page, no capture artefacts' },
  scan: { label: 'Scanned', desc: 'Flatbed scan: slight skew, lid shadow' },
  copy: { label: 'Photocopy', desc: 'B&W toner, speckles, dark edges' },
  photo: { label: 'Phone photo', desc: 'On a desk, perspective, light & shadow' },
};

export const SURFACES = {
  oak: 'Oak desk', walnut: 'Walnut table', white: 'White desk', slate: 'Dark slate', linen: 'Linen cloth', concrete: 'Concrete',
};

export const DATE_FORMATS = {
  us: 'Nov 9, 2026', num_us: '11/9/26', num_eu: '9/11/2026', long_eu: '9 November 2026', iso: '2026-11-09',
};

export function formatDate(d, fmt) {
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  switch (fmt) {
    case 'num_us': return `${m + 1}/${day}/${String(y).slice(2)}`;
    case 'num_eu': return `${day}/${m + 1}/${y}`;
    case 'long_eu': return `${day} ${M[m]} ${y}`;
    case 'iso': return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    default: return `${M[m].slice(0, 3)} ${day}, ${y}`;
  }
}

export const SAMPLE_TEXT = `# Notes on Handwriting

Handwriting is never perfectly even. Every letter leans a little differently, the baseline drifts, and the pen presses harder on some strokes than others.

That is exactly what Penwright reproduces: no two letters are ever drawn the same way, the ink pools and skips like a real pen, and the text settles onto the ruled lines the way a person would write it.

- Import a Word, PDF or text file
- Pick a hand, a pen and a paper
- Export as PDF or PNG in print quality

Try pressing **Re-roll** to write the same page again with a different hand day.`;

export const DEFAULTS = {
  text: SAMPLE_TEXT,
  font: 'caveat',
  size: 1,
  slant: 0,
  letterSpacing: 0,
  wordSpacing: 1,
  pen: 'ballpoint',
  ink: '#1d3a94',
  thickness: 1,
  paper: 'college',
  pageSize: 'letter',
  torn: false,
  lineSkip: 1,
  lineSpacing: 9,
  gridRows: 1,
  natural: 0.6,
  baseline: 1,
  jitter: 1,
  sizeVar: 1,
  lineSlope: 1,
  marginDrift: 1,
  pressure: 1,
  warp: 1,
  mistakes: 0.25,
  smudges: true,
  fatigue: true,
  indent: true,
  rightRag: 1,
  headerName: '',
  headerDate: '',
  headerSubject: '',
  headerClass: '',
  headerTitle: '',
  pageNumbers: true,
  finish: 'clean',
  surface: 'oak',
  light: 0.6,
  tilt: 0.5,
  handShadow: false,
  seed: 20261109,
};

export const PRESETS = [
  { id: 'school', label: 'School notes', set: { font: 'kalam', pen: 'ballpoint', ink: '#1d3a94', paper: 'college', pageSize: 'letter', natural: 0.6, mistakes: 0.25, finish: 'clean', torn: false } },
  { id: 'assignment', label: 'Homework sheet', set: { font: 'patrick', pen: 'ballpoint', ink: '#1a1a1f', paper: 'exam', pageSize: 'a4', natural: 0.5, mistakes: 0.15, finish: 'scan' } },
  { id: 'letter', label: 'Love letter', set: { font: 'labelle', pen: 'fountain', ink: '#1c2747', paper: 'cream', pageSize: 'a5', natural: 0.55, mistakes: 0.05, finish: 'photo', surface: 'walnut' } },
  { id: 'journal', label: 'Bullet journal', set: { font: 'caveat', pen: 'fineliner', ink: '#1a1a1f', paper: 'dots', pageSize: 'a5', natural: 0.5, mistakes: 0.1, finish: 'photo', surface: 'linen' } },
  { id: 'legal', label: 'Legal pad memo', set: { font: 'justme', pen: 'gel', ink: '#1a1a1f', paper: 'legal', pageSize: 'legal', natural: 0.7, mistakes: 0.3, finish: 'photo', surface: 'oak' } },
  { id: 'doctor', label: 'Doctor\u2019s scrawl', set: { font: 'zeyada', pen: 'ballpoint', ink: '#1d3a94', paper: 'printer', pageSize: 'letter', natural: 0.95, mistakes: 0.2, finish: 'scan' } },
  { id: 'flash', label: 'Flashcard', set: { font: 'architect', pen: 'felt', ink: '#1a1a1f', paper: 'card', pageSize: 'card', natural: 0.5, mistakes: 0, finish: 'photo', surface: 'white' } },
  { id: 'old', label: 'Old letter', set: { font: 'homemade', pen: 'fountain', ink: '#5a3a1e', paper: 'aged', pageSize: 'a4', natural: 0.65, mistakes: 0.1, finish: 'photo', surface: 'walnut' } },
  { id: 'sticky', label: 'Sticky reminder', set: { font: 'reenie', pen: 'felt', ink: '#1a1a1f', paper: 'sticky', pageSize: 'sticky', natural: 0.7, mistakes: 0.1, finish: 'photo', surface: 'white' } },
  { id: 'pencil', label: 'Pencil draft', set: { font: 'shadows', pen: 'pencil', ink: '#3d3e42', paper: 'wide', pageSize: 'letter', natural: 0.65, mistakes: 0.4, finish: 'clean' } },
];
