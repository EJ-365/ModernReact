# MovieFinder

MovieFinder is a React movie browsing app built with Vite, React Router, Tailwind CSS, and the TMDB API.

> Status: work in progress. The app is usable, but not fully finished yet.

## Current Features

- Home page with a featured movie, trending movies, and popular movies.
- Movies page powered by TMDB discover results.
- Genre filtering on the Movies page.
- Movie search on the Movies page.
- "See more" pagination for loading additional movie results.
- Duplicate movie prevention when appending paginated results.
- Movie detail pages for home cards and Movies page cards.
- Runtime, release year, rating, overview, genres, and cast display.
- Responsive mobile and desktop layouts.
- Dark/light theme toggle with local storage persistence.
- Mobile navigation drawer.
- Empty Library page placeholder.
- 404 fallback page.

## Tech Stack

- React
- Vite
- React Router DOM
- Tailwind CSS
- TMDB API
- Boxicons
- React Spinners

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_TMDB_KEY=your_tmdb_api_key_here
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Main Routes

- `/` - Home page
- `/home` - Home page
- `/home/:cardId` - Details page for trending/popular home movies
- `/movies` - Movies browsing page
- `/movies/:movieId` - Details page for Movies page results
- `/shows` - TV shows page
- `/library` - Library placeholder
- `*` - Error page

## Project Notes

The app currently uses a mix of React Context and props:

- Context is used for theme, featured movies, trending movies, and popular movies.
- Props are used for Movies page state like search, genre filtering, pagination, and movie results.
- Dynamic detail pages use route params from React Router.

The Movies page fetch chooses between two TMDB endpoints:

- Discover endpoint when there is no search query.
- Search endpoint when the user enters a search query.

Genre filtering is handled with TMDB's `with_genres` query parameter.

## Not Fully Done Yet

Planned or unfinished areas:

- Save/remove movies in the Library page.
- Trailer playback.
- Better loading and error states for all API requests.
- Better search UX, such as debounce or a clear submit flow.
- More complete TV Shows API integration.
- Refactoring repeated movie card and detail UI into reusable components.
- Cleanup of older static data files that are no longer used heavily.
- More polishing for responsive layouts.

## Detailed Documentation

For a deeper explanation of the implementation, see:

```txt
APP_IMPLEMENTATION_GUIDE.md
```
