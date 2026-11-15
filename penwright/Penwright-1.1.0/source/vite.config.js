import { defineConfig } from 'vite';
import { resolve, join } from 'node:path';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'));

// Writes the version and the list of built files into dist/sw.js so the installed app works offline.
function serviceWorkerManifest() {
  return {
    name: 'penwright-sw',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');
      const files = [];
      const walk = (dir, prefix = '') => {
        for (const f of readdirSync(dir)) {
          const full = join(dir, f);
          if (statSync(full).isDirectory()) walk(full, prefix + f + '/');
          else files.push(prefix + f);
        }
      };
      walk(dist);
      const precache = ['./', ...files
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map') && !/-(cyrillic|greek|vietnamese|hebrew|math|symbols)(-ext)?-/.test(f))
        .map((f) => './' + f)];
      const sw = join(dist, 'sw.js');
      writeFileSync(sw, readFileSync(sw, 'utf8').replace('__VERSION__', pkg.version).replace('self.__PRECACHE || []', JSON.stringify(precache)));
    },
  };
}

export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [serviceWorkerManifest()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: { home: resolve(__dirname, 'index.html'), studio: resolve(__dirname, 'studio.html') },
    },
  },
  server: { port: 5190, host: true },
  preview: { port: 5191, host: true },
});
