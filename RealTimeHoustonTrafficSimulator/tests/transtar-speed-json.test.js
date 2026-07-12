import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} not found`);

  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }

  throw new Error(`${name} function body did not terminate`);
}

test('applyTranStarSpeedJson initializes free-flow speed before sanitizing segment speed', () => {
  const appHtml = readFileSync(join(__dirname, '..', 'app.html'), 'utf8');
  const functionSource = extractFunction(appHtml, 'applyTranStarSpeedJson');
  const road = { def: { id: 'ih45', ff: 65 } };
  const context = {
    window: { LIVE_TRAFFIC: { flows: new Map() } },
    mapTranStarRoadId: () => 'ih45',
    findRoadByKey: () => road,
    mapTranStarDirSign: () => 1,
    sanitizeLiveMph: (mph, ff) => {
      assert.equal(ff, 65);
      return mph;
    },
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  };

  vm.createContext(context);
  vm.runInContext(`${functionSource}; this.applyTranStarSpeedJson = applyTranStarSpeedJson;`, context);

  const count = context.applyTranStarSpeedJson([
    { RoadwayName: 'I-45', Direction: 'Northbound', AverageSpeed: 32 },
  ]);

  assert.equal(count, 1);
  assert.deepEqual(context.window.LIVE_TRAFFIC.flows.get('ih45_1'), {
    cur: 32,
    ff: 65,
    ratio: 32 / 65,
    cong: 1 - 32 / 65,
    at: context.window.LIVE_TRAFFIC.flows.get('ih45_1').at,
    src: 'transtar-json',
  });
});
