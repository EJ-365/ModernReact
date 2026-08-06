# API keys & realtime feeds

Keep all secrets in `.env.local` (never commit). The Vite dev server can proxy requests so keys never ship to the browser.

## Free (already wired)

### Open-Meteo — weather
- **Key:** none  
- **Proxy:** `/api/openmeteo/*` → `api.open-meteo.com`  
- Used for: current conditions, hourly forecast when you scrub time off “Live”

### OpenSky Network — aircraft positions (optional upgrade)
- **Key:** none for anonymous (strict rate limits)  
- **Proxy:** `/api/opensky/*` → `opensky-network.org`  
- **Register** for higher limits: https://opensky-network.org/login  
- Not yet merged into the 3D flight animations — flights are still simulated in v5.3

## Paid / partner (real traffic)

Pick one provider for **live segment speeds** and **incidents**:

| Provider | Good for | Typical need |
|----------|----------|--------------|
| **HERE Traffic** | Flow + incidents | API key + billing |
| **TomTom Traffic** | Flow + incidents | API key |
| **Google Routes / Maps** | ETAs, routes | API key + billing |
| **TxDOT** | Houston-specific | Varies; often feeds not a simple REST key |

### Suggested env vars (future)

```env
# .env.local (example — not used by legacy build yet)
TRAFFIC_API_PROVIDER=here
TRAFFIC_API_KEY=your_key_here
FLIGHT_API_PROVIDER=opensky
OPENSKY_USERNAME=
OPENSKY_PASSWORD=
```

### Server-side pattern

```text
Browser  →  /api/traffic/segments  →  Vite proxy / small Node handler  →  HERE/TomTom
```

Never put `TRAFFIC_API_KEY` in `index.html` or any file bundled to the client.

## What stays modeled (no API)

- Vehicle micro-simulation on freeway ribbons  
- Work zones, random stalls/crashes, event traffic at NRG  
- Police patrols / speed traps (simulated alerts)  
- Underpass flooding during storms (weather-driven rules)  

Real traffic APIs would **override segment congestion** and **drive-time chips**, not replace the whole 3D scene.
