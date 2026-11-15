import '../styles/base.css';
import '../styles/studio.css';
import {
  DEFAULTS, PRESETS, PENS, INKS, FINISHES, SURFACES, DATE_FORMATS, formatDate,
  FONTS, FONT_GROUPS, listCustomFonts, registerCustomFont, getFont, ensureFont,
  PAPERS, PAGE_SIZES, getPaper, prepare, renderFinal,
} from '../engine/index.js';
import { importFile, ACCEPT } from './importers.js';
import { exportDocument, copyPage, printDocument } from './exporters.js';
import { idbGet, idbSet } from './store.js';
import { registerSW, setupInstall, APP_VERSION } from '../pwa.js';

const $ = (s, r = document) => r.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};

const LS_KEY = 'penwright.cfg.v1';
let cfg = loadCfg();
const assets = { paperImage: null };
let zoom = matchMedia('(max-width: 900px)').matches ? null : +(localStorage.getItem('penwright.zoom') || 0) || null;
let curPage = 0, pageCount = 1, canvases = [], renderToken = 0;

function loadCfg() {
  const q = new URLSearchParams(location.search);
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch {}
  const c = { ...DEFAULTS, ...saved };
  const p = q.get('preset') && PRESETS.find((x) => x.id === q.get('preset'));
  if (p) Object.assign(c, p.set, { seed: (Math.random() * 1e9) | 0 });
  if (q.get('text')) c.text = q.get('text');
  if (!getPaper(c.paper) || c.paper === 'custom') c.paper = DEFAULTS.paper;
  return c;
}
const save = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(cfg)); } catch {} };

/* ---------------- tabs ---------------- */
const TABS = [
  { id: 'write', label: 'Write', icon: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4' },
  { id: 'hand', label: 'Hand', icon: 'M5 17c3-1 4-8 7-8s1 7 4 7 3-9 5-9' },
  { id: 'pen', label: 'Pen', icon: 'M15 4l5 5-11 11H4v-5zM13 6l5 5' },
  { id: 'paper', label: 'Paper', icon: 'M6 3h9l4 4v14H6zM9 10h7M9 14h7M9 18h4' },
  { id: 'real', label: 'Realism', icon: 'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z' },
  { id: 'finish', label: 'Finish', icon: 'M4 7h3l2-3h6l2 3h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
];
let activeTab = localStorage.getItem('penwright.tab') || 'write';
let panelMode = localStorage.getItem('penwright.panel') || 'normal'; // 'min' | 'normal' | 'wide'
let panelW = +localStorage.getItem('penwright.panelW') || 0;
const wcText = (t) => `${(t.match(/\S+/g) || []).length} words · ${t.length} characters`;

function setPanel(mode) {
  panelMode = mode;
  localStorage.setItem('penwright.panel', mode);
  applyPanel();
  buildTabs();
}
function applyPanel() {
  const p = $('#panel');
  p.classList.toggle('min', panelMode === 'min');
  p.classList.toggle('wide', panelMode === 'wide');
  p.style.setProperty('--panel-w', panelMode === 'wide' ? 'min(860px, 60vw)' : (panelW || 384) + 'px');
}
function setupResize() {
  const p = $('#panel');
  const grip = h('div', { class: 'panel-resize', role: 'separator', 'aria-orientation': 'vertical', 'aria-label': 'Resize panel', title: 'Drag to resize · double-click to reset' });
  p.append(grip);
  grip.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    grip.setPointerCapture(e.pointerId);
    document.body.classList.add('resizing');
    const left = p.getBoundingClientRect().left;
    let moved = false;
    const move = (ev) => {
      moved = true;
      panelW = Math.round(Math.max(320, Math.min(innerWidth * 0.72, ev.clientX - left)));
      p.classList.remove('wide');
      p.style.setProperty('--panel-w', panelW + 'px');
    };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      document.body.classList.remove('resizing');
      if (moved) { localStorage.setItem('penwright.panelW', panelW); setPanel('normal'); }
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
  });
  grip.addEventListener('dblclick', () => { panelW = 0; localStorage.removeItem('penwright.panelW'); setPanel('normal'); });
}

function openEditor() {
  let d = $('#editorDlg');
  if (!d) {
    const wc = h('small', { id: 'edWc', class: 'muted' });
    const ta = h('textarea', { id: 'edText', spellcheck: 'true', 'aria-label': 'Your text',
      placeholder: 'Paste your whole document here…\n\n# Headings, - bullets, **bold** and _underline_ are understood.',
      oninput: (e) => { set({ text: e.target.value }, { delay: 500 }); wc.textContent = wcText(e.target.value); } });
    d = h('dialog', { id: 'editorDlg', class: 'dialog editor-dlg' },
      h('div', { class: 'ed-head' }, h('h2', {}, 'Your text'), wc,
        h('button', { class: 'btn ghost', onclick: () => $('#fileInput').click() }, 'Import file'),
        h('button', { class: 'btn primary', onclick: () => d.close() }, 'Done')),
      ta);
    d.addEventListener('close', () => { if (activeTab === 'write') buildBody(); });
    document.body.append(d);
  }
  $('#edText').value = cfg.text;
  $('#edWc').textContent = wcText(cfg.text);
  d.showModal();
  $('#edText').focus();
}

function icon(d) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d); s.append(p); return s;
}

function buildTabs() {
  const nav = $('#tabs'); nav.innerHTML = '';
  for (const t of TABS) {
    nav.append(h('button', { role: 'tab', class: 'tab' + (t.id === activeTab ? ' on' : ''), 'aria-selected': String(t.id === activeTab), title: t.id === activeTab && panelMode !== 'min' ? 'Click again to hide the panel' : t.label,
      onclick: () => {
        if (t.id === activeTab && panelMode !== 'min') return setPanel('min');
        activeTab = t.id; localStorage.setItem('penwright.tab', t.id);
        if (panelMode === 'min') setPanel('normal'); else buildTabs();
        buildBody();
      } }, icon(t.icon), h('span', {}, t.label)));
  }
  const wide = panelMode === 'wide', min = panelMode === 'min';
  nav.append(h('div', { class: 'rail-foot' },
    h('button', { class: 'tab rail-btn widen', title: wide ? 'Back to normal width' : 'Make the panel wider (more room for your text)', onclick: () => setPanel(wide ? 'normal' : 'wide') },
      icon(wide ? 'M4 12h6M7 9l3 3-3 3M20 12h-6M17 9l-3 3 3 3' : 'M3 12h7M6 9l-3 3 3 3M21 12h-7M18 9l3 3-3 3'), h('span', {}, wide ? 'Narrow' : 'Widen')),
    h('button', { class: 'tab rail-btn collapse', 'aria-expanded': String(!min), title: (min ? 'Show' : 'Hide') + ' the panel (Ctrl+B)', onclick: () => setPanel(min ? 'normal' : 'min') },
      icon(min ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'), h('span', {}, min ? 'Show' : 'Hide')),
    h('small', { class: 'ver', title: 'Penwright version' }, 'v' + APP_VERSION)));
}

/* ---------------- control helpers ---------------- */
function set(patch, opts = {}) {
  Object.assign(cfg, patch);
  save();
  if (opts.rebuild) buildBody();
  schedule(opts.delay ?? 140);
}
const section = (title, ...kids) => h('section', { class: 'sec' }, title ? h('h3', {}, title) : null, ...kids);
const hint = (t) => h('p', { class: 'hint' }, t);

function slider(label, key, min, max, step, fmt = (v) => v, tip) {
  const out = h('output', {}, fmt(cfg[key]));
  const inp = h('input', { type: 'range', min, max, step, value: cfg[key], 'aria-label': label,
    oninput: (e) => { out.textContent = fmt(+e.target.value); set({ [key]: +e.target.value }, { delay: 220 }); } });
  inp.addEventListener('dblclick', () => { inp.value = DEFAULTS[key]; out.textContent = fmt(DEFAULTS[key]); set({ [key]: DEFAULTS[key] }); });
  return h('label', { class: 'slider', title: (tip ? tip + ' · ' : '') + 'double-click to reset' }, h('span', { class: 'sl-head' }, h('span', {}, label), out), inp);
}
function toggle(label, key, desc) {
  return h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: !!cfg[key], onchange: (e) => set({ [key]: e.target.checked }) }), h('i'), h('span', {}, h('b', {}, label), desc ? h('small', {}, desc) : null));
}
function select(label, key, options, onchange) {
  const s = h('select', { onchange: (e) => (onchange ? onchange(e.target.value) : set({ [key]: e.target.value })) },
    options.map(([v, t]) => h('option', { value: v, selected: String(cfg[key]) === String(v) }, t)));
  return h('label', { class: 'field' }, h('span', {}, label), s);
}
function text(label, key, ph, attrs = {}) {
  return h('label', { class: 'field' }, h('span', {}, label), h('input', { type: 'text', value: cfg[key] || '', placeholder: ph, ...attrs, oninput: (e) => set({ [key]: e.target.value }, { delay: 350 }) }));
}
const pct = (v) => Math.round(v * 100) + '%';
const mult = (v) => (v === 1 ? 'normal' : v.toFixed(2) + '×');

/* ---------------- panels ---------------- */
const PANELS = {
  write() {
    const ta = h('textarea', { id: 'textIn', spellcheck: 'true', placeholder: 'Type or paste your text here…\n\n# Headings, - bullets, **bold** and _underline_ are understood.', oninput: (e) => { set({ text: e.target.value }, { delay: 380 }); $('#wc').textContent = wcText(e.target.value); } });
    ta.value = cfg.text;
    const drop = h('button', { class: 'dropzone', onclick: () => $('#fileInput').click() },
      h('b', {}, 'Import a document'), h('span', {}, 'Word .docx · PDF · .txt · Markdown · .odt · .rtf · .html'), h('small', {}, 'or drag & drop anywhere — files never leave your device'));
    const dateSel = h('select', { onchange: (e) => { const v = e.target.value; set({ headerDate: v === 'custom' ? formatDate(new Date(), 'us') : v }, { rebuild: true }); } },
      h('option', { value: '' }, 'No date'),
      Object.entries(DATE_FORMATS).map(([k]) => h('option', { value: '@' + k, selected: cfg.headerDate === '@' + k }, 'Today · ' + formatDate(new Date(), k))),
      h('option', { value: 'custom', selected: !!cfg.headerDate && !cfg.headerDate.startsWith('@') }, 'Custom…'));
    const exam = getPaper(cfg.paper).exam;
    return [
      section(null, drop),
      section('Your text', ta, h('div', { class: 'row-between' }, h('small', { id: 'wc', class: 'muted' }, wcText(cfg.text)),
        h('div', { class: 'mini-actions' },
          h('button', { class: 'link', title: 'Open a big editor for long documents', onclick: openEditor }, 'Full editor'),
          h('button', { class: 'link', onclick: () => { cfg.text = DEFAULTS.text; save(); buildBody(); schedule(0); } }, 'Sample'),
          h('button', { class: 'link', onclick: () => { cfg.text = ''; save(); buildBody(); schedule(0); $('#textIn').focus(); } }, 'Clear')))),
      section('Page header',
        hint(exam ? 'Fills the printed boxes at the top of the assignment sheet.' : 'Written on the top line, like you would on real notebook paper.'),
        h('div', { class: 'row2' }, text('Name', 'headerName', 'e.g. Maya Ortiz', { autocomplete: 'name' }), h('label', { class: 'field' }, h('span', {}, 'Date'), dateSel)),
        cfg.headerDate && !cfg.headerDate.startsWith('@') ? text('Custom date', 'headerDate', 'e.g. March 3rd') : null,
        exam ? h('div', { class: 'row2' }, text('Subject', 'headerSubject', 'e.g. Biology'), text('Class / Period', 'headerClass', 'e.g. 3B')) : null,
        text('Title (centered)', 'headerTitle', 'e.g. Chapter 4 Summary'),
        toggle('Page numbers', 'pageNumbers', 'Small number in the corner of each page'),
      ),
    ];
  },
  hand() {
    const all = [...FONTS, ...listCustomFonts()];
    const groups = FONT_GROUPS.map((g) => [g, all.filter((f) => f.group === g)]).filter(([, l]) => l.length);
    return [
      section('Handwriting', h('div', { class: 'font-list' }, groups.map(([g, list]) => [
        h('div', { class: 'group-label' }, g),
        list.map((f) => h('button', { class: 'font-card' + (cfg.font === f.id ? ' on' : ''), onclick: () => set({ font: f.id }, { rebuild: true, delay: 0 }) },
          h('span', { class: 'fs', style: { fontFamily: `'${f.family}', cursive` } }, 'The quick brown fox jumps'),
          h('small', {}, f.label, f.connected ? ' · joined' : ''))),
      ]))),
      section('Use your own handwriting',
        hint('Turn your handwriting into a font (e.g. free at calligraphr.com), then upload the .ttf / .otf / .woff here. Stays on this device.'),
        h('label', { class: 'btn ghost block' }, 'Upload font file…', h('input', { type: 'file', accept: '.ttf,.otf,.woff,.woff2', hidden: true, onchange: onFontUpload })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', id: 'fontJoined' }), ' My handwriting is joined-up cursive')),
      section('Shape',
        slider('Size', 'size', 0.7, 1.45, 0.01, mult),
        slider('Slant', 'slant', -12, 18, 0.5, (v) => (v > 0 ? '+' : '') + v + '°', 'Right-handed writers usually lean forward'),
        slider('Letter spacing', 'letterSpacing', -0.1, 0.25, 0.005, (v) => (v === 0 ? 'normal' : (v > 0 ? '+' : '') + v.toFixed(2))),
        slider('Word spacing', 'wordSpacing', 0.6, 2, 0.02, mult)),
    ];
  },
  pen() {
    return [
      section('Pen', h('div', { class: 'cards cols2' }, Object.entries(PENS).map(([id, p]) =>
        h('button', { class: 'card' + (cfg.pen === id ? ' on' : ''), onclick: () => set({ pen: id, ...(id === 'pencil' && !cfg.ink.match(/3d3e42/i) ? { ink: '#3d3e42' } : {}) }, { rebuild: true, delay: 0 }) },
          h('span', { class: 'pen-swatch ' + id }), h('b', {}, p.label), h('small', {}, p.desc))))),
      section('Ink colour', h('div', { class: 'swatches' },
        INKS.map((k) => h('button', { class: 'sw' + (cfg.ink.toLowerCase() === k.color ? ' on' : ''), title: k.label, style: { background: k.color }, onclick: () => set({ ink: k.color }, { rebuild: true, delay: 0 }) })),
        h('label', { class: 'sw custom', title: 'Any colour' }, h('input', { type: 'color', value: cfg.ink, oninput: (e) => set({ ink: e.target.value }, { delay: 250 }) }))),
        h('small', { class: 'muted' }, (INKS.find((k) => k.color === cfg.ink.toLowerCase()) || { label: 'Custom ' + cfg.ink }).label)),
      section('Stroke', slider('Pen thickness', 'thickness', 0.5, 2, 0.02, mult), slider('Pressure variation', 'pressure', 0, 2, 0.02, mult, 'How much the ink darkness changes stroke to stroke')),
    ];
  },
  paper() {
    const p = getPaper(cfg.paper);
    return [
      section('Paper', h('div', { class: 'cards cols2' }, PAPERS.map((pp) =>
        h('button', { class: 'card paper-card' + (cfg.paper === pp.id ? ' on' : ''), onclick: () => pickPaper(pp) },
          h('span', { class: 'paper-thumb ' + pp.id, style: { background: pp.bg } }), h('b', {}, pp.label), h('small', {}, pp.desc))))),
      p.custom ? section('Your paper image',
        hint('Upload a straight-on photo or scan of blank paper. The text is written on top of it.'),
        h('label', { class: 'btn ghost block' }, assets.paperImage ? 'Replace image…' : 'Upload image…', h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: onPaperUpload })),
      ) : null,
      section('Format',
        select('Page size', 'pageSize', p.sizes.map((s) => [s, PAGE_SIZES[s].label])),
        p.blank ? slider('Line height', 'lineSpacing', 6, 14, 0.25, (v) => v + ' mm') : null,
        p.rule ? select('Write on', 'lineSkip', [[1, 'Every line'], [2, 'Every other line (double spaced)']], (v) => set({ lineSkip: +v })) : null,
        p.grid || p.dots ? select('Rows per line', 'gridRows', [[1, '1 square'], [2, '2 squares'], [3, '3 squares']], (v) => set({ gridRows: +v })) : null,
        p.holes || p.rule ? toggle('Torn from a spiral notebook', 'torn', 'Ragged left edge with perforation') : null),
    ];
  },
  real() {
    return [
      section('Overall',
        slider('Natural variation', 'natural', 0, 1, 0.01, (v) => (v < 0.2 ? 'very neat ' : v < 0.45 ? 'neat ' : v < 0.7 ? 'natural ' : v < 0.88 ? 'hurried ' : 'messy ') + pct(v), 'Master control for how human the writing looks'),
        slider('Mistakes & cross-outs', 'mistakes', 0, 1, 0.01, (v) => (v === 0 ? 'none' : pct(v)), 'Occasional misspelt word scribbled out and rewritten'),
        h('div', { class: 'toggles' },
          toggle('Ink smudges', 'smudges', 'Faint palm smears & stray marks'),
          toggle('Hand fatigue', 'fatigue', 'Writing gets slightly bigger & looser down the page'),
          toggle('Indent paragraphs', 'indent', 'First line of each paragraph indented'))),
      section('Fine tuning',
        slider('Baseline wobble', 'baseline', 0, 2.5, 0.02, mult, 'Letters bounce above/below the line'),
        slider('Letter jitter', 'jitter', 0, 2.5, 0.02, mult, 'Rotation & position noise per letter'),
        slider('Size variation', 'sizeVar', 0, 2.5, 0.02, mult),
        slider('Line slope', 'lineSlope', 0, 2.5, 0.02, mult, 'Lines drift up or down when written freehand'),
        slider('Margin drift', 'marginDrift', 0, 2.5, 0.02, mult, 'Left edge of each line wanders'),
        slider('Glyph warp', 'warp', 0, 2.5, 0.02, mult, 'Every letter drawn slightly differently'),
        slider('Ragged right edge', 'rightRag', 0, 2, 0.02, mult, 'People stop writing before the margin at different points')),
      section('Hand day',
        hint('The seed decides every random choice. Same seed → identical page; re-roll for a fresh one.'),
        h('div', { class: 'row-between' }, h('code', { class: 'seed' }, '#' + cfg.seed), h('button', { class: 'btn ghost', onclick: reroll }, 'Re-roll'))),
    ];
  },
  finish() {
    return [
      section('Look', h('div', { class: 'cards cols2' }, Object.entries(FINISHES).map(([id, f]) =>
        h('button', { class: 'card' + (cfg.finish === id ? ' on' : ''), onclick: () => set({ finish: id }, { rebuild: true, delay: 0 }) },
          h('span', { class: 'finish-thumb ' + id }), h('b', {}, f.label), h('small', {}, f.desc))))),
      cfg.finish === 'photo' ? section('Photo',
        select('Surface', 'surface', Object.entries(SURFACES)),
        slider('Light', 'light', 0, 1, 0.01, pct, 'Brightness falloff from the window side'),
        slider('Camera angle', 'tilt', 0, 1, 0.01, pct, 'Perspective of a hand-held phone shot'),
        toggle('Hand shadow', 'handShadow', 'Soft shadow from the person holding the phone')) : null,
      cfg.finish === 'scan' || cfg.finish === 'copy' ? section(null, slider('Skew', 'tilt', 0, 1, 0.01, pct, 'Page placed slightly crooked on the glass')) : null,
      section(null, hint('Tip: “Digital” is best for printing on real paper; “Phone photo” and “Scanned” look like a picture of a handwritten page.')),
    ];
  },
};

function buildBody() {
  const body = $('#tabBody');
  const st = body.scrollTop;
  body.innerHTML = '';
  body.append(...PANELS[activeTab]().flat(Infinity).filter(Boolean));
  body.scrollTop = st;
}

function pickPaper(pp) {
  const patch = { paper: pp.id };
  if (!pp.sizes.includes(cfg.pageSize)) patch.pageSize = pp.size;
  set(patch, { rebuild: true, delay: 0 });
  if (pp.custom && !assets.paperImage) setTimeout(() => $('#tabBody input[type=file]')?.click(), 50);
}

/* ---------------- preview rendering ---------------- */
let timer;
function schedule(delay = 140) { clearTimeout(timer); timer = setTimeout(render, delay); }

const previewDpi = () => Math.min(170, Math.round(96 * Math.min(2, devicePixelRatio || 1) * (zoom || 1) * 1.05));

async function render() {
  const token = ++renderToken;
  setStatus('Writing…', true);
  const t0 = performance.now();
  try {
    const { cfg: c, doc } = await prepare(cfg);
    if (token !== renderToken) return;
    pageCount = doc.pages.length;
    curPage = Math.min(curPage, pageCount - 1);
    const host = $('#pages');
    while (host.children.length > pageCount) host.lastChild.remove();
    const dpi = previewDpi();
    const order = [curPage, ...[...Array(pageCount).keys()].filter((i) => i !== curPage)];
    for (const i of order) {
      if (token !== renderToken) return;
      const cv = renderFinal(doc, c, i, dpi, assets);
      canvases[i] = cv;
      let wrap = host.children[i];
      if (!wrap) { wrap = h('div', { class: 'page' }); host.append(wrap); }
      cv.dataset.mmw = cv.width / (dpi / 25.4);
      wrap.replaceChildren(cv, h('span', { class: 'page-no' }, `${i + 1}`));
      sizePage(wrap);
      await new Promise((r) => setTimeout(r, 0));
    }
    canvases.length = pageCount;
    updatePager();
    const ms = Math.round(performance.now() - t0);
    const words = (cfg.text.match(/\S+/g) || []).length;
    setStatus(`${pageCount} page${pageCount > 1 ? 's' : ''} · ${words} words · ${ms} ms`);
  } catch (e) {
    console.error(e);
    setStatus('Render error: ' + e.message);
  }
}

function fitZoom() {
  const st = $('#stage');
  const cv = canvases[0];
  const mmw = cv ? +cv.dataset.mmw : 216;
  const cssPerMm = 96 / 25.4;
  return Math.max(0.25, Math.min(2.5, (st.clientWidth - 64) / (mmw * cssPerMm)));
}
function sizePage(wrap) {
  const cv = wrap.firstChild;
  const z = zoom || fitZoom();
  cv.style.width = (+cv.dataset.mmw * (96 / 25.4) * z) + 'px';
}
function applyZoom() {
  $('#zoomVal').textContent = Math.round((zoom || fitZoom()) * 100) + '%';
  $('#zoomFit').classList.toggle('on', !zoom);
  for (const w of $('#pages').children) sizePage(w);
  localStorage.setItem('penwright.zoom', zoom || '');
}
function stepZoom(d) {
  const z = zoom || fitZoom();
  const steps = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5];
  const i = steps.findIndex((s) => s >= z - 0.001);
  zoom = steps[Math.max(0, Math.min(steps.length - 1, (d > 0 ? (steps[i] > z + 0.001 ? i : i + 1) : i - 1)))];
  applyZoom();
  if (previewDpi() > (canvases[0]?.width / (+canvases[0]?.dataset.mmw / 25.4) || 0) + 20) schedule(250);
}

function updatePager() {
  $('#pageInfo').textContent = `Page ${curPage + 1} / ${pageCount}`;
  $('#prevPage').disabled = curPage <= 0;
  $('#nextPage').disabled = curPage >= pageCount - 1;
  [...$('#pages').children].forEach((w, i) => w.classList.toggle('current', i === curPage && pageCount > 1));
}
function goPage(i) {
  curPage = Math.max(0, Math.min(pageCount - 1, i));
  $('#pages').children[curPage]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updatePager();
}

/* ---------------- actions ---------------- */
function reroll() { set({ seed: (Math.random() * 1e9) | 0 }, { rebuild: activeTab === 'real', delay: 0 }); toast('New hand day — same text, freshly written'); }

function setStatus(t, busy) { const s = $('#status'); s.textContent = t; s.classList.toggle('busy', !!busy); }
let toastT;
function toast(t, kind = '') { const e = $('#toast'); e.textContent = t; e.className = 'toast show ' + kind; clearTimeout(toastT); toastT = setTimeout(() => (e.className = 'toast'), 3200); }

async function handleFile(file) {
  if (!file) return;
  setStatus('Reading ' + file.name + '…', true);
  try {
    const t = await importFile(file);
    if (!t.trim()) throw new Error('No text found. If this PDF is a scan (an image of text), it has no selectable text to import.');
    cfg.text = t; save();
    if ($('#editorDlg')?.open) { $('#edText').value = t; $('#edWc').textContent = wcText(t); }
    activeTab = 'write'; buildTabs(); buildBody();
    curPage = 0; schedule(0);
    toast(`Imported ${file.name} · ${(t.match(/\S+/g) || []).length} words`);
  } catch (e) {
    console.error(e); setStatus(''); toast(e.message || 'Could not read that file', 'err');
  }
}

async function onFontUpload(e) {
  const f = e.target.files[0]; if (!f) return;
  try {
    const buf = await f.arrayBuffer();
    const joined = $('#fontJoined')?.checked;
    const entry = await registerCustomFont(f.name, buf, joined);
    await idbSet('font:' + entry.id, { name: f.name, buf, joined });
    const list = (await idbGet('fonts')) || [];
    if (!list.includes(entry.id)) await idbSet('fonts', [...list, entry.id]);
    set({ font: entry.id }, { rebuild: true, delay: 0 });
    toast('Your handwriting font is ready');
  } catch (err) { console.error(err); toast('That file is not a valid font', 'err'); }
}
async function restoreFonts() {
  try {
    const list = (await idbGet('fonts')) || [];
    for (const id of list) {
      const rec = await idbGet('font:' + id);
      if (rec) await registerCustomFont(rec.name, rec.buf, rec.joined);
    }
  } catch {}
  if (!getFont(cfg.font) || (cfg.font.startsWith('custom:') && !listCustomFonts().some((f) => f.id === cfg.font))) cfg.font = DEFAULTS.font;
}

function onPaperUpload(e) {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => { assets.paperImage = img; buildBody(); schedule(0); toast('Paper image applied'); };
  img.onerror = () => toast('Could not load that image', 'err');
  img.src = URL.createObjectURL(f);
}

/* ---------------- export dialog ---------------- */
function openExport() {
  const d = $('#exportDlg');
  $('#progress').hidden = true; $('#doExport').disabled = false;
  $('#whichPages').disabled = pageCount < 2;
  d.showModal();
}
async function doExport(ev) {
  ev.preventDefault();
  const format = $('#exportDlg input[name=fmt]:checked').value;
  const opts = { format, dpi: +$('#dpi').value, pages: $('#whichPages').value, current: curPage, lossless: $('#lossless').checked, quality: format === 'jpg' ? 0.9 : 0.92 };
  $('#progress').hidden = false; $('#doExport').disabled = true;
  const bar = $('#progBar'), txt = $('#progText');
  try {
    await ensureFont(getFont(cfg.font));
    const r = await exportDocument(cfg, opts, assets, (p, t) => { bar.style.width = Math.round(p * 100) + '%'; txt.textContent = t; });
    txt.textContent = `Saved ${r.pages} page${r.pages > 1 ? 's' : ''}`;
    setTimeout(() => $('#exportDlg').close(), 700);
    toast(`Downloaded ${format.toUpperCase()} · ${r.pages} page${r.pages > 1 ? 's' : ''}`);
  } catch (e) { console.error(e); txt.textContent = 'Failed: ' + e.message; }
  $('#doExport').disabled = false;
}

/* ---------------- init ---------------- */
async function init() {
  $('#fileInput').accept = ACCEPT;
  const ps = $('#preset');
  for (const p of PRESETS) ps.append(h('option', { value: p.id }, p.label));
  ps.onchange = () => {
    const p = PRESETS.find((x) => x.id === ps.value); if (!p) return;
    set({ ...p.set, seed: (Math.random() * 1e9) | 0 }, { rebuild: true, delay: 0 });
    toast('Preset: ' + p.label); ps.value = '';
  };
  $('#reroll').onclick = reroll;
  $('#importBtn').onclick = () => $('#fileInput').click();
  $('#fileInput').onchange = (e) => { handleFile(e.target.files[0]); e.target.value = ''; };
  $('#exportBtn').onclick = openExport;
  $('#doExport').onclick = doExport;
  $('#zoomIn').onclick = () => stepZoom(1);
  $('#zoomOut').onclick = () => stepZoom(-1);
  $('#zoomFit').onclick = () => { zoom = null; applyZoom(); };
  $('#prevPage').onclick = () => goPage(curPage - 1);
  $('#nextPage').onclick = () => goPage(curPage + 1);
  $('#copyBtn').onclick = async () => {
    try { await copyPage(canvases[curPage]); toast('Page copied — paste it anywhere'); } catch { toast('Copy not supported here; use Download', 'err'); }
  };
  $('#printBtn').onclick = async () => { try { setStatus('Preparing print…', true); await printDocument(cfg, assets); setStatus(''); } catch (e) { toast(e.message, 'err'); } };

  const stage = $('#stage');
  stage.addEventListener('scroll', () => {
    const kids = [...$('#pages').children];
    const mid = stage.scrollTop + stage.clientHeight / 3;
    const i = kids.findIndex((k) => k.offsetTop + k.offsetHeight > mid);
    if (i >= 0 && i !== curPage) { curPage = i; updatePager(); }
  }, { passive: true });
  new ResizeObserver(() => { if (!zoom) applyZoom(); }).observe(stage);

  let dragDepth = 0;
  window.addEventListener('dragenter', (e) => { if (e.dataTransfer?.types?.includes('Files')) { dragDepth++; document.body.classList.add('dragging'); } });
  window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dragging'); } });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { e.preventDefault(); dragDepth = 0; document.body.classList.remove('dragging'); handleFile(e.dataTransfer.files[0]); });

  window.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); openExport(); }
    else if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); $('#fileInput').click(); }
    else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); $('#printBtn').click(); }
    else if (e.altKey && e.key.toLowerCase() === 'r') { e.preventDefault(); reroll(); }
    else if (mod && e.key.toLowerCase() === 'b' && !/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName)) { e.preventDefault(); setPanel(panelMode === 'min' ? 'normal' : 'min'); }
  });

  registerSW();
  setupInstall($('#installBtn'));
  if ('launchQueue' in window) launchQueue.setConsumer(async (p) => { if (p.files?.length) handleFile(await p.files[0].getFile()); });
  setupResize(); applyPanel();
  buildTabs(); buildBody(); applyZoom();
  await restoreFonts();
  buildBody();
  await render();
  applyZoom();
  window.__pw = { get cfg() { return cfg; }, set, render, setPanel, openEditor, get pages() { return pageCount; } };
}
init();
