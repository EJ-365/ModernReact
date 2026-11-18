/** Add Walking on a Dream, BigXthaPlug, XXXTentacion, Zombie confirm, genre fillers. */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

const rows = [
  // requested
  ['electronic', 'eimgRedLkkU', 'Walking On A Dream', 'Empire of the Sun'],
  ['rock', '6Ejga4kJUts', 'Zombie', 'The Cranberries'],
  // BigXthaPlug
  ['hiphop', '3QwZjhHcLZk', 'The Largest', 'BigXthaPlug'],
  ['hiphop', 'x_WayannFys', 'Mmhmm', 'BigXthaPlug'],
  ['hiphop', 'begbi44ZLqw', 'Change Me', 'BigXthaPlug'],
  ['hiphop', 'JVDUsaqgSq0', '2AM', 'BigXthaPlug'],
  ['hiphop', 'EQEYX2n1eKw', 'State Made', 'BigXthaPlug'],
  ['hiphop', 'xQmDjrEOXU8', 'Home', 'BigXthaPlug'],
  ['hiphop', 'hX0aI5Jz8i8', 'Texas', 'BigXthaPlug'],
  ['hiphop', '-KjOMY_zxrA', 'Cold', 'BigXthaPlug'],
  ['hiphop', 'Z7MAZ-91b6Y', 'CRACCED', 'BigXthaPlug'],
  // XXXTentacion
  ['hiphop', 'iAeYPfrXwk4', 'SAD!', 'XXXTENTACION'],
  ['hiphop', 'GX8Hg6kWQYI', 'Moonlight', 'XXXTENTACION'],
  ['hiphop', 'qku2WZ7aRYw', 'Look At Me!', 'XXXTENTACION'],
  ['hiphop', 'FAucVNRx_mU', 'Jocelyn Flores', 'XXXTENTACION'],
  ['hiphop', 'f0bbDFRYD_A', 'changes', 'XXXTENTACION'],
  ['hiphop', 'CD_tD26E7k0', 'Revenge', 'XXXTENTACION'],
  ['hiphop', 'DW3tI9HCslo', 'SAD! (Alt Video)', 'XXXTENTACION'],
  // more genre fills
  ['electronic', 'SP6d5zyWdIo', 'Walking On A Dream (Lyrics)', 'Empire of the Sun'],
  ['electronic', 'V1bFr2SWP1I', 'We Are The People', 'Empire of the Sun'],
  ['pop', '09R8_2nJtjg', 'Sugar', 'Maroon 5'],
  ['pop', 'CevxZvSJLk8', 'Roar', 'Katy Perry'],
  ['pop', 'hT_nvWreIhg', 'Counting Stars', 'OneRepublic'],
  ['rock', 'eVTXPUF4Oz4', 'In The End', 'Linkin Park'],
  ['rock', 'fJ9rUzIMcZQ', 'Bohemian Rhapsody', 'Queen'],
  ['rock', '1w7OgIMMRc4', "Sweet Child O' Mine", 'Guns N\' Roses'],
  ['soul', 'UceaB4D0jpo', 'Fallin\'', 'Alicia Keys'],
  ['soul', 'HCjNJDNzu8g', 'Stay With Me', 'Sam Smith'],
  ['country', 'r7qovEziqVQ', 'Something in the Orange', 'Zach Bryan'],
  ['country', '7aekxC-vdAI', 'Fast Car', 'Luke Combs'],
  ['latin', 'saQsrNdQXZE', 'Pepas', 'Farruko'],
  ['latin', 'p7bfOZonHCc', 'Tití Me Preguntó', 'Bad Bunny'],
  ['gospel', 'n0FBb6hnwTo', 'Goodness of God', 'CeCe Winans'],
  ['gospel', 'sIaT8Jl2zpI', 'You Say', 'Lauren Daigle'],
  ['afrobeat', 'pekzpzNCNDQ', 'Peru', 'Fireboy DML'],
  ['afrobeat', 'QHb0PwCQPxg', 'Wave', 'Asake & Central Cee'],
  ['classics', 'OMOGaugKpzs', 'Every Breath You Take', 'The Police'],
  ['classics', 'd020hcWA_Wg', 'Clocks', 'Coldplay'],
  ['movies', 'yebNIHKAC4A', 'Golden', 'KPop Demon Hunters'],
  ['hiphop', 'xpVfcZ0ZcFM', "God's Plan", 'Drake'],
  ['hiphop', 'r_0JjYUe5jo', 'Godzilla', 'Eminem ft. Juice WRLD'],
];

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

(async () => {
  const add = [];
  for (const [g, id, title, a] of rows) {
    if (!id || seen.has(id)) continue;
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
      console.log('skip err', id, title);
      continue;
    }
    seen.add(id);
    add.push({ g, id, title, a });
  }
  console.log('adding', add.length, 'unique', seen.size);
  if (!add.length) return;
  const block =
    '  /* —— Empire / BigX / XXX / genre pack —— */\n' +
    add
      .map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`)
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
