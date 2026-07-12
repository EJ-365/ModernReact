/**
 * Single Three.js instance for sim + rain (Vite-bundled 0.185).
 */
import * as THREE from 'three';
import { applyThreeCompat } from './three-compat.js';

applyThreeCompat(THREE);
window.THREE = THREE;

window.HTS_THREE = {
  version: THREE.REVISION,
  source: 'vite',
};

console.log(
  '%cHTS Three · r' + THREE.REVISION + ' (Vite)',
  'color:#7fd6a0',
);

export { THREE };
export default THREE;
