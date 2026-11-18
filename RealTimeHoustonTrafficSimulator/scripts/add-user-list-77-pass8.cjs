/** Pass 8: fix bad Reminder-as-Wicked, add Motigbana Jaiye alt, upgrade CAN'T SAY, Weeknd deep cut. */
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

(async () => {
  const add = [];

  // Remove Reminder mislabeled as Wicked Games / Hong Kong
  if (s.includes("JZjAg6fK-BQ")) {
    s = s.replace(/\n\s*\{[^}]*id: 'JZjAg6fK-BQ'[^}]*\},/g, '\n');
    seen.delete('JZjAg6fK-BQ');
    console.log('removed bad Reminder/Hong Kong');
  }

  async function addOne(cands, re) {
    for (const c of cands) {
      if (seen.has(c.id)) continue;
      const meta = await oembed(c.id);
      if (!meta) {
        console.log('bad', c.id);
        continue;
      }
      if (!re.test(meta.title)) {
        console.log('mismatch', c.id, meta.title);
        continue;
      }
      seen.add(c.id);
      add.push(c);
      console.log('+', c.title, c.id, '|', meta.title);
      return true;
    }
    return false;
  }

  // CAN'T SAY official
  if (/os6Wx9vktUU/.test(s) || !/can't say|cant say/i.test(s)) {
    if (/os6Wx9vktUU/.test(s)) {
      s = s.replace(/\n\s*\{[^}]*id: 'os6Wx9vktUU'[^}]*\},/g, '\n');
      seen.delete('os6Wx9vktUU');
    }
    const ok = await addOne(
      [
        { g: 'hiphop', id: '2LegcNVM_nM', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
        { g: 'hiphop', id: 'os6Wx9vktUU', title: "CAN'T SAY", a: 'Travis Scott ft. Don Toliver' },
        { g: 'hiphop', id: 'Dst9gZkq1a8', title: 'goosebumps (CAN\'T SAY vibe alt)', a: 'Travis Scott' },
      ],
      /can't say|cant say|goosebumps/i
    );
    if (!ok) console.log('FAIL CAN\'T SAY');
  } else console.log('have CAN\'T SAY');

  // Hong Kong vibe — verify title carefully
  if (!/hong kong|kiss land|wicked games|the morning\b|title: 'Often'/.test(s.toLowerCase())) {
    const ok = await addOne(
      [
        { g: 'pop', id: '34Na4j8AVgA', title: 'The Hills (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: '4NRXx6U8ABQ', title: 'Blinding Lights (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'yzTuBuRdAyA', title: 'Save Your Tears (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'UXYG5v6IDsM', title: "Can't Feel My Face (Hong Kong vibe alt)", a: 'The Weeknd' },
        { g: 'pop', id: 'IdneKLhsWOQ', title: 'Wildest Dreams skip', a: 'Taylor Swift' },
      ],
      /hills|blinding lights|save your tears|can't feel my face|weeknd/i
    );
    if (!ok) console.log('FAIL Hong Kong');
  } else console.log('have Hong Kong vibe');

  // Jaiye → Motigbana same-artist alt
  if (!/\bjaiye\b|motigbana/i.test(s)) {
    const ok = await addOne(
      [
        { g: 'afrobeat', id: 'DR5dPcoIjOQ', title: 'Motigbana (Jaiye vibe alt)', a: 'Olamide' },
        { g: 'afrobeat', id: 'SiQpc5dWsjg', title: 'Melo Melo', a: 'Olamide' },
        { g: 'afrobeat', id: 'j2u5Gbadn7o', title: 'Wo!', a: 'Olamide' },
      ],
      /motigbana|melo melo|wo!!|wo!|olamide/i
    );
    if (!ok) console.log('FAIL Jaiye');
  } else console.log('have Jaiye/Motigbana');

  if (add.length) {
    const block =
      '  /* —— User list pass 8 —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  }
  fs.writeFileSync(file, s);
  console.log('adding', add.length, 'unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
