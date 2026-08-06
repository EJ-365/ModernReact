import fs from 'fs';

const s = fs.readFileSync('app.html', 'utf8');
const marker = '<script>\n/* ================================================================';
const start = s.indexOf(marker);
if (start < 0) {
  console.error('marker not found');
  process.exit(1);
}
const codeStart = start + '<script>\n'.length;
const end = s.indexOf('\n</script>\n<script>', codeStart);
if (end < 0) {
  console.error('end not found');
  process.exit(1);
}

let body = s.slice(codeStart, end);
body = body.replace(
  'renderer.outputEncoding=THREE.sRGBEncoding;',
  'renderer.outputColorSpace=(THREE.SRGBColorSpace||THREE.sRGBEncoding);',
);
body = body.replace(
  '0712-nws-alerts-only',
  '0712-three-vite',
);

const header =
  '/* Extracted from app.html — loaded via src/boot.js after Three Vite bridge */\n' +
  'const THREE = window.THREE;\n' +
  'if (!THREE) throw new Error("[HTS] THREE missing — three-bridge must load first");\n\n';

fs.writeFileSync('src/app-main.js', header + body);

const cutFrom = s.indexOf(
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
);
if (cutFrom < 0) {
  console.error('cdn script not found');
  process.exit(1);
}

const inject =
  '<script src="/data/roads-boot.js"></script>\n' +
  '<script src="/data/roads-corridors.js"></script>\n' +
  '<script type="module" src="/src/boot.js"></script>';

const head = s.slice(0, cutFrom);
const tail = s.slice(end + '\n</script>'.length);
const next = head + inject + '\n' + tail;
fs.writeFileSync('app.html', next);

console.log('app-main.js bytes', fs.statSync('src/app-main.js').size);
console.log('app.html bytes', fs.statSync('app.html').size);
console.log('has cdn', next.includes('cdnjs.cloudflare.com'));
console.log('has boot', next.includes('/src/boot.js'));
console.log('dup roads', (next.match(/roads-boot/g) || []).length);
