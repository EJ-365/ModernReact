/**
 * Detailed traffic scales the shared body instance to 0 so it does not draw over the
 * detailed model. A 0-scale instance does not raycast, which dropped click-to-follow
 * for every car, taxi, SUV, truck and bus. Clicks must use the matrix copy taken
 * before that zero.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { copyInstanceMatrices } from '../src/render/traffic-detailed.js';

function mesh(n) {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), n);
  m.count = 0;
  return m;
}

describe('traffic click pick', () => {
  it('hits the pre-zero body copy and misses the scale-0 instance', () => {
    const bodies = mesh(4);
    const pick = mesh(4);
    const placed = new THREE.Matrix4().compose(
      new THREE.Vector3(12, 0.7, -4),
      new THREE.Quaternion(),
      new THREE.Vector3(2.3, 1.4, 4.8),
    );
    bodies.setMatrixAt(0, placed);
    bodies.count = 1;
    copyInstanceMatrices(bodies, pick, 1);
    bodies.setMatrixAt(0, new THREE.Matrix4().makeScale(0, 0, 0));

    const ray = new THREE.Raycaster(new THREE.Vector3(12, 30, -4), new THREE.Vector3(0, -1, 0));
    const drawn = ray.intersectObject(bodies, false);
    /* A bounds sphere computed before the cars moved would reject the ray. Picking must not depend on it. */
    pick.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
    const hits = ray.intersectObject(pick, false);
    assert.equal(drawn.length, 0);
    assert.equal(hits.length > 0, true);
    assert.equal(hits[0].instanceId, 0);
  });

  it('does not keep stale instances after the live count drops', () => {
    const bodies = mesh(4);
    const pick = mesh(4);
    const at = (x) => new THREE.Matrix4().makeTranslation(x, 0.5, 0);
    bodies.setMatrixAt(0, at(0));
    bodies.setMatrixAt(1, at(30));
    bodies.count = 2;
    copyInstanceMatrices(bodies, pick, 2);
    copyInstanceMatrices(bodies, pick, 1);
    const ray = new THREE.Raycaster(new THREE.Vector3(30, 10, 0), new THREE.Vector3(0, -1, 0));
    const hits = [];
    pick.raycast(ray, hits);
    assert.equal(hits.length, 0);
    assert.equal(pick.count, 1);
  });
});
