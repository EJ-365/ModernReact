/** Add Weeknd deep-cut as Hong Kong vibe alt (unique embeddable ID). */
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

const cands = [
  { g: 'pop', id: 'yyduFmPKHhI', title: 'Often (Hong Kong vibe alt)', a: 'The Weeknd', re: /often/i },
  { g: 'pop', id: 'zXDAYlhdkyg', title: 'The Morning (Hong Kong vibe alt)', a: 'The Weeknd', re: /morning/i },
  { g: 'pop', id: 'WE5EnMb2ZqQ', title: 'Wicked Games (Hong Kong vibe alt)', a: 'The Weeknd', re: /wicked games/i },
  { g: 'pop', id: 'VDejnWwDXLM', title: 'Kiss Land (Hong Kong vibe alt)', a: 'The Weeknd', re: /kiss land/i },
  { g: 'pop', id: '3x2bThRnKx4', title: 'Live For (Hong Kong vibe alt)', a: 'The Weeknd ft. Drake', re: /live for/i },
  { g: 'pop', id: '4uLm9oWJLnI', title: 'House of Balloons (Hong Kong vibe alt)', a: 'The Weeknd', re: /house of balloons|glass table/i },
  { g: 'pop', id: 'E4VTdP0g5bA', title: 'Party Monster (Hong Kong vibe alt)', a: 'The Weeknd', re: /party monster/i },
  { g: 'pop', id: '4NRXx6U8ABQ', title: 'Blinding Lights', a: 'The Weeknd', re: /blinding lights/i },
  { g: 'pop', id: 'fHI8X4OXluQ', title: 'Blinding Lights Audio', a: 'The Weeknd', re: /blinding|weeknd/i },
];

(async () => {
  // Drop Don Toliver-only CAN'T SAY duplicate if official already present
  if (s.includes('2LegcNVM_nM') && s.includes('os6Wx9vktUU')) {
    s = s.replace(/\n\s*\{[^}]*id: 'os6Wx9vktUU'[^}]*\},/g, '\n');
    seen.delete('os6Wx9vktUU');
    console.log('removed Don Toliver-only CAN\'T SAY duplicate');
  }

  let picked = null;
  for (const c of cands) {
    if (seen.has(c.id)) {
      console.log('seen', c.id, c.title);
      continue;
    }
    const meta = await oembed(c.id);
    if (!meta) {
      console.log('bad', c.id);
      continue;
    }
    if (!c.re.test(meta.title)) {
      console.log('mismatch', c.id, meta.title);
      continue;
    }
    picked = { ...c, otitle: meta.title };
    break;
  }
  if (!picked) {
    console.log('FAIL all Hong Kong alts');
    fs.writeFileSync(file, s);
    return;
  }
  const line = `  { g: '${picked.g}', id: '${picked.id}', title: '${esc(picked.title)}', a: '${esc(picked.a)}' },\n`;
  const block = '  /* —— User list Hong Kong vibe —— */\n' + line;
  s = s.replace('];\n\nconst ALL =', block + '];\n\nconst ALL =');
  fs.writeFileSync(file, s);
  console.log('+', picked.title, picked.id, '|', picked.otitle);
  console.log('unique', new Set([...s.matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1])).size);
})();
