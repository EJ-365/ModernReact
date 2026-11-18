/**
 * Key-free catalog append: oEmbed verify only (no YouTube API keys).
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));
console.log('before unique', seen.size);

const rows = [
  // requested
  ['pop', 'oiKj0Z_Xnjc', 'papaoutai', 'Stromae'],
  ['pop', 'GgN17pQ2EPg', 'PAPAOUTAI (Official)', 'Stromae'],
  ['hiphop', 'F3qWBh7jZZ0', 'Young Black & Rich', 'Melly Mike'],
  // afrobeat
  ['afrobeat', 'JRF_sdTXpGw', 'Active', 'Asake & Travis Scott'],
  ['afrobeat', 'UzswywOA1qU', 'OZEBA', 'Rema'],
  ['afrobeat', 'MCMyKcUNR8w', 'WHY LOVE', 'Asake'],
  ['afrobeat', 'CQLsdm1ZYAw', 'Calm Down', 'Rema'],
  ['afrobeat', 'jipQpjUA_o8', 'Essence', 'Wizkid'],
  ['afrobeat', 'crtQSTYWtqE', 'Rush', 'Ayra Starr'],
  ['afrobeat', 'D-YDEyuDxWU', 'Love Nwantiti', 'CKay'],
  ['afrobeat', 'XoiOOiuH8iI', 'Water', 'Tyla'],
  ['afrobeat', 'bbVZo4Yw7pI', 'Lonely At The Top', 'Asake'],
  ['afrobeat', 'fXl5dPuiJa0', 'Joha', 'Asake'],
  ['afrobeat', '3Iyuym-Gci0', 'Fall', 'Davido'],
  ['afrobeat', '1VrWaED18_g', 'Soco', 'Wizkid'],
  ['afrobeat', 'lPe09eE6Xio', 'Ye', 'Burna Boy'],
  ['afrobeat', 'pekzpzNCNDQ', 'Peru', 'Fireboy DML'],
  ['afrobeat', 'QHb0PwCQPxg', 'Wave', 'Asake & Central Cee'],
  ['afrobeat', 'mMJ3Gogi2Qk', "Sittin' On Top Of The World", 'Burna Boy'],
  // hiphop / rap
  ['hiphop', '3QwZjhHcLZk', 'The Largest', 'BigXthaPlug'],
  ['hiphop', 'x_WayannFys', 'Mmhmm', 'BigXthaPlug'],
  ['hiphop', 'JVDUsaqgSq0', '2AM', 'BigXthaPlug'],
  ['hiphop', 'xpVfcZ0ZcFM', "God's Plan", 'Drake'],
  ['hiphop', 'S-sJp1FfG7Q', 'Hotline Bling', 'Drake'],
  ['hiphop', 'uxpfa-e0mXc', 'In My Feelings', 'Drake'],
  ['hiphop', 'U9BwWKXjVaI', 'Nice For What', 'Drake'],
  ['hiphop', '_Yhyp-_hX2s', 'Lose Yourself', 'Eminem'],
  ['hiphop', 'XbGs_qK2PQA', 'Rap God', 'Eminem'],
  ['hiphop', 'j5-yKhDd64s', 'Not Afraid', 'Eminem'],
  ['hiphop', 'eJO5HU_7_1w', 'The Real Slim Shady', 'Eminem'],
  ['hiphop', 'r_0JjYUe5jo', 'Godzilla', 'Eminem ft. Juice WRLD'],
  ['hiphop', 'mzB1VGEGcSU', 'Lucid Dreams', 'Juice WRLD'],
  ['hiphop', 'Sw5fNI400E4', 'Bandit', 'Juice WRLD'],
  ['hiphop', 'iI34LYmJ1Fs', 'Robbery', 'Juice WRLD'],
  ['hiphop', 'GX8Hg6kWQYI', 'Moonlight', 'XXXTENTACION'],
  ['hiphop', 'iAeYPfrXwk4', 'SAD!', 'XXXTENTACION'],
  ['hiphop', 'qku2WZ7aRYw', 'Look At Me!', 'XXXTENTACION'],
  ['hiphop', 'EOxj2ROIxok', 'Savage', 'Megan Thee Stallion'],
  ['hiphop', 'DmWWqogr_r8', 'a lot', '21 Savage'],
  ['hiphop', 'tuXE6mcdkac', 'HUMBLE.', 'Kendrick Lamar'],
  ['hiphop', 'tvTRZJ-4EyI', 'DNA.', 'Kendrick Lamar'],
  ['hiphop', 'ZAcAm3mW69I', 'Alright', 'Kendrick Lamar'],
  ['hiphop', '6ONRf7h3Mdk', 'SICKO MODE', 'Travis Scott'],
  ['hiphop', 'Dst9gZkq1a8', 'goosebumps', 'Travis Scott'],
  ['hiphop', 'w87fOAG8MqQ', 'Mask Off', 'Future'],
  ['hiphop', 'fKopy74weus', 'Congratulations', 'Post Malone'],
  ['hiphop', 'Uq9gPaIzbe8', 'Unholy', 'Sam Smith'],
  ['hiphop', 'RgKAFK5djSk', 'See You Again', 'Wiz Khalifa'],
  ['hiphop', '8UFIYGkROII', 'Crank That', 'Soulja Boy'],
  ['hiphop', 'uelHwf8o7_U', 'Love The Way You Lie', 'Eminem'],
  // pop
  ['pop', 'aSugSGCC12I', 'Manchild', 'Sabrina Carpenter'],
  ['pop', 'F2OjJMFYUno', 'Espresso', 'Sabrina Carpenter'],
  ['pop', 'cW8VLC9nnTo', 'Please Please Please', 'Sabrina Carpenter'],
  ['pop', '4NRXx6U8ABQ', 'Blinding Lights', 'The Weeknd'],
  ['pop', 'fHI8X4OXluQ', 'Blinding Lights (Audio)', 'The Weeknd'],
  ['pop', 'JGwWNGJdvx8', 'Shape of You', 'Ed Sheeran'],
  ['pop', '2Vv-BfVoq4g', 'Perfect', 'Ed Sheeran'],
  ['pop', 'k2qgadSvNyU', 'New Rules', 'Dua Lipa'],
  ['pop', 'QYh6mYIJG2Y', '7 rings', 'Ariana Grande'],
  ['pop', 'mRD0-GxqHVo', 'Heat Waves', 'Glass Animals'],
  ['pop', 'OPf0YbXqDm0', 'Uptown Funk', 'Mark Ronson'],
  ['pop', 'kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi'],
  ['pop', '9bZkp7q19f0', 'Gangnam Style', 'PSY'],
  ['pop', 'ZbZSe6N_BXs', 'Happy', 'Pharrell'],
  ['pop', 'CevxZvSJLk8', 'Roar', 'Katy Perry'],
  ['pop', '09R8_2nJtjg', 'Sugar', 'Maroon 5'],
  ['pop', 'SlPhMPnQ58k', 'Memories', 'Maroon 5'],
  ['pop', 'iWZmdoY1aTE', 'Girls Like You', 'Maroon 5'],
  ['pop', 'yzTuBuRdAyA', 'Save Your Tears', 'The Weeknd'],
  ['pop', 'XXYlFuWEuKI', 'Starboy', 'The Weeknd'],
  ['pop', 'eimgRedLkkU', 'Walking On A Dream', 'Empire of the Sun'],
  ['pop', 'pt8VYOfr8As', '7 Years', 'Lukas Graham'],
  ['pop', 'oofSnsGkops', "You're Beautiful", 'James Blunt'],
  ['pop', 'hT_nvWreIhg', 'Counting Stars', 'OneRepublic'],
  ['pop', 'rYEDA3JcQqw', 'Rolling in the Deep', 'Adele'],
  ['pop', 'YQHsXMglC9A', 'Hello', 'Adele'],
  ['pop', 'hLQl3WQQoQ0', 'Someone Like You', 'Adele'],
  // more rap / hiphop deep cuts that often work
  ['hiphop', 'LsoLMceJGFM', 'The Box', 'Roddy Ricch'],
  ['hiphop', '3tmd-ClpJxA', 'Rockstar', 'DaBaby'],
  ['hiphop', 'tBm_R1X0x0E', 'Ballin', 'Mustard & Roddy Ricch'],
  ['hiphop', 'KTZ-yKEasDM', 'Industry Baby', 'Lil Nas X'],
  ['hiphop', 'HCq1Ic0oBQE', 'Old Town Road', 'Lil Nas X'],
  ['hiphop', 'RubBkkFFV08', 'Sunflower', 'Post Malone'],
  ['hiphop', 'CD-E-LDmxlA', 'Circles', 'Post Malone'],
  ['hiphop', 'wJnBTPUQSUk', 'Psycho', 'Post Malone'],
  ['hiphop', '7wtfhZwyrcc', 'Believer', 'Imagine Dragons'],
  // electronic / dance-pop adjacent
  ['electronic', '60ItHLz5WEA', 'Wake Me Up', 'Avicii'],
  ['electronic', 'IcrbM1l_BoI', 'Wake Me Up (Video)', 'Avicii'],
  ['electronic', 'YykjpewL_gQ', 'Elastic Heart', 'Sia'],
  ['electronic', 'GCdwKhFsLLw', 'Cheap Thrills', 'Sia'],
  ['electronic', '2vjPBrBU-TM', 'Chandelier', 'Sia'],
  ['electronic', '5dbEhBKGOtY', 'Play Hard', 'David Guetta'],
  ['electronic', 'UtF6Jej8yb4', 'The Nights', 'Avicii'],
  ['electronic', 'cHHLHGNpCSA', 'Waiting For Love', 'Avicii'],
  // french / euro pop extras with Stromae
  ['pop', 'Vemg3As4cis', 'Alors On Danse', 'Stromae'],
  ['pop', 'tF5-9hOkyJk', 'Formidable', 'Stromae'],
  ['pop', 'o3mP3mJDL2k', 'tous les mêmes', 'Stromae'],
];

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

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

(async () => {
  const add = [];
  for (const [g, id, title, a] of rows) {
    if (!id || seen.has(id)) continue;
    if (!(await oembedOk(id))) {
      console.log('skip', id, title);
      continue;
    }
    seen.add(id);
    add.push({ g, id, title, a });
  }
  console.log('adding', add.length, 'projected', seen.size);
  if (!add.length) return;

  const block =
    '  /* —— Papaoutai / Young Black & Rich / genre pack —— */\n' +
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
