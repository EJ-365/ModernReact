export const ACTIVE_GROUND_MIN_KTS = 25;

/**
 * Keep known tracks in the refresh pipeline so landing/parking updates can
 * clear their airborne state. New ground tracks still need reported motion,
 * which prevents parked gate traffic from filling the scene.
 */
export function shouldProcessGroundTrack({ distanceMi, groundSpeedKts, wasTracked }) {
  if (!Number.isFinite(distanceMi) || distanceMi >= 4) return false;
  if (wasTracked) return true;
  return Number.isFinite(groundSpeedKts) && groundSpeedKts >= ACTIVE_GROUND_MIN_KTS;
}
