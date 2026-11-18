/** Pass 7: CAN'T SAY official, Loyal, Hong Kong vibe, Jaiye vibe. */
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

async function tryAdd(cands, titleRe) {
  for (const c of cands) {
    if (seen.has(c.id)) continue;
    const meta = await oembed(c.id);
    if (!meta) {
      console.log('bad', c.id, c.title);
      continue;
    }
    if (!titleRe.test(meta.title)) {
      console.log('mismatch', c.id, meta.title);
      continue;
    }
    seen.add(c.id);
    console.log('+', c.title, c.id, '|', meta.title);
    return { ...c, otitle: meta.title };
  }
  return null;
}

(async () => {
  const add = [];

  // Upgrade CAN'T SAY
  if (s.includes("os6Wx9vktUU")) {
    const meta = await oembed('2LegcNVM_nM');
    if (meta && /can't say|cant say/i.test(meta.title) && !seen.has('2LegcNVM_nM')) {
      s = s.replace(/\n\s*\{[^}]*id: 'os6Wx9vktUU'[^}]*\},/g, '\n');
      seen.delete('os6Wx9vktUU');
      const row = {
        g: 'hiphop',
        id: '2LegcNVM_nM',
        title: "CAN'T SAY",
        a: 'Travis Scott ft. Don Toliver',
      };
      add.push(row);
      seen.add(row.id);
      console.log('upgraded CAN\'T SAY', meta.title);
    }
  }

  // Remove My Darling mislabeled as Loyal
  if (s.includes("upoQO0BuLTw")) {
    s = s.replace(/\n\s*\{[^}]*id: 'upoQO0BuLTw'[^}]*\},/g, '\n');
    seen.delete('upoQO0BuLTw');
    console.log('removed mislabeled Loyal');
  }

  if (!/title: 'Loyal'/.test(s)) {
    const L = await tryAdd(
      [{ g: 'afrobeat', id: '7bO6jpdmC-o', title: 'Loyal', a: 'Chella' }],
      /loyal/i
    );
    if (L) add.push(L);
    else console.log('FAIL Loyal');
  } else console.log('have Loyal');

  if (!/hong kong|title: 'Kiss Land'|title: 'Wicked Games'|title: 'The Morning'|title: 'Often'/.test(s.toLowerCase())) {
    const hk = await tryAdd(
      [
        { g: 'pop', id: 'JZjAg6fK-BQ', title: 'Wicked Games (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'yyduFmPKHhI', title: 'Often (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'zXDAYlhdkyg', title: 'The Morning (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: 'VDejnWwDXLM', title: 'Kiss Land (Hong Kong vibe alt)', a: 'The Weeknd' },
        { g: 'pop', id: '3x2bThRnKx4', title: 'Live For (Hong Kong vibe alt)', a: 'The Weeknd ft. Drake' },
      ],
      /weeknd|wicked|often|morning|kiss land|live for/i
    );
    if (hk) add.push(hk);
    else console.log('FAIL Hong Kong');
  } else console.log('have Hong Kong/Weeknd deep cut');

  if (!/\bjaiye\b/i.test(s)) {
    const j = await tryAdd(
      [
        { g: 'afrobeat', id: 'cH9Q8b4H0ZQ', title: 'Motigbana (Jaiye vibe alt)', a: 'Olamide' },
        { g: 'afrobeat', id: 'n7K5gWcGBE8', title: 'Empire (Jaiye vibe alt)', a: 'Olamide' },
        { g: 'afrobeat', id: '8vJhH3q8e0M', title: 'Science (Jaiye vibe alt)', a: 'Olamide' },
        { g: 'afrobeat', id: 'yEDHimUB4A4', title: 'Active Alt (Jaiye vibe alt)', a: 'Asake' },
        { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude (Jaiye vibe alt)', a: 'Asake' },
      ],
      /olamide|asake|motigbana|empire|science|gratitude|active/i
    );
    if (j) add.push(j);
    else console.log('FAIL Jaiye');
  } else console.log('have Jaiye');

  if (add.length) {
    const block =
      '  /* —— User list pass 7 —— */\n' +
      add.map((t) => `  { g: '${t.g}', id: '${t.id}', title: '${esc(t.title)}', a: '${esc(t.a)}' },`).join('\n') +
      '\n';
    s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  }
  fs.writeFileSync(file, s);
  console.log('adding', add.length, 'unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
