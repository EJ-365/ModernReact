/** Pass 2: fill remaining misses with verified oEmbed IDs (key-free). */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));
const hay = s.toLowerCase();

function missing(re) {
  return !re.test(hay);
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

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const rows = [
  // originals still missing / wrong-matched
  missing(/internet money|gunna.*lemonade|lemonade.*gunna|lemonade.*don toliver/) && {
    g: 'hiphop',
    id: '0opZqh_TprM',
    title: 'Lemonade',
    a: 'Internet Money, Gunna & Don Toliver ft. NAV',
  },
  missing(/clarity/) && { g: 'electronic', id: 'IckjsSvCgAI', title: 'Clarity', a: 'Zedd ft. Foxes' },
  missing(/clarity/) && { g: 'electronic', id: 'iUj6RzcYejg', title: 'Stay The Night', a: 'Zedd ft. Hayley Williams' },
  missing(/this is what it feels like/) && {
    g: 'electronic',
    id: 'YqcTSBmXh_s',
    title: 'This Is What It Feels Like',
    a: 'Armin van Buuren ft. Trevor Guthrie',
  },
  missing(/where have you been/) && { g: 'pop', id: 'HBxt_v0cjL0', title: 'Where Have You Been', a: 'Rihanna' },
  missing(/where have you been/) && { g: 'pop', id: 'lWA2fjXjcBM', title: 'Stay', a: 'Rihanna' },
  missing(/don't you worry child|dont you worry child/) && {
    g: 'electronic',
    id: '1y6smkh6c-0',
    title: "Don't You Worry Child",
    a: 'Swedish House Mafia ft. John Martin',
  },
  missing(/if i lose myself/) && { g: 'electronic', id: 'Dhbt-RzVPBI', title: 'If I Lose Myself', a: 'OneRepublic & Alesso' },
  missing(/\breload\b/) && {
    g: 'electronic',
    id: '9P8dpdwnzHY',
    title: 'Reload',
    a: 'Sebastian Ingrosso, Tommy Trash & John Martin',
  },
  missing(/calling \(lose my mind\)|lose my mind/) && {
    g: 'electronic',
    id: 'kmatdACwqT4',
    title: 'Calling (Lose My Mind)',
    a: 'Sebastian Ingrosso & Alesso',
  },
  missing(/the nights/) && { g: 'electronic', id: 'cHHLHGNpCSA', title: 'Waiting For Love', a: 'Avicii' },
  missing(/break from toronto/) && { g: 'soul', id: 'lXYq9ImJIN8', title: 'Break From Toronto', a: 'PARTYNEXTDOOR' },
  missing(/some of your love/) && { g: 'soul', id: 'QDy3yc1L1bw', title: 'Some of Your Love', a: 'PARTYNEXTDOOR' },
  missing(/dreamin/) && { g: 'soul', id: 'GczV6h7Kp0A', title: 'Come and See Me', a: 'PARTYNEXTDOOR ft. Drake' },
  missing(/fukumean/) && { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
  missing(/on one tonight/) && { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
  missing(/starboy/) && { g: 'pop', id: '34Na4j8AVgA', title: 'The Hills', a: 'The Weeknd' },
  missing(/save your tears/) && { g: 'pop', id: 'yzTuBuRdAyA', title: 'Save Your Tears', a: 'The Weeknd' },
  missing(/midnight city/) && { g: 'electronic', id: 'dX3k_QDnzHE', title: 'Midnight City', a: 'M83' },
  missing(/\bwait\b.*m83|m83.*\bwait\b/) && { g: 'electronic', id: '1oHNdKl1xKE', title: 'Wait', a: 'M83' },
  missing(/outro/) && { g: 'electronic', id: 'wA5hZyH9VBw', title: 'Outro', a: 'M83' },
  missing(/forever young/) && { g: 'classics', id: '4Nfa0E5g5qM', title: 'Forever Young', a: 'Alphaville' },
  missing(/forever young/) && { g: 'classics', id: 'Kzq15y2J4UM', title: 'Young Forever', a: 'JAY-Z' },
  missing(/runaway/) && { g: 'pop', id: 'd_HlPboLIjI', title: 'Runaway', a: 'AURORA' },
  missing(/stressed out/) && { g: 'rock', id: 'UprtoiFByos', title: 'Ride', a: 'Twenty One Pilots' },
  missing(/on & on|on and on/) && { g: 'electronic', id: 'Jpp4pu1e0ws', title: 'On & On', a: 'Cartoon ft. Daniel Levi' },
  missing(/can't say|cant say/) && { g: 'hiphop', id: 'Dst9gZkq1a8', title: 'goosebumps', a: 'Travis Scott' },
  missing(/stargazing/) && { g: 'hiphop', id: '6ONRf7h3Mdk', title: 'SICKO MODE', a: 'Travis Scott' },
  missing(/yosemite/) && { g: 'hiphop', id: 'tN9EC3GjCNg', title: 'YOSEMITE', a: 'Travis Scott' },
  missing(/bad and boujee/) && { g: 'hiphop', id: 'SDxcl9iZYUA', title: 'Bad and Boujee', a: 'Migos ft. Lil Uzi Vert' },
  missing(/without you/) && { g: 'electronic', id: 'jUe8uo4D4MI', title: 'Without You', a: 'David Guetta ft. Usher' },
  missing(/laugh now cry later/) && {
    g: 'hiphop',
    id: 'DKSJL4m8LkA',
    title: 'Laugh Now Cry Later',
    a: 'Drake ft. Lil Durk',
  },
  missing(/middle child/) && { g: 'hiphop', id: 'tvTRZJ-4EyI', title: 'HUMBLE.', a: 'Kendrick Lamar' },
  missing(/check yo self/) && { g: 'hiphop', id: '3g4daf0asxE', title: 'Check Yo Self', a: 'Ice Cube' },
  missing(/you know how we do it/) && { g: 'hiphop', id: 'ZSs9cQqcP2w', title: 'You Know How We Do It', a: 'Ice Cube' },
  missing(/\bdoja\b/) && { g: 'hiphop', id: 'QHb0PwCQPxg', title: 'Wave', a: 'Asake & Central Cee' },
  missing(/it ain't me|it aint me/) && { g: 'electronic', id: 'BgfcToAjfdc', title: 'Stole The Show', a: 'Kygo' },
  missing(/\bzeze\b/) && { g: 'hiphop', id: 'mIXXAHnz0mE', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
  missing(/martin & gina|martin and gina/) && { g: 'hiphop', id: 'mA0w8jZ5v8E', title: 'Martin & Gina', a: 'Polo G' },
  missing(/rapstar/) && { g: 'hiphop', id: 'aTvezyfgwx0', title: 'RAPSTAR', a: 'Polo G' },
  missing(/pop out/) && { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
  missing(/all girls are the same/) && { g: 'hiphop', id: 'mzB1VGEGcSU', title: 'Lucid Dreams', a: 'Juice WRLD' },
  missing(/sky full of stars/) && { g: 'rock', id: 'd020hcWA_Wg', title: 'Clocks', a: 'Coldplay' },
  // always-try extras for similar vibe fills
  { g: 'electronic', id: 'n4RjJKxsamQ', title: 'Save The World', a: 'Swedish House Mafia' },
  { g: 'electronic', id: 'rrZ3UbfVGFc', title: 'Under Control', a: 'Calvin Harris & Alesso' },
  { g: 'electronic', id: 'h7ARLC7bMDw', title: 'Years', a: 'Alesso' },
  { g: 'hiphop', id: 'SDxcl9iZYUA', title: 'Bad and Boujee', a: 'Migos ft. Lil Uzi Vert' },
  { g: 'hiphop', id: 'mIXXAHnz0mE', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
  { g: 'hiphop', id: 'DKSJL4m8LkA', title: 'Laugh Now Cry Later', a: 'Drake ft. Lil Durk' },
  { g: 'classics', id: 'QNJL6nfu__Q', title: "They Don't Care About Us", a: 'Michael Jackson' },
  { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
  { g: 'pop', id: 'bg1sT4ILG0w', title: 'Am I Wrong', a: 'Nico & Vinz' },
  { g: 'rock', id: 'VPRjCeoBqrI', title: 'A Sky Full of Stars', a: 'Coldplay' },
  { g: 'classics', id: 'wp43OdtAAkM', title: 'Running Up That Hill', a: 'Kate Bush' },
  { g: 'pop', id: 'WTJSt4wP2ME', title: "Wavin' Flag", a: "K'NAAN" },
  { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
  { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
  { g: 'soul', id: 'lXYq9ImJIN8', title: 'Break From Toronto', a: 'PARTYNEXTDOOR' },
  { g: 'pop', id: 'T3E9Wjbq44E', title: 'Stereo Hearts', a: 'Gym Class Heroes ft. Adam Levine' },
  { g: 'electronic', id: 'AtKZKl7Bgu0', title: 'I Need Your Love', a: 'Calvin Harris ft. Ellie Goulding' },
  { g: 'hiphop', id: 'S4asq3SicN0', title: 'Goodbyes', a: 'Post Malone ft. Young Thug' },
  { g: 'hiphop', id: '0opZqh_TprM', title: 'Lemonade', a: 'Internet Money, Gunna & Don Toliver ft. NAV' },
  { g: 'pop', id: 'UrGS_6_HglU', title: 'Control', a: 'Zoe Wees' },
  { g: 'hiphop', id: 'Om0rYw6qzb8', title: 'Hotel Lobby', a: 'Quavo & Takeoff' },
  { g: 'hiphop', id: '9hJ8lLNWrM4', title: 'Pure Water', a: 'Mustard & Migos' },
  { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
  { g: 'hiphop', id: 'Kbj2Zss-5GY', title: 'Praise The Lord (Da Shine)', a: 'A$AP Rocky ft. Skepta' },
  { g: 'hiphop', id: '_VuJA-VQRcY', title: 'Doja', a: 'Central Cee' },
  { g: 'hiphop', id: '2a8PgqWrc_4', title: 'STARGAZING', a: 'Travis Scott' },
  { g: 'electronic', id: 'Jpp4pu1e0ws', title: 'On & On', a: 'Cartoon ft. Daniel Levi' },
].filter(Boolean);

(async () => {
  const add = [];
  for (const t of rows) {
    if (!t.id || seen.has(t.id)) continue;
    if (!(await ok(t.id))) {
      console.log('skip', t.id, t.title);
      continue;
    }
    seen.add(t.id);
    add.push(t);
    console.log('+', t.title);
  }
  console.log('adding', add.length, 'unique', seen.size);
  if (!add.length) return;
  const block =
    '  /* —— User list pass 2 —— */\n' +
    add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
    '\n';
  s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  fs.writeFileSync(file, s);
  console.log('done', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
