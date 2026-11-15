import '../styles/base.css';
import '../styles/home.css';
import { DEFAULTS, PRESETS, PENS, prepare, renderFinal, getFont, ensureFont } from '../engine/index.js';
import { registerSW, setupInstall } from '../pwa.js';

registerSW();
setupInstall(document.getElementById('installBtn'));

const $ = (s) => document.querySelector(s);

async function paint(target, cfgIn, dpi, page = 0) {
  const { cfg, doc } = await prepare({ ...DEFAULTS, pageNumbers: false, headerName: '', headerDate: '', headerTitle: '', ...cfgIn });
  const c = renderFinal(doc, cfg, Math.min(page, doc.pages.length - 1), dpi);
  target.width = c.width; target.height = c.height;
  target.getContext('2d').drawImage(c, 0, 0);
  target.classList.add('ready');
  return target;
}
const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 300 }) : setTimeout(r, 30)));

const dpr = Math.min(2, window.devicePixelRatio || 1);

/* ---------- hero ---------- */
const HERO_LETTER = `Dear Sam,

I found the old photos from the lake house last weekend and laughed until I cried. Do you remember the canoe? I still can't believe we made it back before the storm.

Come visit in the spring. I'll make the lemon cake, and we can walk the long way round the reservoir like we used to.

With love,
Ellie`;

async function hero() {
  await paint($('#heroMain'), { text: HERO_LETTER, font: 'homemade', pen: 'fountain', ink: '#16224a', paper: 'cream', pageSize: 'a5', natural: 0.55, mistakes: 0.08, finish: 'photo', surface: 'walnut', tilt: 0.45, light: 0.65, seed: 7311, indent: false }, 120 * dpr * 0.75);
  await idle();
  await paint($('#heroNote'), { text: 'Call mom back!!\nPick up dry cleaning\nmilk, eggs, basil', font: 'reenie', pen: 'felt', ink: '#1a1a1f', paper: 'sticky', pageSize: 'sticky', size: 1.15, natural: 0.7, mistakes: 0, finish: 'clean', seed: 42, indent: false, smudges: false }, 150 * dpr);
  await idle();
  await paint($('#heroCard'), { text: '# Mitochondria\n- Powerhouse of the cell\n- Makes ATP (cellular respiration)\n- Has its own DNA!', font: 'architect', pen: 'gel', ink: '#1a1a1f', paper: 'card', pageSize: 'card', size: 1.45, natural: 0.5, mistakes: 0, finish: 'clean', seed: 9, indent: false }, 130 * dpr);
}

/* ---------- live try ---------- */
const TRY_FONTS = [['caveat', 'Everyday'], ['kalam', 'Student'], ['indie', 'Rounded'], ['homemade', 'Cursive'], ['labelle', 'Elegant'], ['reenie', 'Scribble'], ['architect', 'Caps']];
const TRY_PENS = ['ballpoint', 'gel', 'fountain', 'felt', 'pencil'];
const TRY_PAPERS = [['card', 'Index card', 'card'], ['sticky', 'Sticky note', 'sticky'], ['college', 'Notebook', 'a5'], ['cream', 'Stationery', 'a5']];
const INK_FOR = { ballpoint: '#1d3a94', gel: '#1a1a1f', fountain: '#1c2747', felt: '#1a1a1f', pencil: '#3d3e42' };
const tryState = { font: 'caveat', pen: 'ballpoint', paper: 'card', seed: 11 };

function chips(host, items, key, label = (x) => x) {
  host.innerHTML = '';
  for (const it of items) {
    const id = Array.isArray(it) ? it[0] : it;
    const b = document.createElement('button');
    b.className = 'chip' + (tryState[key] === id ? ' on' : '');
    b.textContent = Array.isArray(it) ? it[1] : label(it);
    if (key === 'font') b.style.fontFamily = `'${getFont(id).family}', cursive`;
    b.onclick = () => { tryState[key] = id; chips(host, items, key, label); scheduleTry(0); };
    host.append(b);
  }
}
let tryT, tryBusy = false, tryAgain = false;
function scheduleTry(d = 180) { clearTimeout(tryT); tryT = setTimeout(runTry, d); }
async function runTry() {
  if (tryBusy) { tryAgain = true; return; }
  tryBusy = true;
  const text = $('#tryText').value.trim() || 'Write something here…';
  const pp = TRY_PAPERS.find((p) => p[0] === tryState.paper);
  const blank = pp[0] === 'college' || pp[0] === 'cream';
  try {
    await paint($('#tryCanvas'), { text, font: tryState.font, pen: tryState.pen, ink: INK_FOR[tryState.pen], paper: pp[0], pageSize: pp[2], natural: 0.6, mistakes: 0.1, finish: 'clean', seed: tryState.seed, indent: false, smudges: blank, fatigue: blank }, (pp[0] === 'sticky' ? 170 : pp[0] === 'card' ? 150 : 95) * dpr);
  } catch (e) { console.error(e); }
  const q = new URLSearchParams({ text });
  $('#tryOpen').href = './studio.html?' + q.toString();
  tryBusy = false;
  if (tryAgain) { tryAgain = false; runTry(); }
}
function setupTry() {
  chips($('#tryFonts'), TRY_FONTS, 'font');
  chips($('#tryPens'), TRY_PENS, 'pen', (p) => PENS[p].label.replace(' (HB)', ''));
  chips($('#tryPapers'), TRY_PAPERS, 'paper');
  $('#tryText').addEventListener('input', () => scheduleTry());
  $('#tryReroll').onclick = () => { tryState.seed = (Math.random() * 1e6) | 0; scheduleTry(0); };
  return runTry();
}

/* ---------- comparison ---------- */
const CMP_TEXT = `Meeting notes - Tuesday

Budget review moved to Friday at 10am. Anna will bring the revised numbers and the vendor quotes. Need to confirm the room booking and order lunch for twelve people.`;
const FLAT = { natural: 0, baseline: 0, jitter: 0, sizeVar: 0, lineSlope: 0, marginDrift: 0, warp: 0, pressure: 0, rightRag: 0, mistakes: 0, smudges: false, fatigue: false };
async function compare() {
  const base = { text: CMP_TEXT, size: 1.2, font: 'kalam', pen: 'ballpoint', ink: '#1d3a94', paper: 'a4lined', pageSize: 'a5', finish: 'clean', seed: 515, indent: false };
  await paint($('#cmpFont'), { ...base, ...FLAT, pen: 'fineliner' }, 150 * dpr);
  await idle();
  await paint($('#cmpReal'), { ...base, natural: 0.75, mistakes: 0.3 }, 150 * dpr);
}

/* ---------- gallery ---------- */
const GALLERY = [
  ['school', 'Biology — Ch. 4\n\n# Photosynthesis\n- Happens in the chloroplasts\n- Light reactions make ATP + NADPH\n- Calvin cycle fixes CO2 into sugar\n\nRemember: 6CO2 + 6H2O -> C6H12O6 + 6O2'],
  ['letter', 'My dearest Jo,\n\nThe garden is full of roses again and every one of them reminds me of you. Write soon and tell me everything.\n\nAlways yours,\nM.'],
  ['journal', '# Monday\n- [x] Morning run, 5k\n- [x] Reply to Priya\n- [ ] Book dentist\n- [ ] Finish chapter 7\n\nGrateful for: sunshine, good coffee, quiet evenings.'],
  ['legal', 'Client call - Hart & Co.\n\n- Wants delivery moved up to the 14th\n- OK with revised pricing\n- Send contract draft by Thursday\n- Follow up with legal re: clause 9'],
  ['old', 'London, 3rd of May\n\nMy dear brother,\n\nThe crossing was rough but we arrived safely. The city is louder than I imagined, and I miss the quiet of home terribly.'],
  ['pencil', 'Essay draft - intro\n\nThe industrial revolution changed not only how people worked, but how they thought about time itself. Clocks became'],
  ['flash', '# Mitosis\nProphase, metaphase, anaphase, telophase'],
  ['doctor', 'Rx: Amoxicillin 500mg\nTake 1 capsule three times daily for 7 days.\nRefills: 0'],
];
async function gallery() {
  const host = $('#gallery');
  const jobs = [];
  for (const [id, text] of GALLERY) {
    const p = PRESETS.find((x) => x.id === id);
    const a = document.createElement('a');
    a.className = 'g-item';
    a.href = './studio.html?preset=' + id;
    const frame = document.createElement('div'); frame.className = 'g-frame';
    const cv = document.createElement('canvas'); frame.append(cv);
    const cap = document.createElement('div'); cap.className = 'g-cap';
    cap.innerHTML = `<b>${p.label}</b><span>${PENS[p.set.pen].label} · ${getFont(p.set.font).label}</span>`;
    a.append(frame, cap); host.append(a);
    const small = p.set.pageSize === 'card' || p.set.pageSize === 'sticky';
    if (small) frame.classList.add('small');
    jobs.push({ cv, cfg: { ...p.set, text, size: small ? 1.3 : 1.25, seed: 1000 + jobs.length * 77, indent: false } });
  }
  const io = new IntersectionObserver(async (ents) => {
    if (!ents.some((e) => e.isIntersecting)) return;
    io.disconnect();
    for (const j of jobs) { await paint(j.cv, j.cfg, (j.cfg.pageSize === 'card' || j.cfg.pageSize === 'sticky' ? 120 : 85) * dpr); await idle(); }
  }, { rootMargin: '400px' });
  io.observe(host);
}

async function cta() {
  const io = new IntersectionObserver(async (e) => {
    if (!e[0].isIntersecting) return; io.disconnect();
    await paint($('#ctaCanvas'), { text: 'Dear reader,\n\nThanks for scrolling all the way down. Now go write something wonderful.\n\n- P.', font: 'nothing', pen: 'gel', ink: '#1d3a94', paper: 'a4lined', pageSize: 'a5', size: 1.25, natural: 0.6, mistakes: 0, finish: 'photo', surface: 'oak', tilt: 0.6, seed: 88, indent: false }, 80 * dpr);
  }, { rootMargin: '300px' });
  io.observe($('#ctaCanvas'));
}

window.addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 8), { passive: true });

(async () => {
  await ensureFont(getFont('caveat'));
  await hero();
  await setupTry();
  gallery();
  cta();
  await compare();
  window.__home = true;
})();
