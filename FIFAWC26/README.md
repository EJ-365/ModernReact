# FWC26 — FIFA World Cup 2026

A modern React web app for exploring the **2026 FIFA World Cup**: match schedule, teams, host venues, and group standings. Built with React, Vite, Tailwind CSS, and live tournament data.

React
Vite
Tailwind CSS

---

## Features

- **Home** — Split hero with host-nation flags (USA, Canada, Mexico), tournament stats, and upcoming match previews
- **Matches** — Full schedule of all 104 matches with flags, scores, dates, and venues
- **Teams** — All 48 participating nations with flags and group assignments
- **Venues** — 16 host stadiums with capacity info and photos from Pexels
- **Standings** — Group tables computed from match data, plus embeddable WC26 Widget and links to FIFA, ESPN, and BBC
- **404 page** — Custom error page with navigation back home
- **Responsive design** — Mobile-first layout; desktop styles preserved on larger screens
- **Animations** — Page transitions and staggered card fade-in effects
- **Loading states** — Spinners while API data loads

---



## Tech Stack


| Layer           | Technology                                       |
| --------------- | ------------------------------------------------ |
| Framework       | React 19                                         |
| Build tool      | Vite 8                                           |
| Styling         | Tailwind CSS 4                                   |
| Routing         | React Router DOM 7                               |
| Data fetching   | Custom `useFetch` hook                           |
| Images (venues) | [Pexels API](https://www.pexels.com/api/)        |
| Flags           | [flagcdn.com](https://flagcdn.com)               |
| Tournament data | [wheniskickoff.com](https://wheniskickoff.com)   |
| Icons           | [Boxicons](https://boxicons.com/) (`bx` classes) |
| Spinners        | react-spinners                                   |


---



## Getting Started



### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- npm (comes with Node)



### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FIFAWC26

# Install dependencies
npm install
```



### Environment variables

Create a `.env` file in the project root:

```env
VITE_APIKEY=your_pexels_api_key_here
```


| Variable      | Required         | Purpose                                                         |
| ------------- | ---------------- | --------------------------------------------------------------- |
| `VITE_APIKEY` | For venue photos | Pexels API key used on the Venues page to search stadium images |


Get a free API key at [pexels.com/api](https://www.pexels.com/api/).

> **Note:** `.env` is gitignored. Never commit API keys.



### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The `prebuild` script automatically fetches the latest `matches.json`, `teams.json`, and `venues.json` into `public/api/` before building.

Preview the production build:

```bash
npm run preview
```



### Lint

```bash
npm run lint
```

---



## API & Data



### Tournament data ([wheniskickoff.com](http://wheniskickoff.com))

Match, team, and venue data comes from [wheniskickoff.com/data/v1](https://wheniskickoff.com/data/v1).

In **development**, Vite proxies `/api/`* to avoid CORS issues:

```
/api/matches.json  →  https://wheniskickoff.com/data/v1/matches.json
/api/teams.json    →  https://wheniskickoff.com/data/v1/teams.json
/api/venues.json   →  https://wheniskickoff.com/data/v1/venues.json
```

Proxy config lives in `vite.config.js`.

### Production static data

`scripts/fetch-api.mjs` runs before `npm run build` and saves:

- `public/api/matches.json`
- `public/api/teams.json`
- `public/api/venues.json`

Venues, matches, and teams are served as static files in production (no server proxy required).

### Response shape

All wheniskickoff endpoints return JSON in this shape:

```json
{
  "data": [ /* array of items */ ]
}
```

Always access the array via `data.data`, not `data` directly.

### Country flags

API team/match codes are 3-letter FIFA codes (e.g. `MEX`, `USA`). The app maps them to ISO codes for flagcdn in `src/data/countryCodes.js`:

```js
countryCodes["MEX"] // → "mx"
// Used as: https://flagcdn.com/w80/mx.png
```



### Standings

There is no standings endpoint in the wheniskickoff API. The Standings page uses **three layers**:

1. **Computed tables (primary)** — Built from finished group-stage matches in `matches.json` and `teams.json`. Works everywhere, including mobile and Netlify.
2. **WC26 Widget iframe (embed)** — [wc26-widget.vercel.app](https://wc26-widget.vercel.app/groups?theme=dark) — open-source, embeddable group standings designed for websites and READMEs.
3. **External links (fallback)** — FIFA, ESPN, and BBC Sport standings open in a new tab.

**Why not ESPN in an iframe?** ESPN (and most major sports sites) send `X-Frame-Options: SAMEORIGIN`, which blocks embedding on Netlify and mobile browsers. The app links out instead.

| Source | URL | In-app |
|--------|-----|--------|
| WC26 Widget | `https://wc26-widget.vercel.app/groups?theme=dark` | Iframe embed |
| FIFA Official | `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings` | External link |
| ESPN | `https://www.espn.com/soccer/standings/_/league/fifa.world` | External link |
| BBC Sport | `https://www.bbc.com/sport/football/world-cup/table` | External link |

---



## Project Structure

```
FIFAWC26/
├── public/
│   └── api/              # Static JSON (matches, teams) for production builds
├── scripts/
│   └── fetch-api.mjs     # Pre-build script to fetch API data
├── src/
│   ├── assets/           # Images (fwc26logo.svg, etc.)
│   ├── component/
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── UpcomingMatches.jsx
│   ├── data/
│   │   └── countryCodes.js   # FIFA code → ISO flag code map
│   ├── Hooks/
│   │   └── useFetch.js       # Custom data-fetching hook
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Matches.jsx
│   │   ├── Teams.jsx
│   │   ├── Standing.jsx
│   │   ├── Venues.jsx
│   │   └── Error.jsx
│   ├── App.jsx           # Routes + layout
│   ├── main.jsx          # Entry point + BrowserRouter
│   └── index.css         # Tailwind + animations + hero grid
├── .env                  # Local env vars (not committed)
├── vite.config.js        # Vite + Tailwind + API proxy
└── package.json
```

---



## Routes


| Path         | Page      | Description                      |
| ------------ | --------- | -------------------------------- |
| `/`          | Home      | Hero, stats, upcoming matches    |
| `/home`      | Home      | Same as `/`                      |
| `/matches`   | Matches   | Full match schedule              |
| `/teams`     | Teams     | All 48 teams                     |
| `/standings` | Standings | Computed group tables + WC26 Widget embed + external links |
| `/venues`    | Venues    | Host stadiums with Pexels photos |
| `*`          | Error     | 404 page                         |


---



## Key Patterns



### `useFetch` hook

A simple custom hook in `src/Hooks/useFetch.js`:

```js
const { data, loading, error } = useFetch("/api/matches.json");
```

- Sets `loading` to `true` on mount
- Fetches JSON from the given URL
- Returns `{ data, loading, error }`
- Re-fetches when `url` changes

Usage in pages:

```js
const matches = data?.data ?? [];
```



### Page transitions

`App.jsx` uses `useLocation()` and `key={location.pathname}` on `<main>` so the fade-in animation replays on every route change.

### Card animations

Defined in `src/index.css`:

- `.animate-fade-in-up` — fade + slide up on appear
- `.card-hover` — subtle scale on hover
- `.hero-grid` — faint grid background on the home hero

Staggered cards use inline `animationDelay`:

```jsx
style={{ animationDelay: `${index * 70}ms` }}
className="animate-fade-in-up"
```



### Venues + Pexels

`Venues.jsx` fetches stadium photos per venue:

```js
const client = createClient(import.meta.env.VITE_APIKEY);
client.photos.search({ query: venue.name, per_page: 1 });
```

Photos are stored in state keyed by `venue.id`.

---



## Scripts


| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start dev server with HMR and API proxy   |
| `npm run build`   | Fetch API data, then build for production |
| `npm run preview` | Preview production build locally          |
| `npm run lint`    | Run ESLint                                |


---



## Deployment Notes

1. Set `VITE_APIKEY` in your hosting provider's environment variables (e.g. Vercel, Netlify).
2. Run `npm run build` — static match/team JSON is bundled into `public/api/`.
3. If deploying to a static host without a server proxy, ensure `/api/*.json` requests resolve to either:
  - The files in `public/api/`, or
  - A redirect/rewrite to wheniskickoff.com

---



## Known Limitations

- **Standings** — Primary tables are computed from local match data. ESPN/FIFA block iframe embedding; use the WC26 Widget embed or external links in the footer.
- **Venue photos** depend on Pexels search results and may not always match the exact stadium.
- **Pexels API key** is required for venue images; without it, venue cards show without photos.
- The wheniskickoff API has no auth but is a third-party service — availability is not guaranteed.

---



## License

This project is for educational purposes. FIFA, World Cup, and related marks are property of their respective owners.