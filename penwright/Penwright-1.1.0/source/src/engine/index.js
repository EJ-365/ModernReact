import { DEFAULTS } from './config.js';
import { getFont, ensureFont } from './fonts.js';
import { layoutDocument } from './layout.js';
import { renderPage } from './render.js';
import { applyFinish } from './finish.js';

export * from './config.js';
export * from './fonts.js';
export * from './paper.js';
export { layoutDocument, renderPage, applyFinish };

export async function prepare(cfgIn) {
  const cfg = { ...DEFAULTS, ...cfgIn };
  const font = getFont(cfg.font);
  await ensureFont(font);
  const doc = layoutDocument(cfg, font);
  doc.connected = !!font.connected;
  return { cfg, font, doc };
}

// dpi -> px per mm
export const pxPerMm = (dpi) => dpi / 25.4;

export function renderFinal(doc, cfg, pi, dpi, assets) {
  const k = pxPerMm(dpi);
  const page = renderPage(doc, cfg, pi, k, assets);
  return applyFinish(page, cfg, pi, k);
}

export async function renderAll(cfgIn, dpi, assets, onPage) {
  const { cfg, doc } = await prepare(cfgIn);
  const out = [];
  for (let i = 0; i < doc.pages.length; i++) {
    const c = renderFinal(doc, cfg, i, dpi, assets);
    out.push(c);
    if (onPage) await onPage(c, i, doc.pages.length);
    await new Promise((r) => setTimeout(r, 0));
  }
  return { canvases: out, doc, cfg };
}
