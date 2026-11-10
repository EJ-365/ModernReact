import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tourEscapeAction, tourKeyFromField } from '../src/tour-keys.js';

test('Escape in the music search field does not exit the tour', () => {
  const search = { key: 'Escape', target: { tagName: 'INPUT' } };
  assert.equal(tourKeyFromField(search.target), true);
  assert.equal(tourEscapeAction(search, true), 'field');
  assert.equal(tourEscapeAction({ key: 'Escape', target: { tagName: 'SELECT' } }, true), 'field');
  assert.equal(tourEscapeAction({ key: 'Escape', target: { tagName: 'TEXTAREA' } }, true), 'field');
});

test('Escape outside a field still exits, and driving keys still pass through', () => {
  assert.equal(tourEscapeAction({ key: 'Escape', target: { tagName: 'BODY' } }, true), 'exit');
  assert.equal(tourEscapeAction({ key: 'Escape', target: null }, true), 'exit');
  assert.equal(tourEscapeAction({ key: 'w', code: 'KeyW', target: { tagName: 'DIV' } }, true), 'pass');
  assert.equal(tourEscapeAction({ key: 'Escape', target: { tagName: 'INPUT' } }, false), 'ignore');
  assert.equal(tourKeyFromField(null), false);
  assert.equal(tourKeyFromField({ tagName: 'BUTTON' }), false);
});

test('tour keydown asks tourEscapeAction before it can stop the tour', () => {
  const src = fs.readFileSync(new URL('../src/tour.js', import.meta.url), 'utf8');
  const start = src.indexOf("addEventListener('keydown', (e) => {");
  assert.ok(start > 0);
  const slice = src.slice(start, start + 700);
  const call = slice.indexOf('tourEscapeAction(');
  const exit = slice.indexOf("if (keyAct === 'exit') { stop(); return; }");
  assert.ok(call > 0, 'keydown listener must call tourEscapeAction');
  assert.ok(exit > call, 'ending the tour must follow tourEscapeAction');
});
