// All parsing happens locally in the browser; files are never uploaded.
const ext = (name) => (name.match(/\.([a-z0-9]+)$/i) || [, ''])[1].toLowerCase();

export const ACCEPT = '.txt,.md,.markdown,.text,.docx,.pdf,.odt,.rtf,.html,.htm,.csv,.json,.log';

export async function importFile(file) {
  const e = ext(file.name);
  if (e === 'docx') return docxToText(await file.arrayBuffer());
  if (e === 'pdf') return pdfToText(await file.arrayBuffer());
  if (e === 'odt') return odtToText(await file.arrayBuffer());
  if (e === 'rtf') return rtfToText(await file.text());
  if (e === 'html' || e === 'htm') return htmlToText(await file.text());
  if (e === 'doc') throw new Error('Legacy .doc files are not supported. Open it in Word or Google Docs and save as .docx, then import again.');
  if (/^(png|jpe?g|gif|webp|heic)$/.test(e)) throw new Error('Images are not text. Paste the text in, or save your document as .docx / .pdf / .txt.');
  return normalise(await file.text());
}

export function normalise(t) {
  return t.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/^(\s*(?:[-*\u2022]|\d+[.)]) .*)\n\n(?=\s*(?:[-*\u2022]|\d+[.)]) )/gm, '$1\n').replace(/^(\s*(?:[-*\u2022]|\d+[.)]) .*)\n\n(?=\s*(?:[-*\u2022]|\d+[.)]) )/gm, '$1\n').trim();
}

// HTML -> light markdown (headings, lists, paragraphs) so structure survives.
const inlineText = (node) => {
  let s = '';
  for (const c of node.childNodes) {
    if (c.nodeType === 3) s += c.textContent.replace(/\s+/g, ' ');
    else if (c.nodeType === 1) s += c.tagName === 'BR' ? '\n' : inlineText(c);
  }
  return s;
};

export function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,noscript').forEach((n) => n.remove());
  const out = [];
  const walk = (node, depth = 0) => {
    for (const n of node.childNodes) {
      if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' '); if (t.trim()) out.push(t); continue; }
      if (n.nodeType !== 1) continue;
      const tag = n.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) { out.push('\n\n' + '#'.repeat(Math.min(3, +tag[1])) + ' ' + n.textContent.trim() + '\n'); continue; }
      if (tag === 'li') {
        const ol = n.parentElement && n.parentElement.tagName === 'OL';
        const idx = ol ? [...n.parentElement.children].indexOf(n) + 1 + '.' : '-';
        out.push('\n' + '  '.repeat(depth) + idx + ' ');
        walk(n, depth + 1);
        continue;
      }
      if (tag === 'br') { out.push('\n'); continue; }
      if (tag === 'strong' || tag === 'b' || tag === 'u') {
        const m = tag === 'u' ? '_' : '**';
        const t = inlineText(n).split('\n').map((s) => s.trim()).map((s) => (s ? m + s + m : '')).join('\n');
        if (t.trim()) out.push(' ' + t + ' ');
        continue;
      }
      if (tag === 'tr') { out.push('\n' + [...n.children].map((c) => c.textContent.trim()).join('   ')); continue; }
      const block = /^(p|div|section|article|blockquote|pre|table|ul|ol|header|footer)$/.test(tag);
      if (block) out.push('\n\n');
      walk(n, tag === 'ul' || tag === 'ol' ? depth : depth);
      if (block) out.push('\n\n');
    }
  };
  walk(doc.body || doc.documentElement);
  return normalise(out.join('').replace(/ +\n/g, '\n').replace(/\n +/g, '\n').replace(/ {2,}/g, ' ').replace(/\*\* +\*\*/g, ' '));
}

async function docxToText(buf) {
  const mammoth = (await import('mammoth/mammoth.browser.js')).default || (await import('mammoth/mammoth.browser.js'));
  const res = await mammoth.convertToHtml({ arrayBuffer: buf });
  return htmlToText(res.value);
}

async function odtToText(buf) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('content.xml').async('string');
  const d = new DOMParser().parseFromString(xml, 'application/xml');
  const out = [];
  const walk = (n) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) { out.push(c.textContent); continue; }
      if (c.nodeType !== 1) continue;
      const ln = c.localName;
      if (ln === 'h') { out.push('\n\n# '); walk(c); out.push('\n'); }
      else if (ln === 'p') { out.push('\n\n'); walk(c); }
      else if (ln === 'list-item') { out.push('\n- '); walk(c); }
      else if (ln === 's') out.push(' '.repeat(+(c.getAttribute('text:c') || 1)));
      else if (ln === 'tab') out.push('    ');
      else if (ln === 'line-break') out.push('\n');
      else walk(c);
    }
  };
  walk(d.documentElement);
  return normalise(out.join('').replace(/\n- \n\n/g, '\n- '));
}

export function rtfToText(rtf) {
  let s = rtf.replace(/\{\\\*[^{}]*\}/g, '').replace(/\{\\(fonttbl|colortbl|stylesheet|info)[\s\S]*?\}\s*(?=\\|\{|[^{}])/g, '');
  s = s.replace(/\\par[d]?\b ?/g, '\n').replace(/\\line ?/g, '\n').replace(/\\tab ?/g, '    ');
  s = s.replace(/\\'([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  s = s.replace(/\\u(-?\d+)\??/g, (_, n) => String.fromCharCode((+n + 65536) % 65536));
  s = s.replace(/\\[a-z]+-?\d* ?/gi, '').replace(/[{}]/g, '').replace(/\\([\\{}])/g, '$1');
  return normalise(s);
}

async function pdfToText(buf) {
  const pdfjs = await import('pdfjs-dist');
  const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  const paras = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    // rebuild lines from positioned runs, then paragraphs from line gaps
    const rows = [];
    for (const it of tc.items) {
      if (!('str' in it)) continue;
      const y = it.transform[5], x = it.transform[4], h = Math.abs(it.transform[3]) || it.height || 10;
      let row = rows.find((r) => Math.abs(r.y - y) < h * 0.45);
      if (!row) { row = { y, h, items: [] }; rows.push(row); }
      row.items.push({ x, s: it.str, w: it.width });
    }
    rows.sort((a, b) => b.y - a.y);
    let prev = null, buf2 = '';
    for (const r of rows) {
      r.items.sort((a, b) => a.x - b.x);
      let line = '', lastEnd = null;
      for (const it of r.items) {
        if (lastEnd !== null && it.x - lastEnd > r.h * 0.15 && !line.endsWith(' ') && !it.s.startsWith(' ')) line += ' ';
        line += it.s; lastEnd = it.x + it.w;
      }
      line = line.replace(/\s+/g, ' ').trim();
      if (!line) continue;
      const gap = prev ? prev.y - r.y : 0;
      if (prev && gap > prev.h * 1.75) { paras.push(buf2); buf2 = ''; }
      if (buf2.endsWith('-') && /^[a-z]/.test(line)) buf2 = buf2.slice(0, -1) + line;
      else if (/^([-\u2022*\u25cf]|\d+[.)])\s/.test(line) && buf2) { paras.push(buf2); buf2 = line.replace(/^[\u2022\u25cf*]/, '-'); }
      else buf2 = buf2 ? buf2 + ' ' + line : line.replace(/^[\u2022\u25cf]/, '-');
      prev = r;
    }
    if (buf2) paras.push(buf2);
  }
  return normalise(paras.join('\n\n'));
}
