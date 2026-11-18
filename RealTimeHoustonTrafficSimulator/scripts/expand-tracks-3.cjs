/**
 * Pack 3: missing requested songs + bulk popular fill to ~1000 unique IDs.
 * Uses YouTube innertube search (public client key) then oEmbed verify.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));
console.log('before unique', seen.size);

const TARGET = 1000;
const YT_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

/** Explicit missing / requested adds */
const must = [
  { g: 'movies', id: 'QdBZY2fkU-0', title: 'Love Is a Long Road (GTA VI Trailer)', a: 'Tom Petty' },
  { g: 'movies', id: 'jZQDXXhJ330', title: 'Grand Theft Auto VI Trailer 1', a: 'Rockstar Games' },
  { g: 'pop', id: 'WMGxrqpZzV0', title: 'DECADE OF POP Megamix (2008-2018)', a: 'Adamusic' },
  { g: 'pop', id: 'jZ1jJ2QdgV0', title: 'Pop Danthology 2010s Decade Mashup', a: 'Daniel Kim' },
  { g: 'movies', id: '2PpgPxjzbkA', title: 'Moulin Rouge Trailer', a: 'Nicole Kidman' },
  { g: 'movies', id: 'Bv4eXFS4QEY', title: 'Come What May', a: 'Nicole Kidman & Ewan McGregor' },
  { g: 'pop', id: 'oofSnsGkops', title: "You're Beautiful", a: 'James Blunt' },
  { g: 'soul', id: 'yGHEis32s2Y', title: 'oh yeah?', a: 'Steve Lacy' },
  { g: 'afrobeat', id: 'SOJpE1KMUbo', title: 'Raindance', a: 'Dave ft. Tems' },
  { g: 'afrobeat', id: 'mMJ3Gogi2Qk', title: "Sittin' On Top Of The World", a: 'Burna Boy ft. 21 Savage' },
  { g: 'afrobeat', id: '6GATRApPww8', title: 'Big 7', a: 'Burna Boy' },
  { g: 'afrobeat', id: 'bGsKQxIwEeQ', title: 'Tested, Approved & Trusted', a: 'Burna Boy' },
  { g: 'afrobeat', id: 'QHb0PwCQPxg', title: 'Wave', a: 'Asake, Central Cee' },
  { g: 'hiphop', id: 'iI34LYmJ1Fs', title: 'Robbery', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'Sw5fNI400E4', title: 'Bandit', a: 'Juice WRLD ft. NBA YoungBoy' },
  { g: 'hiphop', id: 'h3EJICKwITw', title: 'All Girls Are The Same', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'ZengOKCUBHo', title: 'Righteous', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'C5i-UnuUKUI', title: 'Wishing Well', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'r_0JjYUe5jo', title: 'Godzilla', a: 'Eminem ft. Juice WRLD' },
  { g: 'hiphop', id: 'uH9m5CVqAiE', title: 'Armed And Dangerous', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'euSAgaub3m8', title: 'Hear Me Calling', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'OcQ71ubUXAE', title: 'Conversations', a: 'Juice WRLD' },
  { g: 'gospel', id: 'sQwUD__WMD0', title: 'Promises', a: 'Maverick City Music' },
  { g: 'gospel', id: 'BZT8jqsc8lQ', title: 'Your Spirit', a: 'Tasha Cobbs Leonard ft. Kierra Sheard' },
  { g: 'gospel', id: 'MimVg0OMGvA', title: 'Made A Way', a: 'Travis Greene' },
  { g: 'gospel', id: 'I66SDeRQSJ4', title: 'Imagine Me', a: 'Kirk Franklin' },
  { g: 'gospel', id: '37wV6D49iEY', title: 'There Was Jesus', a: 'Zach Williams & Dolly Parton' },
  { g: 'gospel', id: '9sJZOGxRxwM', title: 'Praise God', a: 'Kanye West' },
  { g: 'classics', id: 'ZdEZ3Y8c4Ho', title: 'Another Day in Paradise (Live Berlin)', a: 'Phil Collins' },
];

/** Search queries per genre to harvest unique video IDs */
const queries = [
  ['gospel', 'kirk franklin best gospel songs'],
  ['gospel', 'tasha cobbs leonard worship songs'],
  ['gospel', 'hillsong worship popular songs'],
  ['gospel', 'elevation worship maverick city hits'],
  ['gospel', 'cece winans gospel hits'],
  ['gospel', 'fred hammond gospel classics'],
  ['gospel', 'donnie mcclurkin gospel songs'],
  ['gospel', 'mary mary gospel hits'],
  ['gospel', 'sinach nigeria gospel worship'],
  ['gospel', 'nathaniel bassey worship songs'],
  ['gospel', 'dunsin oyekan worship'],
  ['gospel', 'lauren daigle christian hits'],
  ['hiphop', 'juice wrld official music videos'],
  ['hiphop', 'drake official music videos hits'],
  ['hiphop', 'kendrick lamar official videos'],
  ['hiphop', 'travis scott official music videos'],
  ['hiphop', 'lil baby official music videos'],
  ['hiphop', 'future official music videos'],
  ['hiphop', 'metro boomin official videos'],
  ['hiphop', '21 savage official music videos'],
  ['hiphop', 'rod wave official music videos'],
  ['hiphop', 'don toliver official videos'],
  ['hiphop', 'tyler the creator official videos'],
  ['hiphop', 'kanye west official music videos'],
  ['hiphop', 'nicki minaj official music videos'],
  ['hiphop', 'cardi b official music videos'],
  ['afrobeat', 'burna boy official music videos'],
  ['afrobeat', 'wizkid official music videos'],
  ['afrobeat', 'davido official music videos'],
  ['afrobeat', 'asake official music videos'],
  ['afrobeat', 'rema official music videos'],
  ['afrobeat', 'ayra starr official music videos'],
  ['afrobeat', 'tems official music videos'],
  ['afrobeat', 'omahlay official music videos'],
  ['afrobeat', 'fireboy dml official videos'],
  ['afrobeat', 'kizz daniel official videos'],
  ['afrobeat', 'tiwa savage official videos'],
  ['pop', 'taylor swift official music videos'],
  ['pop', 'billie eilish official music videos'],
  ['pop', 'dua lipa official music videos'],
  ['pop', 'ariana grande official music videos'],
  ['pop', 'the weeknd official music videos'],
  ['pop', 'ed sheeran official music videos'],
  ['pop', 'bruno mars official music videos'],
  ['pop', 'lady gaga official music videos'],
  ['pop', 'olivia rodrigo official music videos'],
  ['pop', 'sabrina carpenter official music videos'],
  ['pop', 'harry styles official music videos'],
  ['rock', 'linkin park official music videos'],
  ['rock', 'foo fighters official music videos'],
  ['rock', 'green day official music videos'],
  ['rock', 'imagine dragons official videos'],
  ['rock', 'nirvana official music videos'],
  ['rock', 'queen official music videos'],
  ['rock', 'metallica official music videos'],
  ['rock', 'creed official music videos'],
  ['rock', 'nickelback official music videos'],
  ['classics', 'phil collins official music videos'],
  ['classics', 'michael jackson official music videos'],
  ['classics', 'whitney houston official videos'],
  ['classics', 'madonna official music videos'],
  ['classics', 'prince official music videos'],
  ['classics', 'bee gees official music videos'],
  ['classics', 'elton john official music videos'],
  ['soul', 'alicia keys official music videos'],
  ['soul', 'usher official music videos'],
  ['soul', 'beyonce official music videos'],
  ['soul', 'r kelly classic rnb videos'],
  ['soul', 'mary j blige official videos'],
  ['soul', 'steve lacy official videos'],
  ['soul', 'sza official music videos'],
  ['soul', 'frank ocean official videos'],
  ['country', 'luke combs official music videos'],
  ['country', 'morgan wallen official videos'],
  ['country', 'carrie underwood official videos'],
  ['country', 'zach bryan official videos'],
  ['country', 'chris stapleton official videos'],
  ['latin', 'bad bunny official music videos'],
  ['latin', 'j balvin official music videos'],
  ['latin', 'shakira official music videos'],
  ['latin', 'karol g official music videos'],
  ['latin', 'daddy yankee official videos'],
  ['electronic', 'calvin harris official music videos'],
  ['electronic', 'avicii official music videos'],
  ['electronic', 'david guetta official videos'],
  ['electronic', 'swedish house mafia videos'],
  ['electronic', 'marshmello official music videos'],
  ['electronic', 'the chainsmokers official videos'],
  ['movies', 'disney soundtrack official videos'],
  ['movies', 'moulin rouge soundtrack songs'],
  ['movies', 'gta vice city soundtrack songs'],
  ['pop', 'christmas songs official music videos'],
  ['pop', 'billboard hot 100 hits official videos'],
  ['hiphop', 'houston rap classics official videos'],
  ['gospel', 'todd dulaney gospel worship'],
];

async function ytSearch(q) {
  const body = {
    context: {
      client: {
        clientName: 'WEB',
        clientVersion: '2.20240101.00.00',
        hl: 'en',
        gl: 'US',
      },
    },
    query: q,
  };
  const r = await fetch(
    `https://www.youtube.com/youtubei/v1/search?key=${YT_KEY}&prettyPrint=false`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!r.ok) throw new Error('search ' + r.status);
  return r.json();
}

function extractVideoIds(json) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.videoRenderer && node.videoRenderer.videoId) {
      const vr = node.videoRenderer;
      const title = (vr.title?.runs || []).map((x) => x.text).join('') || vr.title?.simpleText || '';
      const a = (vr.ownerText?.runs || []).map((x) => x.text).join('') || '';
      out.push({ id: vr.videoId, title, a });
    }
    if (Array.isArray(node)) node.forEach(walk);
    else Object.values(node).forEach(walk);
  };
  walk(json);
  return out;
}

async function oembedOk(id) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function looksLikeMusic(title, a) {
  const t = `${title} ${a}`.toLowerCase();
  if (/official audio|official video|official music|lyric|vevo|topic|visualizer|live|mashup|megamix|soundtrack/.test(t))
    return true;
  if (/reaction|review|interview|podcast|gameplay|trailer reaction|explained/.test(t)) return false;
  return title.length > 2 && title.length < 120;
}

(async () => {
  const add = [];

  for (const t of must) {
    if (!t.id || t.id.includes(' ') || seen.has(t.id)) continue;
    const meta = await oembedOk(t.id);
    if (!meta) {
      console.log('skip invalid', t.id, t.title);
      continue;
    }
    seen.add(t.id);
    add.push({ g: t.g, id: t.id, title: t.title || meta.title, a: t.a });
  }
  console.log('must added', add.length, 'unique now', seen.size);

  for (const [g, q] of queries) {
    if (seen.size >= TARGET) break;
    let json;
    try {
      json = await ytSearch(q);
    } catch (e) {
      console.log('search fail', q, e.message);
      continue;
    }
    const vids = extractVideoIds(json);
    let got = 0;
    for (const v of vids) {
      if (seen.size >= TARGET) break;
      if (!v.id || seen.has(v.id)) continue;
      if (!looksLikeMusic(v.title, v.a)) continue;
      const meta = await oembedOk(v.id);
      if (!meta) continue;
      seen.add(v.id);
      const title = (v.title || meta.title || 'Track').slice(0, 90);
      const a = v.a ? String(v.a).replace(/ - Topic$/, '').slice(0, 60) : undefined;
      add.push(a ? { g, id: v.id, title, a } : { g, id: v.id, title });
      got++;
      if (got >= 12) break; // cap per query
    }
    console.log('q', q, 'got', got, 'unique', seen.size);
  }

  console.log('adding', add.length, 'projected', seen.size);

  if (!add.length) {
    console.log('nothing to add');
    process.exit(0);
  }

  const block =
    '  /* —— Popular fill pack 3 (toward 1000) —— */\n' +
    add
      .map((t) => {
        const a = t.a ? `, a: '${esc(t.a)}'` : '';
        return `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}'${a} },`;
      })
      .join('\n') +
    '\n';

  const needle = '];\n\nconst ALL =';
  if (!s.includes(needle)) {
    console.error('needle missing');
    process.exit(1);
  }
  s = s.replace(needle, block + '];\n\nconst ALL =');
  fs.writeFileSync(file, s);
  console.log('after unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
