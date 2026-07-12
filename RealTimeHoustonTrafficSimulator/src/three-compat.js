/**
 * r128 → modern Three (0.185) compatibility.
 * Note: the ESM `three` namespace is frozen — do not assign aliases onto it.
 * @param {typeof import('three')} THREE
 */
export function applyThreeCompat(THREE) {
  const srgb = THREE.SRGBColorSpace;
  const linear = THREE.LinearSRGBColorSpace;
  const proto = THREE.WebGLRenderer && THREE.WebGLRenderer.prototype;
  if (!proto || srgb == null) return THREE;

  try {
    Object.defineProperty(proto, 'outputEncoding', {
      configurable: true,
      enumerable: true,
      get() {
        return this.outputColorSpace;
      },
      set(v) {
        this.outputColorSpace = v === srgb || v === linear ? v : srgb;
      },
    });
  } catch {
    /* already defined / non-configurable — app uses outputColorSpace directly */
  }
  return THREE;
}
