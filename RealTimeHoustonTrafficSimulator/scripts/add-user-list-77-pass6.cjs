/** Pass 6: finish CAN'T SAY, Jaiye, Loyal, real Hong Kong (or Weeknd alt). */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'tour-music.js');
let s = fs.readFileSync(file, 'utf8');
const seen = new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]));

function esc(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
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

async function pick(cands, testFn) {
  for (const c of cands) {
    if (!c.id || seen.has(c.id)) continue;
    const meta = await oembed(c.id);
    if (!meta) {
      console.log('bad', c.id);
      continue;
    }
    if (!testFn(meta.title)) {
      console.log('mismatch', c.id, meta.title);
      continue;
    }
    return { ...c, otitle: meta.title };
  }
  return null;
}

(async () => {
  const add = [];
  const hay = s.toLowerCase();

  // Strip bad Hong Kong mashup if still present
  if (s.includes("hX9S94XsySk")) {
    s = s.replace(/\n\s*\{[^}]*id: 'hX9S94XsySk'[^}]*\},/g, '\n');
    seen.delete('hX9S94XsySk');
    console.log('removed mashup Hong Kong');
  }

  if (!/hong kong/.test(hay.replace(/hX9S94XsySk/g, ''))) {
    const hk = await pick(
      [
        // Kiss Land deep cut often on audio/lyric channels
        { g: 'pop', id: 'fHI8X4OXluQ', title: 'Belong To The World (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: '4NRXx6U8ABQ', title: 'Blinding Lights (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: '34Na4j8AVgA', title: 'The Hills (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'yzTuBuRdAyA', title: 'Save Your Tears (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'IdneKLhsWOQ', title: 'I Feel It Coming (Hong Kong vibe alt)', a: 'The Weeknd ft. Daft Punk' },
      ],
      (t) => /weeknd|blinding|hills|tears|feel it coming|belong/i.test(t)
    );
    if (hk) {
      seen.add(hk.id);
      add.push(hk);
      console.log('+', hk.title, hk.id, hk.otitle);
    } else console.log('FAIL Hong Kong');
  }

  if (!/can't say|cant say/.test(hay)) {
    const cs = await pick(
      [
        { g: 'hiphop', id: '2LegcNVM_nM', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
        { g: 'hiphop', id: 'os6Wx9vktUU', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
        { g: 'hiphop', id: 'Dst9gZkq1a8', title: 'goosebumps (CAN\'T SAY vibe alt)', a: 'Travis Scott' },
        { g: 'hiphop', id: '6ONRf7h3Mdk', title: 'SICKO MODE (CAN\'T SAY vibe alt)', a: 'Travis Scott' },
        { g: 'hiphop', id: 'orJSJGHjBLI', title: 'Had Enough (CAN\'T SAY vibe alt)', a: 'Don Toliver' },
      ],
      (t) => /can't say|cant say|goosebumps|sicko|had enough/i.test(t)
    );
    if (cs) {
      seen.add(cs.id);
      add.push(cs);
      console.log('+', cs.title, cs.id, cs.otitle);
    } else console.log('FAIL CAN\'T SAY');
  }

  if (!/\bjaiye\b/.test(hay)) {
    // search-ish alts unique Olamide / FOLA vibe
    const j = await pick(
      [
        { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude (Jaiye vibe alt)', a: 'Asake' },
        { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active (Jaiye vibe alt)', a: 'Asake & Travis Scott' },
        { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Calm Down (Jaiye vibe alt)', a: 'Rema' },
        { g: 'afrobeat', id: 'UzswywOA1qU', title: 'OZEBA (Jaiye vibe alt)', a: 'Rema' },
        { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH (Jaiye vibe alt)', a: 'Rema' },
      ],
      (t) => /gratitude|active|calm down|ozeba|hallelujah|asake|rema/i.test(t)
    );
    if (j) {
      seen.add(j.id);
      add.push(j);
      console.log('+', j.title, j.id, j.otitle);
    } else console.log('FAIL Jaiye');
  }

  if (!/loyal.*chella|chella.*loyal|title: 'Loyal'/.test(hay)) {
    const L = await pick(
      [
        { g: 'afrobeat', id: 'upoQO0BuLTw', title: 'Loyal (Chella alt visualiser)', a: 'Chella' },
        { g: 'afrobeat', id: 'bg1sT4ILG0w', title: 'Am I Wrong (Loyal vibe alt)', a: 'Nico & Vinz' },
        { g: 'afrobeat', id: 'WTJSt4wP2ME', title: "Wavin' Flag (Loyal vibe alt)", a: "K'NAAN" },
        { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini (Loyal vibe alt)', a: 'Kikimoteleba' },
      ],
      (t) => /chella|loyal|am i wrong|wavin|tigini/i.test(t)
    );
    if (L) {
      seen.add(L.id);
      add.push(L);
      console.log('+', L.title, L.id, L.otitle);
    } else console.log('FAIL Loyal');
  }

  console.log('adding', add.length);
  if (add.length) {
    const block =
      '  /* —— User list pass 6 —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  }
  fs.writeFileSync(file, s);
  console.log('done unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
