import { Rng, hash } from './rng.js';
import { fontMetrics, sanitizeForFont } from './fonts.js';
import { getPaper, paperLayout, examFieldSlots } from './paper.js';
import { formatDate } from './config.js';

let mctx;
const widthCache = new Map();
function measure(family, s) {
  const key = family + '\u0000' + s;
  let w = widthCache.get(key);
  if (w !== undefined) return w;
  if (!mctx) mctx = document.createElement('canvas').getContext('2d');
  mctx.font = `100px "${family}"`;
  w = mctx.measureText(s).width / 100;
  if (widthCache.size > 60000) widthCache.clear();
  widthCache.set(key, w);
  return w;
}

// Neighbouring keys for realistic slips of the pen.
const NEAR = { a: 'sq', b: 'vn', c: 'xv', d: 'sf', e: 'wr', f: 'dg', g: 'fh', h: 'gj', i: 'uo', j: 'hk', k: 'jl', l: 'k', m: 'n', n: 'mb', o: 'ip', p: 'o', q: 'w', r: 'et', s: 'ad', t: 'ry', u: 'yi', v: 'cb', w: 'qe', x: 'zc', y: 'tu', z: 'x' };

function mistakeFor(word, rng) {
  const letters = word.replace(/[^A-Za-z]/g, '');
  if (letters.length < 3) return null;
  const r = rng.next();
  if (r < 0.45) {
    // started writing, noticed, crossed out
    return word.slice(0, rng.int(1, Math.min(3, word.length - 2)));
  }
  const chars = [...word];
  const idx = [];
  chars.forEach((c, i) => { if (/[a-z]/i.test(c) && i > 0) idx.push(i); });
  if (!idx.length) return null;
  const i = rng.pick(idx);
  if (r < 0.75 && i < chars.length - 1 && /[a-z]/i.test(chars[i + 1])) {
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
  } else {
    const lc = chars[i].toLowerCase();
    const alt = NEAR[lc] ? rng.pick([...NEAR[lc]]) : lc;
    chars[i] = chars[i] === lc ? alt : alt.toUpperCase();
  }
  const m = chars.join('');
  return m === word ? null : m;
}

// Parses light markdown into blocks: heading / bullet / para / blank.
export function parseBlocks(text) {
  const blocks = [];
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.replace(/\t/g, '    ');
    if (!line.trim()) { blocks.push({ type: 'blank' }); continue; }
    let m;
    if ((m = line.match(/^\s*(#{1,3})\s+(.*)$/))) { blocks.push({ type: 'heading', level: m[1].length, text: m[2] }); continue; }
    if ((m = line.match(/^(\s*)([-*\u2022+\u2013]|\d{1,3}[.)]|[a-zA-Z][.)])\s+(.*)$/))) {
      const sym = /[-*\u2022+\u2013]/.test(m[2]) ? '-' : m[2];
      blocks.push({ type: 'bullet', depth: Math.min(3, Math.floor(m[1].length / 2)), sym, text: m[3] });
      continue;
    }
    if ((m = line.match(/^\s*\[( |x|X)\]\s+(.*)$/))) { blocks.push({ type: 'bullet', depth: 0, sym: m[1] === ' ' ? '\u25a1' : '\u2611', text: m[2] }); continue; }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { blocks.push({ type: 'rule' }); continue; }
    blocks.push({ type: 'para', text: line.trim(), lead: line.length - line.trimStart().length });
  }
  return blocks;
}

// words with inline **bold** and _underline_ flags
function words(text) {
  const out = [];
  let bold = false, under = false;
  for (let w of text.split(/ +/)) {
    if (!w) continue;
    let b = bold, u = under;
    if (w.startsWith('**')) { bold = true; b = true; w = w.slice(2); }
    if (w.startsWith('__') || (w.startsWith('_') && w.length > 1)) { under = true; u = true; w = w.replace(/^_+/, ''); }
    let endB = false, endU = false;
    if (/\*\*[.,;:!?)]*$/.test(w)) { endB = true; w = w.replace(/\*\*([.,;:!?)]*)$/, '$1'); }
    if (/_+[.,;:!?)]*$/.test(w) && u) { endU = true; w = w.replace(/_+([.,;:!?)]*)$/, '$1'); }
    if (w) out.push({ t: w, bold: b, under: u });
    if (endB) bold = false;
    if (endU) under = false;
  }
  return out;
}

export function headerDate(cfg) {
  const d = cfg.headerDate;
  if (!d) return '';
  if (d.startsWith('@')) return formatDate(new Date(), d.slice(1));
  return d;
}

/**
 * Lays the document out in millimetres. Output is resolution independent.
 * pages[] -> { lines: [{ y, x0, kind, tokens: [{ t, x, w, kind, bold, under, scale }] }] }
 */
export function layoutDocument(cfg, font) {
  const paper = getPaper(cfg.paper);
  const L = paperLayout(paper, cfg.pageSize, { lineSpacing: cfg.lineSpacing, gridRows: cfg.gridRows });
  const fm = fontMetrics(font);
  const rng = new Rng(hash('layout', cfg.seed));
  const family = font.family;
  const xh = L.sp * 0.34 * cfg.size * (font.xh || 1);
  const em = xh / (fm.xh / 100);
  const ls = cfg.letterSpacing * em;
  const W = (s, scale = 1) => (measure(family, s) * em + ls * [...s].length) * scale;
  const spaceBase = Math.max((fm.space / 100) * em, xh * (font.connected ? 1.15 : 0.95));
  const space = () => spaceBase * cfg.wordSpacing * rng.range(0.82, 1.28) + ls;
  const skip = Math.max(1, cfg.lineSkip | 0);
  const slots = L.lines.filter((_, i) => i % skip === 0);
  const san = (s) => sanitizeForFont(s, family);

  const pages = [];
  let page, slot;
  const newPage = () => {
    page = { lines: [], fields: [], index: pages.length };
    pages.push(page);
    slot = 0;
    if (pages.length === 1) firstPageHeader();
  };
  const tok = (t, x, kind = 'word', extra = {}) => ({ t, x, w: W(t, extra.scale || 1), kind, ...extra });

  function firstPageHeader() {
    const name = san(cfg.headerName || ''), date = san(headerDate(cfg)), title = san(cfg.headerTitle || '');
    if (paper.exam) {
      const fs = examFieldSlots(L);
      const vals = { name, date, subject: san(cfg.headerSubject || ''), class: san(cfg.headerClass || '') };
      for (const f of fs) if (vals[f.key]) page.fields.push({ y: f.py - 0.3, x0: f.px + 1.5, kind: 'field', tokens: splitTokens(vals[f.key], 0.9) });
    } else if (paper.cardLine) {
      if (title || name) page.lines.push({ y: paper.cardLine - 2.2, x0: L.left + 2, kind: 'title', tokens: splitTokens(title || name, 1.05, { under: false }) });
    } else if (name || date) {
      const toks = [];
      if (name) toks.push(...splitTokens(name, 0.95));
      if (date) {
        const dt = splitTokens(date, 0.95);
        const dw = dt.length ? dt[dt.length - 1].x + dt[dt.length - 1].w : 0;
        const startX = L.right - L.left - dw - rng.range(2, 6);
        for (const t of dt) toks.push({ ...t, x: t.x + startX });
      }
      page.lines.push({ y: slots[0], x0: L.left, kind: 'header', tokens: toks });
      slot = 1;
    }
    if (title && !paper.cardLine) {
      const tt = splitTokens(title, 1.25, { under: true });
      const tw = tt.length ? tt[tt.length - 1].x + tt[tt.length - 1].w : 0;
      const off = Math.max(0, (L.right - L.left - tw) / 2 + rng.range(-4, 4));
      page.lines.push({ y: slots[slot] ?? slots[0], x0: L.left + off, kind: 'title', tokens: tt });
      slot += 1;
      if (slots.length > 12) slot += 0;
    }
  }

  function splitTokens(text, scale, extra = {}) {
    const out = [];
    let x = 0;
    for (const w of words(text)) {
      const t = tok(w.t, x, 'word', { scale, bold: w.bold, under: w.under || extra.under });
      out.push(t);
      x += t.w + space() * scale;
    }
    return out;
  }

  const avail = () => L.right - L.left;
  let line = null;
  const flushLine = () => {
    if (line && line.tokens.length) { page.lines.push(line); slot++; }
    line = null;
  };
  const ensureSlot = () => {
    if (!page || slot >= slots.length) newPage();
  };
  const startLine = (indent, kind = 'body') => {
    ensureSlot();
    line = { y: slots[slot], x0: L.left, kind, tokens: [], cursor: indent, limit: avail() - rng.range(0, 4) * cfg.rightRag, hang: indent };
  };

  const placeWord = (w, opts) => {
    const scale = opts.scale || 1;
    let wd = W(w.t, scale);
    if (!line) startLine(opts.firstIndent || 0, opts.kind);
    if (line.tokens.length && line.cursor + wd > line.limit) {
      flushLine();
      startLine(opts.hang || 0, opts.kind);
    }
    // a single word wider than the line: break it like a person would
    if (wd > line.limit - line.cursor && [...w.t].length > 4) {
      const ch = [...w.t];
      let cut = ch.length - 1;
      while (cut > 2 && W(ch.slice(0, cut).join('') + '-', scale) > line.limit - line.cursor) cut--;
      placeWord({ ...w, t: ch.slice(0, cut).join('') + '-' }, opts);
      flushLine();
      startLine(opts.hang || 0, opts.kind);
      return placeWord({ ...w, t: ch.slice(cut).join('') }, opts);
    }
    line.tokens.push({ t: w.t, x: line.cursor, w: wd, kind: w.kind || 'word', bold: w.bold, under: w.under, scale });
    line.cursor += wd + space() * scale;
  };

  const writeText = (text, opts) => {
    for (const w of words(san(text))) {
      if (cfg.mistakes > 0 && w.t.length >= 3 && rng.chance(cfg.mistakes * 0.02)) {
        const m = mistakeFor(w.t, rng);
        if (m) placeWord({ t: m, kind: 'strike', bold: w.bold }, opts);
      }
      placeWord(w, opts);
      opts.firstIndent = 0;
    }
  };

  newPage();
  const blocks = parseBlocks(cfg.text || '');
  let blankRun = 0, prevType = null;
  for (const b of blocks) {
    if (b.type === 'blank') {
      flushLine();
      blankRun++;
      if (blankRun <= 1 && page.lines.length && prevType !== 'heading') { ensureSlot(); slot++; }
      continue;
    }
    blankRun = 0;
    if (b.type === 'rule') {
      flushLine(); ensureSlot();
      page.lines.push({ y: slots[slot] - L.sp * 0.4, x0: L.left, kind: 'rule', tokens: [], width: avail() * rng.range(0.4, 0.7) });
      slot++;
      prevType = 'rule';
      continue;
    }
    flushLine();
    if (b.type === 'heading') {
      const scale = b.level === 1 ? 1.32 : b.level === 2 ? 1.16 : 1.06;
      if (page.lines.length && prevType !== 'blank' && slot < slots.length - 2 && b.level === 1 && prevType) { /* keep flow */ }
      writeText(b.text, { scale, kind: 'heading', hang: 0, firstIndent: 0 });
      if (line) line.tokens.forEach((t) => { t.under = b.level <= 2; t.bold = b.level === 1; });
      if (line) line.headingLevel = b.level;
      flushLine();
    } else if (b.type === 'bullet') {
      const ind = b.depth * em * 1.6;
      const symW = W(san(b.sym) || '-');
      startLine(ind, 'body');
      line.tokens.push({ t: san(b.sym) || '-', x: ind, w: symW, kind: 'word' });
      line.cursor = ind + symW + em * 0.45;
      writeText(b.text, { hang: line.cursor, kind: 'body' });
      flushLine();
    } else {
      const indent = cfg.indent && prevType !== 'bullet' ? em * rng.range(1.3, 1.9) : 0;
      writeText(b.text, { firstIndent: indent + Math.min(b.lead, 8) * em * 0.25, hang: 0, kind: 'body' });
      flushLine();
    }
    prevType = b.type;
  }
  flushLine();

  if (cfg.pageNumbers && pages.length > 1) {
    for (const p of pages) {
      const t = String(p.index + 1);
      const y = Math.min(L.H - 5, (L.lines[L.lines.length - 1] || L.H - 12) + L.sp * 0.95);
      p.lines.push({ y, x0: L.right - W(t) - rng.range(1, 4), kind: 'pagenum', tokens: [tok(t, 0, 'word', { scale: 1 })] });
    }
  }
  return { pages, L, paper, em, xh, family };
}
