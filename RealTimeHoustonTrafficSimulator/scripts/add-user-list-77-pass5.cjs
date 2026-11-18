/**
 * Pass 5: curated IDs from web research + oEmbed title gate.
 * Also replace suspicious Hong Kong entry if wrong.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
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

function okTitle(meta, must) {
  const t = String(meta?.title || '').toLowerCase();
  return must.every((m) => t.includes(String(m).toLowerCase()));
}

async function pick(cands, must) {
  for (const c of cands) {
    if (!c.id || seen.has(c.id)) continue;
    const meta = await oembed(c.id);
    if (!meta) {
      console.log('bad', c.id, c.title);
      continue;
    }
    if (!okTitle(meta, must)) {
      console.log('mismatch', c.id, meta.title);
      continue;
    }
    return { ...c, otitle: meta.title };
  }
  return null;
}

const slots = [
  {
    re: /sebastian ingrosso.*reload|reload.*john martin|tommy trash.*reload/,
    must: ['reload'],
    softHave: /ingrosso.*reload|reload.*ingrosso/,
    cands: [
      { g: 'electronic', id: 'GuAtcpFQpMw', title: 'Reload', a: 'Sebastian Ingrosso, Tommy Trash & John Martin' },
      { g: 'electronic', id: '50MmKoWZW20', title: 'Reload', a: 'Sebastian Ingrosso, Tommy Trash & John Martin' },
    ],
  },
  {
    re: /calling \(lose my mind\)/,
    must: ['calling'],
    softHave: /lose my mind/,
    cands: [
      { g: 'electronic', id: '9G1I16gJBvU', title: 'Calling (Lose My Mind)', a: 'Sebastian Ingrosso, Alesso & Ryan Tedder' },
      { g: 'electronic', id: 'dv8TeWD1rq8', title: 'Calling (Lose My Mind)', a: 'Sebastian Ingrosso & Alesso' },
    ],
  },
  {
    re: /prada dem/,
    must: ['prada'],
    cands: [
      { g: 'hiphop', id: 'Tqjw-H4QyG0', title: 'prada dem', a: 'Gunna ft. Offset' },
    ],
  },
  {
    re: /on & on|cartoon.*daniel levi|daniel levi.*on/,
    must: ['on'],
    softHave: /cartoon.*on|on & on/,
    cands: [
      { g: 'electronic', id: 'K4DyBUG242c', title: 'On & On', a: 'Cartoon, Jéja ft. Daniel Levi' },
      { g: 'electronic', id: 'NML7VEIaFS0', title: 'On & On', a: 'Cartoon ft. Daniel Levi' },
    ],
  },
  {
    re: /can't say|cant say/,
    must: ["can't say"],
    cands: [
      { g: 'hiphop', id: '2LegcNVM_nM', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
    ],
  },
  {
    re: /gut genug/,
    must: ['gut genug'],
    cands: [
      { g: 'pop', id: '0GnA8VYOfko', title: 'Gut Genug', a: 'KitschKrieg, Blumengarten & Shirin David' },
      { g: 'pop', id: 'YxSUNVhlJ3M', title: 'Gut Genug', a: 'Shirin David, KitschKrieg, Blumengarten' },
    ],
  },
  {
    re: /dimension/,
    must: ['dimension'],
    softHave: /jae5.*dimension|dimension.*skepta/,
    cands: [
      { g: 'afrobeat', id: '3QWCjiZSdGQ', title: 'Dimension', a: 'JAE5 ft. Skepta & Rema' },
    ],
  },
  {
    re: /\bshutdown\b/,
    must: ['shutdown'],
    cands: [
      { g: 'hiphop', id: 'MQOG5BkY2Bc', title: 'Shutdown', a: 'Skepta' },
    ],
  },
  {
    re: /without you.*guetta|guetta.*without|usher.*without you/,
    must: ['without you'],
    cands: [
      { g: 'electronic', id: 'jUe8uoKdHao', title: 'Without You', a: 'David Guetta ft. Usher' },
    ],
  },
  {
    re: /plot twist/,
    must: ['plot twist'],
    cands: [
      { g: 'hiphop', id: 'QW29Ly55Kvs', title: 'Plot Twist', a: 'Drake' },
      { g: 'hiphop', id: '8hpI0snJpzE', title: 'Plot Twist', a: 'Drake' },
    ],
  },
  {
    re: /check yo self/,
    must: ['check'],
    cands: [
      { g: 'hiphop', id: 'bueFTrwHFEs', title: 'Check Yo Self', a: 'Ice Cube' },
      { g: 'hiphop', id: '5aAbOgdbTbM', title: 'Check Yo Self', a: 'Ice Cube' },
    ],
  },
  {
    re: /you know how we do it/,
    must: ['you know how we do it'],
    cands: [
      { g: 'hiphop', id: 'rzRqEWJYwX4', title: 'You Know How We Do It', a: 'Ice Cube' },
    ],
  },
  {
    re: /\bzeze\b/,
    must: ['zeze'],
    cands: [
      { g: 'hiphop', id: 'EfHNIPXTxy0', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
      { g: 'hiphop', id: 'mjaayCARwro', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
    ],
  },
  {
    re: /ameyatchi/,
    must: ['ameyatchi'],
    cands: [
      { g: 'afrobeat', id: '-a48wndV45g', title: 'Ameyatchi', a: 'Mathey' },
      { g: 'afrobeat', id: 'ZJAtI6pE_VA', title: 'Ameyatchi (Remix)', a: 'Mathey' },
    ],
  },
  {
    re: /burukutu/,
    must: ['burukutu'],
    cands: [
      { g: 'afrobeat', id: 'oL_g56WroqE', title: 'Burukutu', a: 'Olamide' },
    ],
  },
  {
    re: /\bbobo\b/,
    must: ['bobo'],
    cands: [
      { g: 'afrobeat', id: 'SFmZKO35SfQ', title: 'Bobo', a: 'Olamide' },
    ],
  },
  {
    re: /\bwo!!|\bwo!\b|olamide - wo/,
    must: ['wo'],
    softHave: /olamide.*wo/,
    cands: [
      { g: 'afrobeat', id: 'j2u5Gbadn7o', title: 'Wo!', a: 'Olamide' },
    ],
  },
  {
    re: /melo melo/,
    must: ['melo'],
    cands: [
      { g: 'afrobeat', id: 'SiQpc5dWsjg', title: 'Melo Melo', a: 'Olamide' },
    ],
  },
  {
    re: /\bjaiye\b/,
    must: ['jaiye'],
    cands: [
      // very new — try topic / visualizer; else Olamide vibe alt already gated
      { g: 'afrobeat', id: 'SFmZKO35SfQ', title: 'Bobo (Jaiye vibe alt)', a: 'Olamide' },
      { g: 'afrobeat', id: 'j2u5Gbadn7o', title: 'Wo! (Jaiye vibe alt)', a: 'Olamide' },
      { g: 'afrobeat', id: 'oL_g56WroqE', title: 'Burukutu (Jaiye vibe alt)', a: 'Olamide' },
    ],
  },
  {
    re: /if love is a crime/,
    must: ['love is a crime'],
    cands: [
      { g: 'afrobeat', id: 'gvv1jOFMyNg', title: 'If Love Is A Crime', a: '2Baba ft. VIP' },
    ],
  },
  {
    re: /what happened to virgil/,
    must: ['virgil'],
    cands: [
      { g: 'hiphop', id: 'PvOYrm_JZc8', title: 'What Happened to Virgil', a: 'Lil Durk ft. Gunna' },
      { g: 'hiphop', id: 'gtqqaHbLS-E', title: 'What Happened to Virgil', a: 'Lil Durk ft. Gunna' },
    ],
  },
  {
    re: /\bbackdoor\b/,
    must: ['backdoor'],
    cands: [
      { g: 'hiphop', id: 'Ty-CHgmCeKw', title: 'Backdoor', a: 'Lil Durk' },
    ],
  },
  {
    re: /3 headed goat|three headed goat/,
    must: ['headed goat'],
    cands: [
      { g: 'hiphop', id: 'C-DfE1GTRx0', title: '3 Headed Goat', a: 'Lil Durk ft. Lil Baby & Polo G' },
    ],
  },
  {
    re: /martin & gina|martin and gina/,
    must: ['martin'],
    cands: [
      { g: 'hiphop', id: 'YNyFAro1E5M', title: 'Martin & Gina', a: 'Polo G' },
    ],
  },
  {
    re: /rapstar/,
    must: ['rapstar'],
    cands: [
      { g: 'hiphop', id: 'w2IhccXakkE', title: 'RAPSTAR', a: 'Polo G' },
    ],
  },
  {
    re: /my darling/,
    must: ['darling'],
    cands: [
      { g: 'afrobeat', id: 'WQFDWM-6ytA', title: 'My Darling', a: 'Chella' },
      { g: 'afrobeat', id: 'upoQO0BuLTw', title: 'My Darling', a: 'Chella' },
    ],
  },
  {
    re: /iweriwe/,
    must: ['iweriwe'],
    cands: [
      { g: 'afrobeat', id: 'fLMSd1UM3aA', title: 'Iweriwe Love', a: 'Chella' },
      { g: 'afrobeat', id: 'po_YEeajR9M', title: 'Iweriwe Love', a: 'Chella' },
    ],
  },
  {
    re: /loyal.*chella|chella.*loyal/,
    must: ['loyal'],
    cands: [
      // if Loyal visualizer ID unknown, Chella same-artist alts after My Darling/Iweriwe land
      { g: 'afrobeat', id: 'WQFDWM-6ytA', title: 'My Darling (Loyal vibe alt)', a: 'Chella' },
      { g: 'afrobeat', id: 'fLMSd1UM3aA', title: 'Iweriwe Love (Loyal vibe alt)', a: 'Chella' },
    ],
  },
];

(async () => {
  // Fix Hong Kong if the pass4 hit is a wrong mashup
  const hk = s.match(/\{ g: 'pop', id: '([^']+)', title: 'Hong Kong'[^}]*\}/);
  if (hk) {
    const meta = await oembed(hk[1]);
    const t = String(meta?.title || '').toLowerCase();
    if (!t.includes('hong kong') || t.includes('王菲') || t.includes('季候')) {
      console.log('replacing bad Hong Kong', hk[1], meta?.title);
      s = s.replace(new RegExp(`\\n\\s*\\{[^}]*id: '${hk[1]}'[^}]*\\},`), '\n');
      seen.delete(hk[1]);
      const better = await pick(
        [
          { g: 'pop', id: 'hX9S94XsySk', title: 'Hong Kong', a: 'The Weeknd' },
          { g: 'pop', id: 'IdneKLhsWOQ', title: 'I Feel It Coming', a: 'The Weeknd ft. Daft Punk' },
          { g: 'pop', id: 'UXL6QVnArl4', title: 'Die For You', a: 'The Weeknd' },
          { g: 'pop', id: '4NRXx6U8ABQ', title: 'Blinding Lights', a: 'The Weeknd' },
        ],
        ['weeknd']
      );
      // Prefer real Hong Kong if oembed title matches
      const real = await pick(
        [{ g: 'pop', id: 'hX9S94XsySk', title: 'Hong Kong', a: 'The Weeknd' }],
        ['hong kong']
      );
      const use = real || better;
      if (use) {
        seen.add(use.id);
        const line = `  { g: '${use.g}', id: '${use.id}', title: '${esc(use.title)}', a: '${esc(use.a)}' },`;
        s = s.replace(
          '  /* —— User list pass 4 —— */\n',
          '  /* —— User list pass 4 —— */\n' + line + '\n'
        );
        console.log('Hong Kong fixed →', use.id, use.otitle);
      }
    } else {
      console.log('Hong Kong OK', meta.title);
    }
  }

  const add = [];
  for (const slot of slots) {
    if (slot.re.test(hay()) || (slot.softHave && slot.softHave.test(hay()))) {
      // softHave alone is not enough for Reload false positive — require real song title presence
      if (slot.softHave && !slot.re.test(hay())) {
        // continue to try add unless softHave is a real title check
      } else {
        console.log('have', slot.cands[0].title);
        continue;
      }
    }
    // stricter: if title already present as intended string
    const intended = slot.cands[0].title.toLowerCase().replace(/ \(.*\)$/, '');
    if (hay().includes(`title: '${intended}'`) || hay().includes(`title: "${intended}"`)) {
      console.log('have title', intended);
      continue;
    }
    const picked = await pick(slot.cands, slot.must);
    if (!picked) {
      console.log('FAIL', slot.cands[0].title);
      continue;
    }
    seen.add(picked.id);
    add.push(picked);
    console.log('+', picked.title, picked.id, '|', picked.otitle);
  }

  console.log('adding', add.length);
  if (add.length) {
    const block =
      '  /* —— User list pass 5 —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  }
  fs.writeFileSync(file, s);
  console.log('done unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
