/**
 * TomTom Traffic API proxy — HARD DISABLED to stop billing.
 */
export default async function handler(_req, res) {
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('access-control-allow-origin', '*');
  return res.status(503).json({
    error: 'tomtom_disabled',
    hint: 'TomTom is turned off. Free TranStar / modeled traffic only.',
  });
}
