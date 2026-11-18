/**
 * Pass 4: YouTube HTML search → oEmbed title match → add.
 * Also strips bad pass-3 mismatches.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');

/* Remove wrong pass-3 entries (oEmbed ID existed but wrong song) */
const badIds = ['iP6XpLQM2Cs', '2OEL4P1Rz04'];
for (const id of badIds) {
  const re = new RegExp(`\\n\\s*\\{[^}]*id: '${id}'[^}]*\\},`, 'g');
  s = s.replace(re, '\n');
  console.log('removed bad', id, !s.includes(id));
}

const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function hay() {
  return s.toLowerCase();
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
    'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(q) +
    '&sp=EgIQAQ%253D%253D';
  try {
    const r = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(20000),
    });
    const h = await r.text();
    const ids = [...h.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]);
    return [...new Set(ids)].slice(0, 12);
  } catch (e) {
    console.log('search fail', q, e.message);
    return [];
  }
}

function titleOk(title, needles) {
  const t = String(title || '').toLowerCase();
  return needles.every((n) => t.includes(String(n).toLowerCase()));
}

/** [detectRe, genre, preferred queries, titleMustInclude[], label, artist] */
const slots = [
  [
    /where have you been/,
    'pop',
    ['Rihanna Where Have You Been official music video'],
    ['where have you been', 'rihanna'],
    'Where Have You Been',
    'Rihanna',
  ],
  [
    /if i lose myself/,
    'electronic',
    ['OneRepublic Alesso If I Lose Myself official', 'Alesso If I Lose Myself'],
    ['lose myself'],
    'If I Lose Myself',
    'OneRepublic & Alesso',
  ],
  [
    /\breload\b/,
    'electronic',
    ['Sebastian Ingrosso Tommy Trash Reload John Martin official'],
    ['reload'],
    'Reload',
    'Sebastian Ingrosso, Tommy Trash & John Martin',
  ],
  [
    /calling \(lose my mind\)|lose my mind/,
    'electronic',
    ['Sebastian Ingrosso Alesso Calling Lose My Mind official'],
    ['calling'],
    'Calling (Lose My Mind)',
    'Sebastian Ingrosso, Alesso & Ryan Tedder',
  ],
  [
    /some of your love/,
    'soul',
    ['PARTYNEXTDOOR Some of Your Love official audio'],
    ['some of your love'],
    'Some of Your Love',
    'PARTYNEXTDOOR',
  ],
  [
    /\bdreamin\b|come and see me/,
    'soul',
    ['PARTYNEXTDOOR Dreamin official', 'PARTYNEXTDOOR Come and See Me Drake'],
    ['partynextdoor'],
    'Dreamin / Come and See Me',
    'PARTYNEXTDOOR',
  ],
  [
    /on one tonight/,
    'hiphop',
    ['Gunna on one tonight official audio'],
    ['on one tonight', 'gunna'],
    'on one tonight',
    'Gunna',
  ],
  [
    /hong kong/,
    'pop',
    ['The Weeknd Hong Kong official audio', 'The Weeknd Hong Kong Kiss Land'],
    ['hong kong'],
    'Hong Kong',
    'The Weeknd',
  ],
  [
    /\bwait\b.*m83|m83.*\bwait\b/,
    'electronic',
    ['M83 Wait official audio Hurry Up Were Dreaming'],
    ['wait', 'm83'],
    'Wait',
    'M83',
  ],
  [
    /outro.*m83|m83.*outro/,
    'electronic',
    ['M83 Outro official audio Hurry Up'],
    ['outro', 'm83'],
    'Outro',
    'M83',
  ],
  [
    /runaway.*aurora|aurora.*runaway/,
    'pop',
    ['AURORA Runaway official music video'],
    ['runaway', 'aurora'],
    'Runaway',
    'AURORA',
  ],
  [
    /voodoo/,
    'afrobeat',
    ['Chisway Voodoo JZyNo official', 'Voodoo Chisway JZyNo'],
    ['voodoo'],
    'Voodoo',
    'Chisway ft. JZyNo',
  ],
  [
    /prada dem/,
    'hiphop',
    ['Gunna prada dem Offset official', 'Gunna Offset prada dem'],
    ['prada'],
    'prada dem',
    'Gunna ft. Offset',
  ],
  [
    /on & on|cartoon.*daniel|daniel levi.*on/,
    'electronic',
    ['Cartoon On & On Daniel Levi NCS', 'Cartoon Jeja On and On'],
    ['on'],
    'On & On',
    'Cartoon, Jéja ft. Daniel Levi',
  ],
  [
    /can't say|cant say/,
    'hiphop',
    ['Travis Scott CAN\'T SAY Don Toliver Astroworld'],
    ["can't say", 'travis'],
    "CAN'T SAY",
    'Travis Scott ft. Don Toliver',
  ],
  [
    /gut genug/,
    'pop',
    ['KitschKrieg Gut Genug Blumengarten Shirin David'],
    ['gut genug'],
    'Gut Genug',
    'KitschKrieg, Blumengarten & Shirin David',
  ],
  [
    /dimension/,
    'afrobeat',
    ['JAE5 Dimension Skepta Rema official'],
    ['dimension'],
    'Dimension',
    'JAE5 ft. Skepta & Rema',
  ],
  [
    /\bshutdown\b/,
    'hiphop',
    ['Skepta Shutdown official music video'],
    ['shutdown', 'skepta'],
    'Shutdown',
    'Skepta',
  ],
  [
    /without you/,
    'electronic',
    ['David Guetta Without You Usher official'],
    ['without you'],
    'Without You',
    'David Guetta ft. Usher',
  ],
  [
    /plot twist/,
    'hiphop',
    ['Drake Plot Twist official audio', 'Drake Plot Twist'],
    ['plot twist', 'drake'],
    'Plot Twist',
    'Drake',
  ],
  [
    /check yo self/,
    'hiphop',
    ['Ice Cube Check Yo Self official', 'Ice Cube Check Yourself'],
    ['check'],
    'Check Yo Self',
    'Ice Cube',
  ],
  [
    /you know how we do it/,
    'hiphop',
    ['Ice Cube You Know How We Do It official'],
    ['you know how we do it'],
    'You Know How We Do It',
    'Ice Cube',
  ],
  [
    /\bzeze\b/,
    'hiphop',
    ['Kodak Black ZEZE Travis Scott Offset official'],
    ['zeze'],
    'ZEZE',
    'Kodak Black ft. Travis Scott & Offset',
  ],
  [
    /ameyatchi/,
    'afrobeat',
    ['Mathey Ameyatchi official', 'Ameyatchi Mathey'],
    ['ameyatchi'],
    'Ameyatchi',
    'Mathey',
  ],
  [
    /burukutu/,
    'afrobeat',
    ['Olamide Burukutu official video'],
    ['burukutu'],
    'Burukutu',
    'Olamide',
  ],
  [
    /\bjaiye\b/,
    'afrobeat',
    ['Olamide Jaiye FOLA official', 'Olamide Jaiye'],
    ['jaiye'],
    'Jaiye',
    'Olamide ft. FOLA',
  ],
  [
    /\bbobo\b/,
    'afrobeat',
    ['Olamide Bobo official video'],
    ['bobo', 'olamide'],
    'Bobo',
    'Olamide',
  ],
  [
    /\bwo!\b|olamide.*\bwo\b/,
    'afrobeat',
    ['Olamide Wo! official video', 'Olamide Wo official'],
    ['wo'],
    'Wo!',
    'Olamide',
  ],
  [
    /melo melo/,
    'afrobeat',
    ['Olamide Melo Melo official'],
    ['melo'],
    'Melo Melo',
    'Olamide',
  ],
  [
    /if love is a crime/,
    'afrobeat',
    ['2Baba If Love Is A Crime VIP official', '2baba If Love Is A Crime'],
    ['love is a crime'],
    'If Love Is A Crime',
    '2Baba ft. VIP',
  ],
  [
    /what happened to virgil/,
    'hiphop',
    ['Lil Durk What Happened to Virgil Gunna official'],
    ['virgil'],
    'What Happened to Virgil',
    'Lil Durk ft. Gunna',
  ],
  [
    /\bbackdoor\b/,
    'hiphop',
    ['Lil Durk Backdoor official music video'],
    ['backdoor', 'durk'],
    'Backdoor',
    'Lil Durk',
  ],
  [
    /3 headed goat|three headed goat/,
    'hiphop',
    ['Lil Durk 3 Headed Goat Lil Baby Polo G'],
    ['headed goat'],
    '3 Headed Goat',
    'Lil Durk ft. Lil Baby & Polo G',
  ],
  [
    /martin & gina|martin and gina/,
    'hiphop',
    ['Polo G Martin & Gina official music video'],
    ['martin', 'gina'],
    'Martin & Gina',
    'Polo G',
  ],
  [
    /rapstar/,
    'hiphop',
    ['Polo G RAPSTAR official music video'],
    ['rapstar'],
    'RAPSTAR',
    'Polo G',
  ],
  [
    /my darling/,
    'afrobeat',
    ['Chella My Darling official', 'Chella My Darling'],
    ['darling'],
    'My Darling',
    'Chella',
  ],
  [
    /iweriwe/,
    'afrobeat',
    ['Chella Iweriwe Love official', 'Iweriwe Love Chella'],
    ['iweriwe'],
    'Iweriwe Love',
    'Chella',
  ],
  [
    /loyal/,
    'afrobeat',
    ['Chella Loyal official audio', 'Chella Loyal'],
    ['loyal', 'chella'],
    'Loyal',
    'Chella',
  ],
];

(async () => {
  const add = [];
  for (const [re, g, queries, needles, title, a] of slots) {
    if (re.test(hay())) {
      console.log('have', title);
      continue;
    }
    let picked = null;
    for (const q of queries) {
      const ids = await ytSearch(q);
      for (const id of ids) {
        if (seen.has(id)) continue;
        const meta = await oembed(id);
        if (!meta) continue;
        if (!titleOk(meta.title, needles.length <= 2 ? needles : [needles[0]])) {
          // require primary needle; prefer all
          const primary = needles[0];
          if (!String(meta.title).toLowerCase().includes(String(primary).toLowerCase())) continue;
        }
        // soft artist check when possible
        const tl = meta.title.toLowerCase();
        if (needles.length > 1) {
          const second = needles[1].toLowerCase();
          if (!tl.includes(second) && !tl.includes(a.split(' ')[0].toLowerCase())) {
            // still accept if primary is strong unique title
            if (!['zeze', 'burukutu', 'ameyatchi', 'iweriwe', 'gut genug', 'prada', 'virgil', 'rapstar'].includes(primary.toLowerCase())) {
              continue;
            }
          }
        }
        picked = { g, id, title, a, otitle: meta.title };
        break;
      }
      if (picked) break;
    }
    // vibe alt search if original failed
    if (!picked) {
      const altQ = a.split(/[,&]/)[0].trim() + ' official music video';
      const ids = await ytSearch(altQ);
      for (const id of ids) {
        if (seen.has(id)) continue;
        const meta = await oembed(id);
        if (!meta) continue;
        const artistBit = a.split(/[,&]/)[0].trim().toLowerCase();
        if (!meta.title.toLowerCase().includes(artistBit.split(' ')[0])) continue;
        picked = {
          g,
          id,
          title: meta.title.slice(0, 80),
          a: a.split(/[,&]/)[0].trim() + ' (similar alt)',
          otitle: meta.title,
        };
        break;
      }
    }
    if (!picked) {
      console.log('FAIL', title);
      continue;
    }
    seen.add(picked.id);
    add.push(picked);
    console.log('+', title, '→', picked.id, '|', picked.otitle);
  }

  console.log('adding', add.length);
  if (add.length) {
    const block =
      '  /* —— User list pass 4 —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  }
  fs.writeFileSync(file, s);
  console.log('done unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
