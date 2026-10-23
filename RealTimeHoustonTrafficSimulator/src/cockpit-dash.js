/**
 * Aircraft instrument panels for Tour Houston cockpit view (SVG, no images).
 * dashSvg(type) builds the panel; updateDash(root, st) moves needles / text each frame.
 * Types: prop (Cessna 172), heli (Bell 407), jet (airliner), c130 (Hercules), fighter (F-16).
 */
const MONO = 'font-family="Overpass Mono,monospace"';
const tx = (x, y, s, fill, t, id = '', w = 400) => '<text' + (id ? ' id="' + id + '"' : '') + ' x="' + x + '" y="' + y + '" fill="' + fill + '" font-size="' + s + '" font-weight="' + w + '" text-anchor="middle" ' + MONO + '>' + t + '</text>';
const pt = (cx, cy, r, a) => { const q = (a - 90) * Math.PI / 180; return [(cx + r * Math.cos(q)).toFixed(1), (cy + r * Math.sin(q)).toFixed(1)]; };
function arcD(cx, cy, r, a0, a1) {
  const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
  return 'M' + x0 + ',' + y0 + ' A' + r + ',' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1 + ',' + y1;
}
/* Round analog gauge: bezel, ticks, optional coloured arcs, needle (rotated by updateDash) */
function dial(cx, cy, r, o) {
  const { label = '', id = '', min = 0, max = 1, a0 = -135, a1 = 135, ticks = 10, nums = null, arcs = [], unit = '' } = o;
  let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 5) + '" fill="#2b2e33" stroke="#0b0c0e" stroke-width="2"/>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0a0b0d"/>';
  for (const [v0, v1, c] of arcs) {
    const k0 = a0 + (v0 - min) / (max - min) * (a1 - a0), k1 = a0 + (v1 - min) / (max - min) * (a1 - a0);
    s += '<path d="' + arcD(cx, cy, r - 5, k0, k1) + '" fill="none" stroke="' + c + '" stroke-width="4"/>';
  }
  for (let i = 0; i <= ticks; i++) {
    const a = a0 + i / ticks * (a1 - a0), [x0, y0] = pt(cx, cy, r - 2, a), [x1, y1] = pt(cx, cy, r - (i % 2 ? 7 : 11), a);
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#e8ecef" stroke-width="' + (i % 2 ? 1 : 1.8) + '"/>';
  }
  if (nums) nums.forEach((n, i) => { const a = a0 + i / (nums.length - 1) * (a1 - a0), [x, y] = pt(cx, cy, r - 15, a); s += tx(x, +y + 3, Math.max(7, r * 0.15), '#e8ecef', n); });
  if (label) s += tx(cx, cy - r * 0.2, Math.max(7, r * 0.13), '#9aa3ab', label);
  if (unit) s += tx(cx, cy + r * 0.62, Math.max(7, r * 0.14), '#7d868e', unit);
  if (id) s += '<g id="' + id + '" data-c="' + cx + ' ' + cy + '" data-r="' + min + ' ' + max + ' ' + a0 + ' ' + a1 + '" transform="rotate(' + a0 + ' ' + cx + ' ' + cy + ')">'
    + '<path d="M' + (cx - 2.6) + ',' + cy + ' L' + cx + ',' + (cy - r + 8) + ' L' + (cx + 2.6) + ',' + cy + ' Z" fill="#f4f6f8"/></g>';
  return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + Math.max(3, r * 0.08) + '" fill="#3a3e44"/>';
}
/* Attitude ball clipped to a circle; dHz pivots at (cx,cy), k px per degree of pitch */
function attitude(cx, cy, r, k, sky = '#3b7fc4', gnd = '#8a5a32', id = 'dHz') {
  let lad = '';
  for (const p of [-20, -10, -5, 5, 10, 20]) { const w = Math.abs(p) % 10 ? r * 0.18 : r * 0.34, y = cy - p * k; lad += '<line x1="' + (cx - w) + '" x2="' + (cx + w) + '" y1="' + y + '" y2="' + y + '" stroke="#fff" stroke-width="1.4"/>'; }
  return '<clipPath id="clip' + id + cx + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath>'
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 5) + '" fill="#2b2e33" stroke="#0b0c0e" stroke-width="2"/>'
    + '<g clip-path="url(#clip' + id + cx + ')"><g id="' + id + '" data-c="' + cx + ' ' + cy + '" data-k="' + k + '">'
    + '<rect x="' + (cx - r * 3) + '" y="' + (cy - r * 4) + '" width="' + r * 6 + '" height="' + r * 4 + '" fill="' + sky + '"/>'
    + '<rect x="' + (cx - r * 3) + '" y="' + cy + '" width="' + r * 6 + '" height="' + r * 4 + '" fill="' + gnd + '"/>'
    + '<line x1="' + (cx - r * 3) + '" x2="' + (cx + r * 3) + '" y1="' + cy + '" y2="' + cy + '" stroke="#fff" stroke-width="2"/>' + lad + '</g></g>'
    + '<path d="M' + (cx - r * 0.62) + ',' + cy + ' H' + (cx - r * 0.2) + ' L' + cx + ',' + (cy + r * 0.14) + ' L' + (cx + r * 0.2) + ',' + cy + ' H' + (cx + r * 0.62) + '" stroke="#ffb020" stroke-width="3.2" fill="none" stroke-linejoin="round"/>'
    + '<path d="M' + cx + ',' + (cy - r + 2) + ' l-6,9 h12 z" fill="#ffb020"/>';
}
/* Heading card rotated by -hdg (gHdg) */
function hdgCard(cx, cy, r, id = 'gHdg', col = '#e8ecef') {
  let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 5) + '" fill="#2b2e33" stroke="#0b0c0e" stroke-width="2"/><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0a0b0d"/>'
    + '<g id="' + id + '" data-c="' + cx + ' ' + cy + '">';
  for (let a = 0; a < 360; a += 15) { const [x0, y0] = pt(cx, cy, r - 2, a), [x1, y1] = pt(cx, cy, r - (a % 45 ? 6 : 10), a); s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="' + col + '" stroke-width="1.3"/>'; }
  ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'].forEach((n, i) => { if (r < 45 && i % 3) return; const [x, y] = pt(cx, cy, r - 19, i * 30); s += '<text x="' + x + '" y="' + (+y + 4) + '" fill="' + (n === 'N' ? '#ffb020' : col) + '" font-size="' + Math.max(8, r * 0.2) + '" text-anchor="middle" ' + MONO + ' transform="rotate(' + i * 30 + ' ' + x + ' ' + y + ')">' + n + '</text>'; });
  return s + '</g><path d="M' + cx + ',' + (cy - r * 0.55) + ' l-' + r * 0.18 + ',' + r * 0.5 + ' h' + r * 0.36 + ' z" fill="#ffb020"/><line x1="' + cx + '" y1="' + (cy - r) + '" x2="' + cx + '" y2="' + (cy - r + 10) + '" stroke="#ffb020" stroke-width="3"/>';
}
const gearLights = (x, y, sz = 14) => [[0, 0], [-sz * 1.3, sz * 1.25], [sz * 1.3, sz * 1.25]].map(([dx, dy], i) => '<rect id="dG' + (i + 1) + '" x="' + (x + dx - sz / 2) + '" y="' + (y + dy) + '" width="' + sz + '" height="' + sz + '" rx="3" fill="#1d6b35" stroke="#0a0b0d"/>').join('');
const svgOpen = (vb = '0 0 1000 320') => '<svg class="dashSvg" viewBox="' + vb + '" preserveAspectRatio="xMidYMax slice">';
const panelGrad = (id, a, b) => '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>';

function propDash() {
  /* Cessna 172: six-pack (ASI AI ALT / TC HI VSI) spaced in two rows, tach + fuel left, radio stack right — all below the glare shield */
  const r1 = 200, r2 = 280;
  const altNums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n, i) => { const [x, y] = pt(560, r1, 25, i * 36); return tx(x, +y + 3, 8, '#e8ecef', n); }).join('');
  return svgOpen() + '<defs>' + panelGrad('pP', '#3b3f45', '#1d2024') + panelGrad('pG', '#1b1d20', '#0c0d0f') + '</defs>'
    + '<path d="M0,40 L70,80 L60,320 H0 Z" fill="#202226"/><path d="M1000,40 L930,80 L940,320 H1000 Z" fill="#202226"/>'
    + '<path d="M60,154 Q500,128 940,154 L940,320 H60 Z" fill="url(#pP)"/>'
    + '<path d="M50,148 Q500,118 950,148 L950,160 Q500,132 50,160 Z" fill="url(#pG)"/>'
    + '<rect x="76" y="188" width="36" height="96" rx="4" fill="#0a0b0d" stroke="#05060a"/>' + tx(94, 203, 8, '#9aa3ab', 'FUEL')
    + '<rect x="85" y="210" width="18" height="66" rx="2" fill="#15181b"/><rect id="dFuel" x="85" y="222" width="18" height="54" rx="2" fill="#2fa84f"/>'
    + tx(94, 300, 8, '#9aa3ab', 'F  ·  E')
    + dial(200, 240, 50, { label: 'RPM ×100', id: 'nRpm', min: 0, max: 3500, a0: -135, a1: 135, ticks: 14, nums: ['0', '5', '10', '15', '20', '25', '30', '35'], arcs: [[2100, 2700, '#2fa84f'], [2700, 2750, '#e03a2f']] })
    + tx(200, 276, 12, '#fff', '0', 'dRpm', 700)
    + dial(340, r1, 37, { label: 'KNOTS', id: 'nKt', min: 0, max: 200, a0: -150, a1: 150, ticks: 20, nums: ['0', '50', '100', '150', '200'], arcs: [[33, 85, '#e8ecef'], [44, 129, '#2fa84f'], [129, 163, '#e8c43a']] })
    + tx(340, r1 + 25, 10, '#fff', '0', 'dKt', 700)
    + attitude(450, r1, 37, 2.0)
    + dial(560, r1, 37, { label: 'ALT', id: 'nAlt', min: 0, max: 1000, a0: 0, a1: 360, ticks: 10, nums: null }) + altNums
    + tx(560, r1 + 25, 10, '#fff', '0', 'dFt', 700)
    + '<circle cx="340" cy="' + r2 + '" r="37" fill="#2b2e33" stroke="#0b0c0e" stroke-width="2"/><circle cx="340" cy="' + r2 + '" r="29" fill="#0a0b0d"/>'
    + tx(340, r2 - 15, 7, '#9aa3ab', 'TURN COORD.') + '<g id="nTc" data-c="340 ' + r2 + '"><path d="M316,' + r2 + ' H334 L340,' + (r2 - 5) + ' L346,' + r2 + ' H364 M340,' + (r2 - 5) + ' V' + (r2 + 10) + '" stroke="#f4f6f8" stroke-width="2.5" fill="none"/></g>'
    + tx(340, r2 + 24, 7, '#9aa3ab', 'L      R')
    + hdgCard(450, r2, 33)
    + dial(560, r2, 33, { label: 'VSI', id: 'nVs', min: -2000, max: 2000, a0: -260, a1: 80, ticks: 8, nums: null })
    + tx(560, r2 + 22, 9, '#7fd6a0', '0', 'dVs', 700)
    + '<rect x="646" y="166" width="270" height="146" rx="6" fill="#121417" stroke="#05060a"/>'
    + '<rect x="656" y="174" width="250" height="28" rx="3" fill="#050608"/>' + tx(700, 193, 11, '#31d06a', 'COM1') + tx(810, 193, 12, '#31d06a', '118.700  121.900', '', 700)
    + '<rect x="656" y="208" width="250" height="28" rx="3" fill="#050608"/>' + tx(700, 227, 11, '#ffb020', 'XPDR') + tx(810, 227, 13, '#ffb020', '1200  ALT', '', 700)
    + '<rect x="656" y="242" width="250" height="34" rx="3" fill="#050608"/>' + tx(730, 264, 11, '#cfe3f5', '', 'dPhase') + tx(860, 264, 11, '#9aa3ab', 'HDG 000°', 'dHdg')
    + '<rect x="656" y="282" width="120" height="22" rx="3" fill="#0f1012"/>' + tx(716, 297, 10, '#ffb020', 'FLAPS 0°', 'dFlap')
    + '<rect x="786" y="282" width="120" height="22" rx="3" fill="#0f1012"/>' + tx(846, 297, 10, '#9aa3ab', 'MIXTURE RICH')
    + '</svg>';
}

function heliDash() {
  /* Bell 407: one row of gauges (NR/NP, IAS, ATT, HDG, ALT, TRQ) with a status strip below, kept clear of the top crop */
  const y = 228;
  return svgOpen() + '<defs>' + panelGrad('hP', '#34383d', '#17191c') + '</defs>'
    + '<path d="M0,40 Q30,30 80,40 L120,320 H0 Z" fill="#1b1d20"/><path d="M1000,40 Q970,30 920,40 L880,320 H1000 Z" fill="#1b1d20"/>'
    + '<path d="M140,170 Q500,140 860,170 L870,320 H130 Z" fill="url(#hP)"/>'
    + '<path d="M136,166 Q500,134 864,166 L864,176 Q500,146 136,176 Z" fill="#101113"/>'
    + dial(200, y, 32, { label: 'NR  NP', id: 'nNr', min: 0, max: 120, a0: -135, a1: 135, ticks: 12, arcs: [[99, 101, '#2fa84f'], [104, 106, '#e03a2f']] })
    + dial(310, y, 40, { label: 'KNOTS', id: 'nKt', min: 0, max: 160, a0: -150, a1: 150, ticks: 16, nums: ['0', '40', '80', '120', '160'], arcs: [[0, 133, '#2fa84f'], [133, 140, '#e03a2f']] })
    + tx(310, y + 30, 11, '#fff', '0', 'dKt', 700)
    + attitude(430, y, 40, 1.7)
    + hdgCard(550, y, 40)
    + dial(670, y, 40, { label: 'ALT', id: 'nAlt', min: 0, max: 1000, a0: 0, a1: 360, ticks: 10 })
    + tx(670, y + 30, 11, '#fff', '0', 'dFt', 700)
    + dial(790, y, 32, { label: 'TRQ %', id: 'nTrq', min: 0, max: 110, a0: -135, a1: 135, ticks: 11, arcs: [[0, 93, '#2fa84f'], [93, 100, '#e8c43a'], [100, 110, '#e03a2f']] })
    + tx(790, y + 24, 9, '#fff', '0', 'dTrq', 700)
    + '<rect x="160" y="282" width="680" height="24" rx="4" fill="#0a0b0d" stroke="#05060a"/>'
    + tx(212, 299, 11, '#31d06a', 'ENG OK') + tx(276, 299, 11, '#31d06a', 'XMSN')
    + tx(430, 299, 11, '#cfe3f5', '', 'dPhase')
    + tx(586, 299, 11, '#9aa3ab', 'VS') + tx(632, 299, 12, '#7fd6a0', '0', 'dVs', 700)
    + tx(722, 299, 11, '#ffb020', 'MGT', '', 700) + tx(782, 299, 12, '#ffb020', '0°C', 'dMgt', 700)
    + '</svg>';
}

function jetDash(c130) {
  /* Glass cockpit: EICAS (live N1/TRQ, EGT, fuel flow, gear, flaps), PFD, ND */
  const lab = c130 ? 'TRQ %' : 'N1 %', lab2 = c130 ? 'TIT °C' : 'EGT °C';
  const eng = (cx, s) => '<path d="' + arcD(cx, 172, 30, -120, 90) + '" fill="none" stroke="#2a3340" stroke-width="5"/>'
    + '<path d="' + arcD(cx, 172, 30, 82, 90) + '" fill="none" stroke="#e03a2f" stroke-width="5"/>'
    + '<path id="aN1' + s + '" d="' + arcD(cx, 172, 30, -120, -119) + '" fill="none" stroke="#e8ecef" stroke-width="5"/>'
    + '<g id="nN1' + s + '" data-c="' + cx + ' 172" data-r="0 110 -120 90"><line x1="' + cx + '" y1="172" x2="' + cx + '" y2="140" stroke="#e8ecef" stroke-width="2.5"/></g>'
    + '<rect x="' + (cx - 26) + '" y="176" width="52" height="20" rx="3" fill="#0a0e13" stroke="#3a4552"/>' + tx(cx, 191, 13, '#e8ecef', '0.0', 'dN1' + s, 700)
    + tx(cx, 218, 12, '#e8ecef', '0', 'dEgt' + s, 700) + tx(cx, 240, 12, '#e8ecef', '0', 'dFf' + s, 700);
  return svgOpen() + '<defs>' + panelGrad('jPanel', '#1b2028', '#0b0e13') + panelGrad('jGlare', '#2a3039', '#11151b') + '<clipPath id="ahClip"><rect x="368" y="108" width="264" height="168" rx="6"/></clipPath></defs>'
    + '<path d="M0,96 Q500,70 1000,96 V320 H0 Z" fill="url(#jPanel)" opacity=".97"/>'
    + '<path d="M60,92 Q500,62 940,92 L940,100 Q500,74 60,100 Z" fill="url(#jGlare)"/>'
    + '<rect x="0" y="300" width="1000" height="20" fill="#07090c"/>'
    + '<rect x="100" y="108" width="180" height="186" rx="8" fill="#05080c" stroke="#2a3340"/>'
    + tx(190, 126, 10, '#7fb3d9', lab) + eng(148, 'a') + eng(232, 'b')
    + tx(190, 218, 9, '#7fb3d9', lab2.split(' ')[0]) + tx(190, 240, 9, '#7fb3d9', 'FF')
    + tx(190, 252, 8, '#5a6570', c130 ? 'KG/H' : 'KG/H')
    + gearLights(130, 256, 11) + tx(130, 290, 8, '#7fb3d9', 'GEAR')
    + '<rect x="176" y="262" width="94" height="24" rx="3" fill="#0a0e13" stroke="#2a3340"/>' + tx(223, 279, 11, '#7fd6a0', 'FLAPS UP', 'dFlap', 700)
    + '<rect x="284" y="100" width="432" height="184" rx="10" fill="#0e131a" stroke="#2a3340"/>'
    + '<rect x="292" y="108" width="68" height="168" rx="4" fill="#06090d" stroke="#2a3340"/>' + tx(326, 124, 10, '#6a7580', 'IAS')
    + '<rect x="298" y="172" width="56" height="40" rx="4" fill="#111820" stroke="#e8a838" stroke-width="1.5"/>' + tx(326, 200, 24, '#fff', '0', 'dKt', 700) + tx(326, 266, 10, '#6a7580', 'KT')
    + '<rect x="368" y="108" width="264" height="168" rx="6" fill="#05080c"/>'
    + '<g clip-path="url(#ahClip)"><g id="dHz" data-c="500 192" data-k="3.2">'
    + '<rect x="200" y="-80" width="600" height="272" fill="#3a7fc0"/><rect x="200" y="192" width="600" height="272" fill="#8a5a32"/>'
    + '<line x1="200" y1="192" x2="800" y2="192" stroke="#f2f4f7" stroke-width="2.5"/>'
    + [-20, -10, 10, 20].map((p) => '<line x1="' + (p % 20 ? 482 : 470) + '" x2="' + (p % 20 ? 518 : 530) + '" y1="' + (192 - p * 3.2) + '" y2="' + (192 - p * 3.2) + '" stroke="#fff" stroke-width="1.6"/>' + tx(456, 192 - p * 3.2 + 4, 10, '#fff', Math.abs(p))).join('')
    + '</g></g>'
    + '<path d="M462,192 H490 L500,203 L510,192 H538" stroke="#ffcf3a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M500,112 l-7,10 h14 z" fill="#ffcf3a"/>'
    + '<rect x="640" y="108" width="68" height="168" rx="4" fill="#06090d" stroke="#2a3340"/>' + tx(674, 124, 10, '#6a7580', 'ALT')
    + '<rect x="644" y="172" width="60" height="40" rx="4" fill="#111820" stroke="#7fd6a0" stroke-width="1.5"/>' + tx(674, 199, 18, '#fff', '0', 'dFt', 700)
    + tx(674, 246, 10, '#6a7580', 'FT') + tx(674, 266, 12, '#7fd6a0', '0', 'dVs')
    + '<rect x="720" y="108" width="180" height="186" rx="8" fill="#05080c" stroke="#2a3340"/>' + tx(810, 124, 10, '#7fb3d9', 'ND · TRK')
    + '<clipPath id="ndClip"><rect x="724" y="130" width="172" height="160"/></clipPath><g clip-path="url(#ndClip)">' + hdgCard(810, 250, 92, 'gHdg', '#dbe6f0').replace(/fill="#2b2e33" stroke="#0b0c0e"/, 'fill="none" stroke="none"').replace(/fill="#0a0b0d"/, 'fill="#05080c"') + '</g>'
    + '<line x1="810" y1="250" x2="810" y2="150" stroke="#e05cff" stroke-width="2" stroke-dasharray="6 4"/>'
    /* glareshield autopilot panel (MCP): SPD / HDG / ALT / V/S windows and A/P engage lights */
    + '<rect x="300" y="62" width="400" height="34" rx="5" fill="#2b3038" stroke="#11151b" stroke-width="2"/>'
    + [['SPD', 338, 'dMcpS'], ['HDG', 428, 'dMcpH'], ['ALT', 528, 'dMcpA'], ['V/S', 626, 'dMcpV']].map(([l, x, id]) => tx(x, 72, 7, '#c9d1d9', l, '', 700)
      + '<rect x="' + (x - 30) + '" y="75" width="60" height="16" rx="2" fill="#0a0c0f"/>' + tx(x, 87, 11, '#ffb347', '---', id, 700)).join('')
    + '<rect x="670" y="68" width="22" height="10" rx="2" fill="#1a5c34"/><rect x="670" y="81" width="22" height="10" rx="2" fill="#1a5c34"/>' + tx(681, 76, 6, '#d6ffe4', 'A/P', '', 700) + tx(681, 89, 6, '#d6ffe4', 'A/T', '', 700)
    + '<circle cx="60" cy="200" r="16" fill="#1b1f25" stroke="#3a4552"/>' + tx(60, 204, 8, '#e8a838', 'MSTR', '', 700) + '<circle cx="940" cy="200" r="16" fill="#1b1f25" stroke="#3a4552"/>' + tx(940, 204, 8, '#e8a838', 'WARN', '', 700)
    + '<rect x="452" y="250" width="96" height="22" rx="4" fill="#0c1118" stroke="#2a3340"/>' + tx(500, 266, 12, '#ffcf3a', 'HDG 000°', 'dHdg', 700)
    /* glareshield annunciators either side of the MCP */
    + [110, 710].map((x0) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => '<rect x="' + (x0 + 8 + i * 22) + '" y="' + (i % 2 ? 80 : 68) + '" width="16" height="9" rx="2" fill="' + ['#c0392b', '#e8a838', '#1f7a4d', '#2a3340'][(i + (x0 > 500 ? 1 : 0)) % 4] + '"/>').join('')).join('')
    /* side consoles: knobs (captain) and backlit push-buttons (first officer) */
    + [[34, 128], [70, 128], [34, 254], [70, 254]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="12" fill="#d9dde1" stroke="#6a727c" stroke-width="2"/><line x1="' + x + '" y1="' + y + '" x2="' + (x + 6) + '" y2="' + (y - 9) + '" stroke="#2a2f36" stroke-width="2"/>').join('')
    + [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => '<rect x="' + (912 + c * 19) + '" y="' + (116 + r * 16) + '" width="14" height="10" rx="2" fill="' + (r === 2 ? '#e8a838' : r === 3 ? '#1f9a6a' : '#4a525c') + '"/>').join('')).join('')
    + [[930, 254], [966, 254]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="12" fill="#d9dde1" stroke="#6a727c" stroke-width="2"/>').join('')
    /* centre pedestal with the two thrust levers between the seats */
    + '<path d="M404,320 L428,280 H572 L596,320 Z" fill="#262b33" stroke="#11151b" stroke-width="2"/>'
    + '<rect x="474" y="286" width="10" height="34" fill="#0b0e12"/><rect x="516" y="286" width="10" height="34" fill="#0b0e12"/>'
    + '<rect x="464" y="290" width="30" height="11" rx="3" fill="#9aa2ab" stroke="#3a4048"/><rect x="506" y="290" width="30" height="11" rx="3" fill="#9aa2ab" stroke="#3a4048"/>'
    + [436, 448, 552, 564].map((x) => '<rect x="' + x + '" y="306" width="8" height="5" rx="1" fill="#c0392b"/>').join('')
    /* control yokes in front of each pilot */
    + [190, 810].map((x) => '<path d="M' + (x - 48) + ',320 L' + (x - 48) + ',296 Q' + (x - 48) + ',284 ' + (x - 38) + ',284 L' + (x - 30) + ',284 L' + (x - 30) + ',302 L' + (x + 30) + ',302 L' + (x + 30) + ',284 L' + (x + 38) + ',284 Q' + (x + 48) + ',284 ' + (x + 48) + ',296 L' + (x + 48) + ',320 Z" fill="#2d3239" stroke="#4a525c" stroke-width="2"/>'
      + '<rect x="' + (x - 16) + '" y="300" width="32" height="20" rx="4" fill="#3a4048" stroke="#555d66"/>').join('')
    + '</svg>'
    /* flight-deck windows: centre post, side-window frames and the overhead panel edge, drawn over the view */
    + '<svg class="jetGlass" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">'
    + '<defs><linearGradient id="jgT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1824" stop-opacity=".3"/><stop offset=".35" stop-color="#0b1824" stop-opacity="0"/></linearGradient></defs>'
    + '<rect width="1600" height="900" fill="url(#jgT)"/>'
    + '<path d="M0,0 H1600 V70 Q800,40 0,70 Z" fill="#1c2128"/>'
    + [120, 260, 400, 1200, 1340, 1480].map((x) => '<circle cx="' + x + '" cy="24" r="5" fill="#3a4250"/><rect x="' + (x + 14) + '" y="18" width="40" height="12" rx="3" fill="#262c35"/>').join('')
    + '<path d="M786,52 L814,52 L826,900 L774,900 Z" fill="#15191f"/><path d="M800,52 V900" stroke="#2a313b" stroke-width="2"/>'
    + '<path d="M0,96 L190,70 L110,900 L0,900 Z" fill="#15191f" opacity=".96"/><path d="M190,70 L110,900" stroke="#2a313b" stroke-width="3"/>'
    + '<path d="M1600,96 L1410,70 L1490,900 L1600,900 Z" fill="#15191f" opacity=".96"/><path d="M1410,70 L1490,900" stroke="#2a313b" stroke-width="3"/>'
    + ''
    + '<path d="M330,120 L520,90 L300,880 L240,880 Z" fill="#fff" opacity=".03"/><path d="M1080,90 L1250,120 L1290,880 L1240,880 Z" fill="#fff" opacity=".025"/>'
    + '</svg>';
}

function fighterDash() {
  /* F-16 Viper: HUD combiner (green symbology) over the nose, UFC, two MFDs, gear handle lights */
  const G = '#5dff8a';
  return svgOpen() + '<defs>' + panelGrad('fP', '#3a3f45', '#1f2226') + '<clipPath id="hudClip"><rect x="404" y="34" width="192" height="150" rx="4"/></clipPath></defs>'
    + '<path d="M0,0 C40,60 70,160 90,320 H0 Z" fill="#2a2e33"/><path d="M1000,0 C960,60 930,160 910,320 H1000 Z" fill="#2a2e33"/>'
    + '<path d="M70,196 Q500,168 930,196 L940,320 H60 Z" fill="url(#fP)"/>'
    + '<path d="M150,186 Q500,160 850,186 L850,198 Q500,172 150,198 Z" fill="#141619"/>'
    + '<path d="M396,196 L404,30 H596 L604,196 Z" fill="#1c1f22"/>'
    + '<rect x="404" y="34" width="192" height="150" rx="4" fill="rgba(70,120,90,.10)" stroke="rgba(150,210,170,.35)"/>'
    + '<g clip-path="url(#hudClip)"><g id="dHz" data-c="500 110" data-k="2.6">'
    + '<line x1="300" x2="700" y1="110" y2="110" stroke="' + G + '" stroke-width="1.6"/>'
    + [-20, -10, 10, 20].map((p) => { const y = 110 - p * 2.6, d = p < 0 ? ' stroke-dasharray="6 4"' : ''; return '<path d="M452,' + (y + (p > 0 ? 5 : -5)) + ' V' + y + ' H484 M516,' + y + ' H548 V' + (y + (p > 0 ? 5 : -5)) + '" stroke="' + G + '" stroke-width="1.4" fill="none"' + d + '/>' + '<text x="446" y="' + (y + 4) + '" fill="' + G + '" font-size="9" text-anchor="end" ' + MONO + '>' + Math.abs(p) + '</text>'; }).join('')
    + '</g></g>'
    + '<circle cx="500" cy="110" r="5" fill="none" stroke="' + G + '" stroke-width="1.6"/><path d="M488,110 H495 M505,110 H512 M500,105 V99" stroke="' + G + '" stroke-width="1.6"/>'
    + '<rect x="410" y="96" width="40" height="18" fill="none" stroke="' + G + '"/>' + tx(430, 109, 12, G, '0', 'dKt', 700)
    + '<rect x="550" y="96" width="42" height="18" fill="none" stroke="' + G + '"/>' + tx(571, 109, 11, G, '0', 'dFt', 700)
    + tx(426, 130, 10, G, 'M 0.00', 'dMach') + tx(426, 50, 10, G, 'G 1.0', 'dGld') + tx(574, 130, 9, G, '0', 'dVs')
    + tx(500, 176, 11, G, '000', 'dHdg', 700) + '<path d="M500,162 l-4,-6 h8 z" fill="' + G + '"/>'
    + '<rect x="432" y="206" width="136" height="54" rx="4" fill="#101214" stroke="#050607"/>'
    + '<rect x="440" y="212" width="120" height="20" rx="2" fill="#050a06"/>' + tx(500, 226, 10, G, '', 'dPhase')
    + [0, 1, 2, 3, 4].map((i) => '<rect x="' + (444 + i * 23) + '" y="238" width="18" height="14" rx="2" fill="#2c3035"/>').join('')
    + '<rect x="214" y="206" width="190" height="112" rx="6" fill="#0d0f11" stroke="#050607"/><rect x="224" y="214" width="170" height="96" fill="#03060a"/>'
    + tx(309, 228, 10, '#7fb3d9', 'ENGINE') + dial(262, 268, 28, { id: 'nN1a', min: 0, max: 110, a0: -135, a1: 135, ticks: 11, arcs: [[70, 100, '#2fa84f']] })
    + tx(262, 306, 9, '#9aa3ab', 'RPM') + tx(345, 252, 11, '#fff', '0%', 'dN1a', 700)
    + tx(345, 270, 9, '#9aa3ab', 'FTIT') + tx(345, 284, 11, '#fff', '0', 'dEgta', 700) + tx(345, 300, 9, '#9aa3ab', 'FF') + tx(372, 300, 9, '#fff', '0', 'dFfa')
    + '<rect x="596" y="206" width="190" height="112" rx="6" fill="#0d0f11" stroke="#050607"/><rect x="606" y="214" width="170" height="96" fill="#03060a"/>'
    + tx(691, 228, 10, '#7fb3d9', 'HSD') + '<clipPath id="hsdC"><rect x="606" y="232" width="170" height="78"/></clipPath><g clip-path="url(#hsdC)">' + hdgCard(691, 300, 64, 'gHdg', '#7fd6a0').replace(/fill="#2b2e33" stroke="#0b0c0e"/, 'fill="none" stroke="none"').replace(/fill="#0a0b0d"/, 'fill="#03060a"') + '</g>'
    + gearLights(150, 236, 14) + tx(150, 284, 9, '#9aa3ab', 'GEAR') + tx(150, 300, 10, '#7fd6a0', 'FLAPS UP', 'dFlap')
    + '<rect x="826" y="226" width="60" height="64" rx="4" fill="#0d0f11"/>' + tx(856, 246, 9, '#9aa3ab', 'FUEL') + tx(856, 266, 12, '#fff', '7.0', 'dFuelK', 700) + tx(856, 280, 8, '#9aa3ab', 'K LB')
    + '</svg>';
}

export function dashSvg(type) {
  return type === 'heli' ? heliDash() : type === 'fighter' ? fighterDash() : type === 'jet' || type === 'c130' ? jetDash(type === 'c130') : propDash();
}

const _cache = new WeakMap();
/** st: { type, kt, ft, vs, hdg, roll, pitch (rad), pwr 0–1, gear 0–1, phase, info } */
export function updateDash(root, st) {
  let c = _cache.get(root);
  if (!c || c.html !== root.firstChild) { c = { html: root.firstChild, el: {} }; _cache.set(root, c); }
  const q = (id) => (id in c.el ? c.el[id] : (c.el[id] = root.querySelector('#' + id)));
  const set = (id, v) => { const e = q(id); if (e && e.textContent !== v) e.textContent = v; };
  const needle = (id, v) => {
    const e = q(id); if (!e) return;
    const [mn, mx, a0, a1] = e.dataset.r.split(' ').map(Number), k = Math.max(0, Math.min(1, (v - mn) / (mx - mn)));
    e.setAttribute('transform', 'rotate(' + (a0 + k * (a1 - a0)).toFixed(1) + ' ' + e.dataset.c + ')');
  };
  const rollD = st.roll * 180 / Math.PI, pitchD = st.pitch * 180 / Math.PI, p = Math.max(0, Math.min(1, st.pwr || 0));
  const hdg = String(Math.round(st.hdg) % 360).padStart(3, '0');
  const hz = q('dHz'); if (hz) hz.setAttribute('transform', 'rotate(' + (-rollD).toFixed(1) + ' ' + hz.dataset.c + ') translate(0 ' + (pitchD * +hz.dataset.k).toFixed(1) + ')');
  const hc = q('gHdg'); if (hc) hc.setAttribute('transform', 'rotate(' + (-st.hdg).toFixed(1) + ' ' + hc.dataset.c + ')');
  set('dKt', String(Math.round(st.kt))); needle('nKt', st.kt);
  set('dFt', Math.round(st.ft).toLocaleString()); needle('nAlt', ((st.ft % 1000) + 1000) % 1000);
  const vs = q('dVs'); if (vs) { const t = (st.vs >= 0 ? '+' : '') + st.vs; if (vs.textContent !== t) { vs.textContent = t; vs.setAttribute('fill', st.vs >= 0 ? '#7fd6a0' : '#f0a0a0'); } }
  needle('nVs', st.vs);
  const tc = q('nTc'); if (tc) tc.setAttribute('transform', 'rotate(' + Math.max(-30, Math.min(30, rollD)).toFixed(1) + ' ' + tc.dataset.c + ')');
  const ph = st.info || st.phase || '';
  set('dPhase', ph.length > 26 ? ph.slice(0, 25) + '…' : ph);
  set('dHdg', st.type === 'fighter' ? hdg : 'HDG ' + hdg + '°');
  /* flaps follow phase: take-off setting on roll/initial climb, full on final/landing */
  const lowClimb = st.phase === 'climb' && st.ft < 2500, onGnd = /roll|rollout|parked/.test(st.phase || '');
  const fl = st.type === 'prop' ? (/final|rollout/.test(st.phase) ? 'FLAPS 30°' : st.phase === 'toFaf' ? 'FLAPS 10°' : (st.phase === 'roll' || lowClimb) ? 'FLAPS 10°' : 'FLAPS 0°')
    : st.type === 'fighter' ? ((onGnd || st.phase === 'final' || st.gear > 0.5) ? 'FLAPS DN' : 'FLAPS UP')
      : (/final|rollout/.test(st.phase) ? 'FLAPS FULL' : st.phase === 'toFaf' ? 'FLAPS 2' : (st.phase === 'roll' || lowClimb) ? 'FLAPS 1+F' : 'FLAPS UP');
  set('dFlap', fl);
  const gcol = st.gear > 0.98 ? '#22c55e' : st.gear < 0.02 ? '#1f2328' : '#e8a838';
  for (const id of ['dG1', 'dG2', 'dG3']) { const g = q(id); if (g && g.getAttribute('fill') !== gcol) g.setAttribute('fill', gcol); }
  if (st.type === 'jet' || st.type === 'c130') {
    for (const [s, j] of [['a', 0], ['b', -0.4]]) {
      const n1 = st.type === 'c130' ? 12 + p * 86 + j : 21 + p * 76 + j;
      set('dN1' + s, n1.toFixed(1)); needle('nN1' + s, n1);
      const a = q('aN1' + s); if (a) { const cx = s === 'a' ? 148 : 232; a.setAttribute('d', arcD(cx, 172, 30, -120, -120 + Math.max(1, n1 / 110 * 210))); }
      set('dEgt' + s, String(Math.round((st.type === 'c130' ? 520 + p * 450 : 410 + p * 490) + j * 6)));
      set('dFf' + s, String(Math.round((st.type === 'c130' ? 260 + p * 720 : 320 + p * 2680) + j * 20)));
    }
    set('dMcpS', String(Math.max(100, Math.round(st.kt / 5) * 5)));
    set('dMcpH', hdg);
    set('dMcpA', String(Math.round(st.ft / 100) * 100).padStart(5, '0'));
    set('dMcpV', (st.vs >= 0 ? '+' : '') + Math.round(st.vs / 100) * 100);
  } else if (st.type === 'fighter') {
    const rpm = 70 + p * 30; set('dN1a', rpm.toFixed(0) + '%'); needle('nN1a', rpm);
    set('dEgta', String(Math.round(560 + p * 380))); set('dFfa', String(Math.round(900 + p * 8600)));
    set('dMach', 'M ' + (st.kt / 661.5).toFixed(2));
    set('dGld', 'G ' + Math.min(9, 1 / Math.max(0.12, Math.cos(st.roll))).toFixed(1));
  } else if (st.type === 'heli') {
    const run = st.phase !== 'parked' || st.kt > 1;
    needle('nNr', run ? 100 : 0);
    const trq = run ? 18 + p * 70 : 0; set('dTrq', Math.round(trq) + '%'); needle('nTrq', trq);
    set('dMgt', (run ? Math.round(560 + p * 190) : 30) + '°C');
  } else {
    const rpm = 600 + Math.sqrt(p) * 1850; set('dRpm', String(Math.round(rpm / 10) * 10)); needle('nRpm', rpm);
  }
}
