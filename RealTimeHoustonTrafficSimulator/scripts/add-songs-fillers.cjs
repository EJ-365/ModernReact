const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));
const rows = [
  ['soul', 'pB-5XG-DbAA', 'Stay With Me', 'Sam Smith'],
  ['latin', 'Cr8K88UcO0s', 'Tití Me Preguntó', 'Bad Bunny'],
  ['latin', 'dJdqnRV1sk0', 'Pepas', 'Farruko'],
  ['country', 'gCYcHz2k5x0', 'Something in the Orange', 'Zach Bryan'],
  ['electronic', 'V1bFr2SWP1I', 'We Are The People', 'Empire of the Sun'],
  ['pop', '09R8_2nJtjg', 'Sugar', 'Maroon 5'],
  ['rock', 'fJ9rUzIMcZQ', 'Bohemian Rhapsody', 'Queen'],
];
function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
(async () => {
  const add = [];
  for (const [g, id, title, a] of rows) {
    if (seen.has(id)) continue;
    try {
      const r = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!r.ok) {
        console.log('skip', id, title);
        continue;
      }
    } catch {
      console.log('skip err', id);
      continue;
    }
    seen.add(id);
    add.push({ g, id, title, a });
  }
  if (add.length) {
    const block =
      '  /* —— Extra genre fills —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
    fs.writeFileSync(file, s);
  }
  console.log('added', add.length, 'unique', seen.size);
})();
