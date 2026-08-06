/**
 * FlightAware AeroAPI proxy — HARD DISABLED to stop billing.
 * Live sky uses free OpenSky / ADS-B only.
 */
export default async function handler(_req, res) {
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'no-store');
  res.setHeader('access-control-allow-origin', '*');
  return res.status(503).json({
    error: 'flightaware_disabled',
    hint: 'FlightAware AeroAPI is turned off. Free open-source flight feeds only.',
  });
}
