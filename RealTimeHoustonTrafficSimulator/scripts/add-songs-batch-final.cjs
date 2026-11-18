/** Key-free final batch — only oEmbed, no API keys. */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

const rows = [
  ['afrobeat', 'WcIcVapfqXw', 'Calm Down (Remix)', 'Rema & Selena Gomez'],
  ['afrobeat', 'UzswywOA1qU', 'OZEBA', 'Rema'],
  ['pop', 'S_xol6zt5HI', 'Formidable', 'Stromae'],
  ['pop', '51zjlMhdSTE', 'Espresso (Official Audio)', 'Sabrina Carpenter'],
  ['hiphop', 'T6eK-2OQtew', 'Not Like Us (Audio)', 'Kendrick Lamar'],
  ['hiphop', 'NLZRYQMLDW4', 'DNA.', 'Kendrick Lamar'],
  ['hiphop', 'Dst9gZkq1a8', 'goosebumps', 'Travis Scott'],
  ['hiphop', '6ONRf7h3Mdk', 'SICKO MODE', 'Travis Scott'],
  ['hiphop', 'UjtOGPJ0URM', 'Type Shit', 'Future Metro Boomin'],
  ['pop', 'cW8VLC9nnTo', 'Please Please Please', 'Sabrina Carpenter'],
  ['pop', 'Oa_RSwwpPaA', 'Beautiful Things', 'Benson Boone'],
  ['pop', '9gWIIIr2Asw', 'Lose Control', 'Teddy Swims'],
  ['pop', 'U_Lz_MG35hM', 'Good Luck Babe', 'Chappell Roan'],
  ['pop', 'To4SWGZkEPk', 'Greedy', 'Tate McRae'],
  ['pop', 'NTpbbQUBbuo', 'Too Sweet', 'Hozier'],
  ['pop', 'PEM0Vs8jf1w', 'Golden Hour', 'JVKE'],
  ['pop', 'adLGHcj_fmA', 'Leave the Door Open', 'Silk Sonic'],
  ['latin', 'Cr8K88UcO0s', 'Tití Me Preguntó', 'Bad Bunny'],
  ['soul', 'pB-5XG-DbAA', 'Stay With Me', 'Sam Smith'],
  ['afrobeat', 'rkSCar68rYk', 'HALLELUJAH', 'Rema'],
  ['afrobeat', 'yEDHimUB4A4', 'Active ft Rema Travis', 'Asake'],
  ['hiphop', 'h3EJICKwITw', 'All Girls Are The Same', 'Juice WRLD'],
  ['hiphop', 'Sw5fNI400E4', 'Bandit', 'Juice WRLD'],
  ['hiphop', 'iI34LYmJ1Fs', 'Robbery', 'Juice WRLD'],
  ['hiphop', 'ZengOKCUBHo', 'Righteous', 'Juice WRLD'],
  ['hiphop', 'C5i-UnuUKUI', 'Wishing Well', 'Juice WRLD'],
  ['hiphop', '3QwZjhHcLZk', 'The Largest', 'BigXthaPlug'],
  ['hiphop', 'F3qWBh7jZZ0', 'Young Black & Rich', 'Melly Mike'],
  ['pop', 'oiKj0Z_Xnjc', 'papaoutai', 'Stromae'],
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
  if (add.length) {
    const block =
      '  /* —— Genre continue pack —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
    fs.writeFileSync(file, s);
  }
  console.log('added', add.length, 'unique', seen.size);
})();
