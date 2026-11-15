import { renderAll } from '../engine/index.js';

const toBlob = (c, type = 'image/png', q = 0.92) => new Promise((r) => c.toBlob(r, type, q));

export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

const slug = (s) => (s || 'handwriting').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'handwriting';

export async function exportDocument(cfg, opts, assets, onProgress) {
  const { format, dpi, quality = 0.92, pages: which } = opts;
  const name = slug(cfg.headerTitle || (cfg.text || '').split('\n').find((l) => l.trim())?.replace(/^#+\s*/, ''));
  const { canvases, doc } = await renderAll(cfg, dpi, assets, async (c, i, n) => onProgress && onProgress((i + 1) / n * 0.85, `Writing page ${i + 1} of ${n}\u2026`));
  const list = which === 'current' && opts.current != null ? [canvases[opts.current]] : canvases;
  const pxPerMm = dpi / 25.4;
  if (format === 'pdf') {
    onProgress && onProgress(0.9, 'Building PDF\u2026');
    const { jsPDF } = await import('jspdf');
    let pdf;
    for (const c of list) {
      const w = c.width / pxPerMm, h = c.height / pxPerMm;
      const orient = w > h ? 'l' : 'p';
      if (!pdf) pdf = new jsPDF({ unit: 'mm', format: [w, h], orientation: orient, compress: true });
      else pdf.addPage([w, h], orient);
      const lossless = opts.lossless;
      const data = c.toDataURL(lossless ? 'image/png' : 'image/jpeg', quality);
      pdf.addImage(data, lossless ? 'PNG' : 'JPEG', 0, 0, w, h, undefined, 'FAST');
    }
    pdf.setProperties({ title: name, creator: 'Penwright' });
    download(pdf.output('blob'), name + '.pdf');
  } else {
    const type = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const extn = format === 'jpg' ? 'jpg' : 'png';
    if (list.length === 1) {
      download(await toBlob(list[0], type, quality), `${name}.${extn}`);
    } else {
      onProgress && onProgress(0.9, 'Zipping pages\u2026');
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (let i = 0; i < list.length; i++) zip.file(`${name}-page-${String(i + 1).padStart(2, '0')}.${extn}`, await toBlob(list[i], type, quality));
      download(await zip.generateAsync({ type: 'blob' }), `${name}-${list.length}-pages.zip`);
    }
  }
  onProgress && onProgress(1, 'Done');
  return { pages: list.length, total: doc.pages.length };
}

export async function copyPage(canvas) {
  const blob = await toBlob(canvas);
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export async function printDocument(cfg, assets) {
  const { canvases } = await renderAll(cfg, 200, assets);
  const w = window.open('', '_blank');
  if (!w) throw new Error('Pop-up blocked: allow pop-ups to print.');
  const imgs = canvases.map((c) => `<img src="${c.toDataURL('image/jpeg', 0.92)}">`).join('');
  w.document.write(`<!doctype html><title>Print</title><style>@page{margin:0}body{margin:0}img{display:block;width:100%;page-break-after:always}</style>${imgs}`);
  w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}
