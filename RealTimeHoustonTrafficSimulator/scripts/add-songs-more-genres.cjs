/** Key-free oEmbed append — more rap / pop / afrobeat / hiphop. */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

const rows = [
  ['pop', 'VHoT4N43jK8', 'Alors on danse', 'Stromae'],
  ['pop', '2I3xd4nLuOM', 'Formidable', 'Stromae'],
  ['pop', 'eVli-tstM5E', 'Espresso', 'Sabrina Carpenter'],
  ['pop', 'cW8VLC9nnTo', 'Please Please Please', 'Sabrina Carpenter'],
  ['hiphop', 'tvTRZJ-4EyI', 'HUMBLE.', 'Kendrick Lamar'],
  ['hiphop', 'NLZRYQMLDW4', 'DNA.', 'Kendrick Lamar'],
  ['hiphop', '6ONRf7h3Mdk', 'SICKO MODE', 'Travis Scott'],
  ['hiphop', 'Dst9gZkq1a8', 'goosebumps', 'Travis Scott'],
  ['hiphop', 'UceaB4D0jpo', "All The Stars", 'Kendrick Lamar & SZA'],
  ['hiphop', 'gfktsleR9f0', 'Money Trees', 'Kendrick Lamar'],
  ['hiphop', 'tvTRmFGT3n0', 'Not Like Us', 'Kendrick Lamar'],
  ['hiphop', 'H58vbez_m4E', 'luther', 'Kendrick Lamar & SZA'],
  ['hiphop', 'bKTdT2mu0ZI', 'Like That', 'Future & Metro Boomin'],
  ['hiphop', 'UjtOGPJ0URM', 'Type Shit', 'Future & Metro Boomin'],
  ['hiphop', '7fuHxP1a_P0', 'Too Many Nights', 'Don Toliver'],
  ['hiphop', 'gCYcHz2k5x0', 'Something in the Orange', 'Zach Bryan'],
  ['afrobeat', 'UzswywOA1qU', 'OZEBA', 'Rema'],
  ['afrobeat', 'MCMyKcUNR8w', 'WHY LOVE', 'Asake'],
  ['afrobeat', 'yEDHimUB4A4', 'Active (Alt)', 'Asake ft. Rema & Travis Scott'],
  ['afrobeat', 'E6WCzrW_2i4', 'Gratitude', 'Asake'],
  ['afrobeat', 'rkSCar68rYk', 'HALLELUJAH', 'Rema'],
  ['afrobeat', '2ZTcvsdMR1c', 'Heaven Baby', 'Ayra Starr'],
  ['afrobeat', 'SOJpE1KMUbo', 'Raindance', 'Dave ft. Tems'],
  ['pop', 'pB-5XG-DbAA', 'Stay With Me', 'Sam Smith'],
  ['pop', 'Cr8K88UcO0s', 'Tití Me Preguntó', 'Bad Bunny'],
  ['pop', 'saQsrNdQXZE', 'Pepas', 'Farruko'],
  ['pop', 'kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi'],
  ['pop', 'Oa_RSwwpPaA', 'Beautiful Things', 'Benson Boone'],
  ['pop', '9gWIIIr2Asw', 'Lose Control', 'Teddy Swims'],
  ['pop', 'U_Lz_MG35hM', 'Good Luck, Babe!', 'Chappell Roan'],
  ['pop', 'To4SWGZkEPk', 'Greedy', 'Tate McRae'],
  ['pop', 'NTpbbQUBbuo', 'Too Sweet', 'Hozier'],
  ['pop', 'PEM0Vs8jf1w', 'Golden Hour', 'JVKE'],
  ['pop', 'adLGHcj_fmA', 'Leave the Door Open', 'Silk Sonic'],
  ['pop', 'tQ0yjYUFKAE', 'Peaches', 'Justin Bieber'],
  ['hiphop', 'begbi44ZLqw', 'Change Me', 'BigXthaPlug'],
  ['hiphop', 'hX0aI5Jz8i8', 'Texas', 'BigXthaPlug'],
  ['hiphop', 'xQmDjrEOXU8', 'Home', 'BigXthaPlug'],
  ['hiphop', '-KjOMY_zxrA', 'Cold', 'BigXthaPlug'],
  ['hiphop', 'EQEYX2n1eKw', 'State Made', 'BigXthaPlug'],
  ['hiphop', 'cr82wSBZeeQ', 'Armed & Dangerous', 'Juice WRLD'],
  ['hiphop', 'ZengOKCUBHo', 'Righteous', 'Juice WRLD'],
  ['hiphop', 'C5i-UnuUKUI', 'Wishing Well', 'Juice WRLD'],
  ['hiphop', 'euSAgaub3m8', 'Hear Me Calling', 'Juice WRLD'],
  ['hiphop', 'OcQ71ubUXAE', 'Conversations', 'Juice WRLD'],
  ['hiphop', 'f0bbDFRYD_A', 'changes', 'XXXTENTACION'],
  ['hiphop', 'FAucVNRx_mU', 'Jocelyn Flores', 'XXXTENTACION'],
  ['hiphop', 'CD_tD26E7k0', 'Revenge', 'XXXTENTACION'],
  ['rock', '6Ejga4kJUts', 'Zombie', 'The Cranberries'],
  ['electronic', 'eimgRedLkkU', 'Walking On A Dream', 'Empire of the Sun'],
  ['gospel', 'sQwUD__WMD0', 'Promises', 'Maverick City Music'],
  ['gospel', 'BZT8jqsc8lQ', 'Your Spirit', 'Tasha Cobbs Leonard'],
];

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function ok(id) {
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

(async () => {
  console.log('before', seen.size);
  const add = [];
  for (const [g, id, title, a] of rows) {
    if (!id || seen.has(id)) continue;
    if (!(await ok(id))) {
      console.log('skip', id, title);
      continue;
    }
    seen.add(id);
    add.push({ g, id, title, a });
  }
  if (!add.length) {
    console.log('nothing new');
    return;
  }
  const block =
    '  /* —— More rap/pop/afrobeat —— */\n' +
    add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
    '\n';
  s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  fs.writeFileSync(file, s);
  console.log('added', add.length, 'unique', seen.size);
})();
