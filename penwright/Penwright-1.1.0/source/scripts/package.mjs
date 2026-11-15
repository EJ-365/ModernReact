// Builds release/penwright-<version>.zip: built app, source, desktop launchers and changes.patch.
import JSZip from 'jszip';
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const top = `Penwright-${version}`;
const zip = new JSZip();
const skip = /^(node_modules|dist|release|\.git)(\/|$)/;

const add = (dir, dest, filter = () => true) => {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const rel = relative(root, full).replaceAll('\\', '/');
    if (!filter(rel)) continue;
    if (statSync(full).isDirectory()) add(full, dest + f + '/', filter);
    else zip.file(dest + f, readFileSync(full), { unixPermissions: statSync(full).mode });
  }
};

add(join(root, 'dist'), `${top}/app/`);
add(join(root, 'desktop'), `${top}/`);
const tracked = new Set(execSync('git ls-files -co --exclude-standard', { cwd: root }).toString().split('\n').filter(Boolean));
add(root, `${top}/source/`, (rel) => !skip.test(rel) && (statSync(join(root, rel)).isDirectory() || tracked.has(rel)));
if (existsSync(join(root, 'release/changes.patch'))) zip.file(`${top}/changes.patch`, readFileSync(join(root, 'release/changes.patch')));

mkdirSync(join(root, 'release'), { recursive: true });
const out = join(root, 'release', `penwright-${version}.zip`);
writeFileSync(out, await zip.generateAsync({ type: 'nodebuffer', platform: 'UNIX', compression: 'DEFLATE', compressionOptions: { level: 9 } }));
console.log('wrote', relative(root, out));
