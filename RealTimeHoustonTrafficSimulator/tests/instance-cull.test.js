import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createInstanceCuller } from '../src/render/instance-cull.js';

function setup(n = 2000) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1.5, 1, 50000);
  camera.position.set(0, 50, 0);
  camera.lookAt(100, 0, 0);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(4, 4, 4), new THREE.MeshLambertMaterial(), n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { m.makeTranslation(i * 20, 0, 0); mesh.setMatrixAt(i, m); mesh.setColorAt(i, new THREE.Color(i / n, 0, 0)); }
  scene.add(mesh);
  scene.updateMatrixWorld(true);
  const cull = createInstanceCuller({ scene, camera, settleMs: 0, budgetMs: 1000, scanEveryMs: 0 });
  return { scene, camera, mesh, cull };
}
function settle(cull, fog = 20000) { for (let i = 0; i < 3; i++) cull.update(fog); }
const tick = settle;

test('culls instances past the fog and keeps near ones', () => {
  const { mesh, cull } = setup();
  tick(cull, 10000);
  assert.equal(cull.size, 1);
  assert.ok(mesh.count < 2000 && mesh.count > 100, 'count ' + mesh.count);
  /* every drawn instance is within the fog */
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  for (let k = 0; k < mesh.count; k++) { m.fromArray(mesh.instanceMatrix.array, k * 16); p.setFromMatrixPosition(m); assert.ok(p.x <= 10500); }
  assert.ok(mesh.boundingSphere && mesh.boundingSphere.radius > 0);
});

test('getMatrixAt / getColorAt still use original ids after culling', () => {
  const { mesh, cull } = setup();
  tick(cull, 5000);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), c = new THREE.Color();
  mesh.getMatrixAt(1900, m); p.setFromMatrixPosition(m);
  assert.equal(p.x, 1900 * 20);
  mesh.getColorAt(1500, c);
  assert.ok(Math.abs(c.r - 0.75) < 1e-6);
});

test('raycast reports the original instance id', () => {
  const { mesh, cull, camera } = setup();
  tick(cull, 5000);
  const rc = new THREE.Raycaster(new THREE.Vector3(200, 100, 0), new THREE.Vector3(0, -1, 0));
  const hits = rc.intersectObject(mesh);
  assert.ok(hits.length > 0);
  assert.equal(hits[0].instanceId, 10);
  void camera;
});

test('outside writes hand the mesh back untouched', () => {
  const { mesh, cull } = setup();
  tick(cull, 5000);
  assert.ok(mesh.count < 2000);
  mesh.setMatrixAt(3, new THREE.Matrix4().makeTranslation(1, 2, 3));
  assert.equal(mesh.count, 2000);
  assert.equal(cull.size, 0);
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  mesh.getMatrixAt(3, m); p.setFromMatrixPosition(m);
  assert.deepEqual([p.x, p.y, p.z], [1, 2, 3]);
  mesh.getMatrixAt(1999, m); p.setFromMatrixPosition(m);
  assert.equal(p.x, 1999 * 20);
});

test('disable restores every instance', () => {
  const { mesh, cull } = setup();
  tick(cull, 3000);
  cull.disable();
  assert.equal(mesh.count, 2000);
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  for (const i of [0, 777, 1999]) { mesh.getMatrixAt(i, m); p.setFromMatrixPosition(m); assert.equal(p.x, i * 20); }
});
