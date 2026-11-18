/** Search YouTube for a unique Weeknd track as Hong Kong vibe alt. */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
async function oembed(id) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
async function ytSearch(q) {
  const url =
    'https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAQ%253D%253D';
  const r = await fetch(url, {
    headers: {
      'Accept-Language': 'en-US',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
    },
    signal: AbortSignal.timeout(20000),
  });
  const h = await r.text();
  return [...new Set([...h.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]))].slice(0, 15);
}

(async () => {
  const queries = [
    'The Weeknd Hong Kong Kiss Land official audio',
    'The Weeknd Wicked Games official audio',
    'The Weeknd The Morning official audio',
    'The Weeknd Often official music video',
    'The Weeknd Party Monster official music video',
    'The Weeknd Reminder official music video',
    'The Weeknd Die For You official music video',
    'The Weeknd I Feel It Coming official',
  ];
  let picked = null;
  for (const q of queries) {
    let ids = [];
    try {
      ids = await ytSearch(q);
    } catch (e) {
      console.log('search fail', q, e.message);
      continue;
    }
    for (const id of ids) {
      if (seen.has(id)) continue;
      const meta = await oembed(id);
      if (!meta) continue;
      const t = meta.title.toLowerCase();
      if (!t.includes('weeknd') && !t.includes('weekend')) continue;
      // avoid obvious wrong mashups
      if (/王菲|季候|chinese|cover|nightcore|sped up|slowed/.test(t)) continue;
      picked = { id, title: meta.title.slice(0, 90), a: 'The Weeknd', otitle: meta.title };
      break;
    }
    if (picked) break;
  }
  if (!picked) {
    console.log('FAIL');
    return;
  }
  const row = {
    g: 'pop',
    id: picked.id,
    title: /hong kong/i.test(picked.otitle) ? 'Hong Kong' : picked.title.includes(' - ') ? picked.title.split(' - ').slice(1).join(' - ').slice(0, 60) + ' (Hong Kong vibe alt)' : 'Weeknd track (Hong Kong vibe alt)',
    a: 'The Weeknd',
  };
  // cleaner titles for known songs
  if (/wicked games/i.test(picked.otitle)) row.title = 'Wicked Games (Hong Kong vibe alt)';
  if (/the morning/i.test(picked.otitle)) row.title = 'The Morning (Hong Kong vibe alt)';
  if (/often/i.test(picked.otitle)) row.title = 'Often (Hong Kong vibe alt)';
  if (/party monster/i.test(picked.otitle)) row.title = 'Party Monster (Hong Kong vibe alt)';
  if (/reminder/i.test(picked.otitle)) row.title = 'Reminder (Hong Kong vibe alt)';
  if (/die for you/i.test(picked.otitle)) row.title = 'Die For You (Hong Kong vibe alt)';
  if (/feel it coming/i.test(picked.otitle)) row.title = 'I Feel It Coming (Hong Kong vibe alt)';
  if (/hong kong/i.test(picked.otitle)) {
    row.title = 'Hong Kong';
  }

  const block =
    '  /* —— User list Hong Kong vibe —— */\n' +
    `  { g: 'pop', id: '${row.id}', title: '${esc(row.title)}', a: '${esc(row.a)}' },\n`;
  s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  fs.writeFileSync(file, s);
  console.log('+', row.title, row.id, '|', picked.otitle);
})();
