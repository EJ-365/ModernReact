import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { applyThreeCompat } from '../src/three-compat.js';

test('npm Three is modern (not CDN r128)', () => {
  applyThreeCompat(THREE);
  const rev = Number(THREE.REVISION);
  assert.ok(rev >= 150, 'expected Three r150+, got r' + THREE.REVISION);
  assert.ok(THREE.SRGBColorSpace);
  assert.ok(typeof THREE.WebGLRenderer === 'function');
  assert.ok(typeof THREE.InstancedMesh === 'function');
});
