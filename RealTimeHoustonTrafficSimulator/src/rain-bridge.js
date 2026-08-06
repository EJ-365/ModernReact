import { createRainSystem } from './rain.js';

window.__htsRainInit = (deps) => createRainSystem(deps);
window.wireFlightPick = (f) => {
  if (!f || !f.m) return;
  f.m.userData.flightRef = f;
  f.m.traverse((ch) => {
    if (ch.userData && ch.userData.flightPick) ch.userData.flightRef = f;
  });
};
if (typeof window.__htsRainPending === 'function') window.__htsRainPending();
