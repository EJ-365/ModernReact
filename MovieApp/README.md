# MovieFinder

MovieFinder is a React movie browsing app built with Vite, React Router, Tailwind CSS, and the TMDB API.

> Status: work in progress. The app is usable, but not fully finished yet.

## Current Features

- Home page with a featured movie, trending movies, popular movies, and trending shows.
- Movies page powered by TMDB discover results.
- TV Shows page powered by TMDB discover results.
- Genre filtering on the Movies page.
- Movie search on the Movies page.
- "See more" pagination for loading additional movie results.
- Duplicate movie prevention when appending paginated results.
- Movie detail pages for home cards and Movies page cards.
- TV show detail pages with runtime, cast, overview, and genre information.
- Library page for saved movies and TV shows.
- Clickable heart icons for adding/removing items from the Library.
- Library persistence with local storage.
- Runtime, release year, rating, overview, genres, and cast display.
- Responsive mobile and desktop layouts.
- Dark/light theme toggle with local storage persistence.
- Mobile navigation drawer.
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
- `/shows/:showId` - Details page for TV show results
- `/library` - Saved movies and TV shows
- `*` - Error page

## Project Notes

The app currently uses a mix of React Context and props:

- Context is used for theme, featured movies, trending movies, popular movies, and trending shows.
- Props are used for Movies and Shows page state like search, genre filtering, pagination, and results.
- Dynamic detail pages use route params from React Router.
- Saved library items are stored in `localStorage` through `src/utils/libraryStorage.js`.

The Movies page fetch chooses between two TMDB endpoints:

- Discover endpoint when there is no search query.
- Search endpoint when the user enters a search query.

Genre filtering is handled with TMDB's `with_genres` query parameter.

The Library feature stores a small saved item object for each movie or show:

- ID
- Media type
- Title
- Poster path
- Vote average
- Release date or first air date

## Not Fully Done Yet

Planned or unfinished areas:

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
