/**
 * TranStar RSS / optional JSON fetch + parse (browser + Node-friendly parse).
 */

/**
 * @typedef {{ title: string, desc: string, guid: string, pub: string }} RssItem
 */

/**
 * @param {string} xmlText
 * @returns {RssItem[]}
 */
export function parseRssItems(xmlText) {
  const out = [];
  if (!xmlText) return out;
  let text = String(xmlText);
  const ix = text.indexOf('<?xml');
  if (ix > 0) text = text.slice(ix);
  text = text.replace(/^\uFEFF/, '');

  if (typeof DOMParser !== 'undefined') {
    let doc = null;
    try {
      doc = new DOMParser().parseFromString(text, 'application/xml');
    } catch {
      return out;
    }
    if (!doc || doc.querySelector('parsererror')) return out;
    const items = doc.querySelectorAll('item');
    for (const it of items) {
      const title = (it.querySelector('title') && it.querySelector('title').textContent) || '';
      const desc =
        (it.querySelector('description') && it.querySelector('description').textContent) || '';
      const guid = (it.querySelector('guid') && it.querySelector('guid').textContent) || title;
      const pub = (it.querySelector('pubDate') && it.querySelector('pubDate').textContent) || '';
      out.push({
        title: title.trim(),
        desc: desc.trim(),
        guid: String(guid).trim(),
        pub,
      });
    }
    return out;
  }

  /* Node / no-DOM fallback for tests */
  const blocks = text.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const tag = (name) => {
      const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
      return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
    };
    const title = tag('title');
    out.push({
      title,
      desc: tag('description'),
      guid: tag('guid') || title,
      pub: tag('pubDate'),
    });
  }
  return out;
}

/**
 * @param {string} url
 * @param {RequestInit} [opts]
 * @param {number} [ms]
 */
async function defaultFetchWithTimeout(url, opts, ms) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), ms || 10000) : null;
  try {
    return await fetch(url, { ...opts, signal: ctl ? ctl.signal : undefined });
  } finally {
    if (t) clearTimeout(t);
  }
}

/**
 * @param {string} name  e.g. 'traveltimes_rss.xml'
 * @param {{ fetchWithTimeout?: typeof defaultFetchWithTimeout, baseUrl?: string }} [opts]
 * @returns {Promise<RssItem[]>}
 */
export async function fetchTranStarRss(name, opts = {}) {
  const fetchFn = opts.fetchWithTimeout || defaultFetchWithTimeout;
  const base = opts.baseUrl || '/api/transtar/data/rss/';
  const r = await fetchFn(base + name, { cache: 'no-store' }, 10000);
  if (!r.ok) throw new Error('TranStar RSS ' + name + ' ' + r.status);
  return parseRssItems(await r.text());
}

/**
 * @param {string} path  e.g. 'speed.json'
 * @param {{ fetchFn?: typeof fetch, baseUrl?: string }} [opts]
 */
export async function fetchTranStarOptionalJson(path, opts = {}) {
  try {
    const fetchFn = opts.fetchFn || fetch;
    const base = opts.baseUrl || '/api/transtar/';
    const r = await fetchFn(base + path, { cache: 'no-store' });
    if (!r.ok) return null;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const text = await r.text();
    if (/html/.test(ct) || /^\s*</.test(text)) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Pull public TranStar RSS feeds used by the live poller.
 * @param {{ fetchWithTimeout?: Function }} [opts]
 */
export async function pullTranStarPublicFeeds(opts = {}) {
  const settled = await Promise.allSettled([
    fetchTranStarRss('traveltimes_rss.xml', opts),
    fetchTranStarRss('incidents_rss.xml', opts),
    fetchTranStarRss('laneclosures_rss.xml', opts),
  ]);
  const val = (i) => (settled[i].status === 'fulfilled' ? settled[i].value : []);
  const err = (i) =>
    settled[i].status === 'rejected'
      ? String(settled[i].reason && settled[i].reason.message ? settled[i].reason.message : settled[i].reason)
      : '';
  return {
    travelTimes: val(0),
    incidents: val(1),
    closures: val(2),
    errors: {
      travelTimes: err(0),
      incidents: err(1),
      closures: err(2),
    },
    at: Date.now(),
  };
}
