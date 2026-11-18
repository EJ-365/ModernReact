/** Small fixups for remaining requested IDs (Pilé, GTA Petty, Armed & Dangerous, Come What May). */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

const rows = [
  { g: 'afrobeat', id: 'jodJzaVZfj8', title: "Pilé", a: 'Mauvais Djo' },
  { g: 'gospel', id: '-yGJGZ44Otw', title: "Pilé (Gospel Version)", a: 'Mauvais Djo & Kano Choir' },
  { g: 'movies', id: 'xAgUYyosqVM', title: 'Love Is A Long Road (GTA VI)', a: 'Tom Petty' },
  { g: 'movies', id: '7LEgcd9RD8k', title: 'GTA VI — Love Is A Long Road', a: 'Tom Petty' },
  { g: 'movies', id: 's6EFp4Nwonw', title: 'Come What May', a: 'Nicole Kidman & Ewan McGregor' },
  { g: 'movies', id: '2lGP78ckF_Q', title: 'Come What May (Moulin Rouge)', a: 'Ewan McGregor & Nicole Kidman' },
  { g: 'hiphop', id: 'cr82wSBZeeQ', title: 'Armed & Dangerous', a: 'Juice WRLD' },
  { g: 'classics', id: 'Qt2mbGP6vFI', title: 'Another Day In Paradise', a: 'Phil Collins' },
  { g: 'rock', id: 'qnkuBUAwfe0', title: 'One Last Breath', a: 'Creed' },
  { g: 'hiphop', id: '0qEJBtfQ5FM', title: "Beez In The Trap X What's Up Mashup" },
];

async function oembedOk(id) {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { signal: AbortSignal.timeout(10000) }
    );
    return r.ok;
  } catch {
    return false;
  }
}

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

(async () => {
  const add = [];
  for (const t of rows) {
    if (seen.has(t.id)) continue;
    if (!(await oembedOk(t.id))) {
      console.log('skip', t.id, t.title);
      continue;
    }
    seen.add(t.id);
    add.push(t);
  }
  console.log('adding', add.length, 'unique', seen.size);
  if (!add.length) return;
  const block =
    '  /* —— Requested fixups —— */\n' +
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
})();
