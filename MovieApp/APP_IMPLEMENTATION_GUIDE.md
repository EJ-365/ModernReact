# MovieApp Implementation Guide

This document explains the MovieApp project in detail: how the application starts, how data moves through the app, how routing works, how each component is built, why each major function exists, and how the UI classes are being used.

The app is a React movie browsing application built with Vite, React Router, Tailwind CSS, Boxicons, and the TMDB API.

## 1. Project Purpose

The goal of this app is to let a user:

- View a featured movie on the home page.
- View trending movies.
- View popular movies.
- View trending TV shows.
- Click a movie card and open a details page.
- Browse a larger Movies page using TMDB discover results.
- Browse a larger TV Shows page using TMDB discover results.
- Filter Movies and TV Shows page results by genre.
- Search movies and TV shows by text.
- Load more movies and TV shows using pagination.
- Open a movie detail page from the Movies page.
- Open a TV show detail page from the Shows page or trending shows.
- Save and remove movies and TV shows in a local Library.
- View metadata such as rating, year, runtime, overview, genres, and cast.
- Switch between dark and light theme.
- Navigate through Home, Movies, Shows, Library, and fallback error routes.

The app is not just a static card layout anymore. It now has several important application behaviors:

- API fetching through TMDB.
- App-level state for shared data.
- Context providers for home page movie groups.
- Route parameters for detail pages.
- Responsive design using Tailwind classes.
- Mobile navigation drawer.
- Search and filtering logic.
- Pagination with duplicate movie prevention.
- Local storage persistence for theme and saved library items.
- Custom favicon branding.

## 2. Application Startup

### File: `src/main.jsx`

This is the first React file that runs in the browser.

```jsx
import { StrictMode } from "react";
```

`StrictMode` is a React development helper. It does not render visible UI. It helps catch unsafe patterns in development. One important thing it can do is run effects twice in development, which is why pagination logic needs to be careful about duplicate data.

```jsx
import { createRoot } from "react-dom/client";
```

`createRoot` connects the React app to the real DOM element in `index.html`.

```jsx
import "./index.css";
```

This imports the global CSS file. That file loads Tailwind and defines app-wide utility behavior such as the custom dark-mode variant.

```jsx
import App from "./App.jsx";
```

`App` is the root component of the whole application.

```jsx
import { BrowserRouter } from "react-router-dom";
```

`BrowserRouter` enables URL based routing. Without this wrapper, components like `Routes`, `Route`, `Link`, `NavLink`, `useNavigate`, and `useParams` would not work.

```jsx
createRoot(document.getElementById("root")).render(...)
```

This finds the `<div id="root"></div>` inside `index.html` and tells React to render the app there.

```jsx
<StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</StrictMode>
```

The app is wrapped in `BrowserRouter` so every route and link works. It is also wrapped in `StrictMode` for development checks.

## 3. HTML Shell

### File: `index.html`

This is the browser entry file that Vite serves.

```html
<!doctype html>
```

This tells the browser to use modern HTML parsing.

```html
<html lang="en">
```

This sets the document language to English.

```html
<meta charset="UTF-8" />
```

This supports normal text characters.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

This is important for responsive design. Without it, mobile Tailwind layouts would not scale correctly.

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

This points the browser tab icon to the custom MovieFinder favicon in `public/favicon.svg`.

```html
<link href="https://cdn.boxicons.com/..." rel="stylesheet">
```

These links load Boxicons. The app uses icon class names like:

- `bx bx-home-alt`
- `bx bx-movie`
- `bx bx-heart`
- `bxf bx-heart`
- `bx bx-chevron-left`
- `bxf bx-star`
- `bxf bx-play`

The icons work because these CSS files are loaded globally.

```html
<div id="root"></div>
```

This is where React mounts the entire application.

```html
<script type="module" src="/src/main.jsx"></script>
```

This loads the React entry file.

## 4. Tooling And Dependencies

### File: `package.json`

Important scripts:

- `npm run dev`: starts the Vite development server.
- `npm run build`: creates a production build.
- `npm run lint`: runs ESLint.
- `npm run preview`: previews the built app.

Important dependencies:

- `react`: the UI library.
- `react-dom`: renders React into the browser DOM.
- `react-router-dom`: handles routing, links, route params, and navigation.
- `tailwindcss`: utility first styling.
- `@tailwindcss/vite`: connects Tailwind to Vite.
- `react-spinners`: gives you loading UI such as `GridLoader`.

### File: `vite.config.js`

```js
plugins: [react(), tailwindcss()]
```

This enables React JSX and Tailwind CSS inside Vite.

```js
server: {
  watch: {
    usePolling: true,
  },
}
```

Polling helps file watching work reliably in environments like OneDrive, network folders, or Windows setups where normal file watching can miss changes.

### File: `eslint.config.js`

ESLint checks JavaScript and JSX files. It includes:

- Recommended JavaScript rules.
- React Hooks rules.
- React Refresh rules for Vite.
- Browser globals.
- JSX parsing support.

This is why you see warnings about missing dependencies in `useEffect`, invalid JSX, unused props, or `class` vs `className`.

## 5. Global CSS

### File: `src/index.css`

```css
@import "tailwindcss";
```

This imports Tailwind CSS so utility classes work.

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This customizes Tailwind dark mode so any element inside `.dark` can use `dark:` classes.

In `App.jsx`, this line toggles the `.dark` class:

```js
document.documentElement.classList.toggle("dark", darkMode);
```

That means dark mode is applied to `<html>`, and every nested component can use classes like:

- `dark:text-white`
- `dark:bg-[#19192d]`
- `dark:hover:bg-white/10`

## 6. TMDB API Helper

### File: `src/api/tmdb.js`

```js
export const BASE_URL = "https://api.themoviedb.org/3";
```

This keeps the base TMDB URL in one place. The app builds endpoints from it.

```js
export const API_KEY = import.meta.env.VITE_TMDB_KEY;
```

This reads your API key from `.env`. Vite exposes client side env variables only when they start with `VITE_`.

Example `.env` shape:

```txt
VITE_TMDB_KEY=your_key_here
```

Why this file exists:

- It avoids repeating the API key import pattern everywhere.
- It makes endpoints easier to read.
- If the base URL changes, you update one file.

## 7. Custom Hook

### File: `src/hooks/useMovies.js`

```js
export function useMovies(url) {
```

This hook receives a URL and returns an array of movies.

```js
const [movies, setMovies] = useState([]);
```

The hook starts with an empty array so components can safely call `.map()` after data loads.

```js
useEffect(() => {
  fetch(url)
```

Fetching is a side effect, so it belongs inside `useEffect`.

```js
.then((response) => response.json())
```

Converts the HTTP response into JavaScript data.

```js
.then((data) => {
  setMovies(data.results || []);
})
```

TMDB list endpoints return movie arrays inside `data.results`. If `results` is missing, it falls back to `[]`.

```js
}, [url]);
```

The hook refetches when the URL changes.

Why you chose this pattern:

- Trending, popular, and now playing all fetch list endpoints.
- Instead of writing the same fetch logic three times, `useMovies` reuses it.

## 8. Context Files

The app uses React Context to share specific groups of data without passing props through many levels.

### File: `src/Contexts/ThemeContext.js`

```js
export const ThemeContext = createContext();
```

This context stores:

- `darkMode`
- `setDarkMode`

It lets `Navbar` toggle theme without passing props down manually.

### File: `src/Contexts/featuredMovieContext.js`

```js
export const FeaturedMovieContext = createContext();
```

This context currently shares:

- `featuredMovie`
- `topFiveTrending`
- `topFivePopular`
- `movieGenres`

It is used by:

- `FeaturedMovie`
- `CardDetails`

### File: `src/Contexts/TrendingMoviesContext.js`

Stores `topFiveTrending` for the `TrendingMovies` component.

### File: `src/Contexts/PopularMoviesContext.js`

Stores `topFivePopular` for the `PopularMovies` component.

### File: `src/Contexts/trendingShowsContext.js`

Stores `topFiveShows` for the `TrendingShows` component.

Why multiple contexts exist:

- Trending and popular are separate home sections.
- Trending shows are a separate home section with TV data.
- Featured data is shared with both the featured card and home detail route.
- Theme is separate because it affects the entire UI, not movie data.

## 9. Root Application Logic

### File: `src/App.jsx`

`App.jsx` is the main controller of the app.

It handles:

- Theme state.
- TMDB list fetching.
- Genre state.
- Search state.
- Pagination state.
- Movie and TV show browse state.
- Context provider values.
- Route definitions.

### Imports

```js
import { useEffect, useMemo, useState } from "react";
```

- `useState` stores local app state.
- `useEffect` runs side effects like API calls and theme changes.
- `useMemo` memoizes context values so provider objects do not get recreated unnecessarily on unrelated renders.

```js
import { Routes, Route } from "react-router-dom";
```

These define which component renders for each URL.

### State

```js
const [genres, setGenres] = useState([]);
```

Used by the Movies page genre buttons.
Used by the Movies and Shows page genre buttons.

```js
const [selectedGenre, setSelectedGenre] = useState("");
```

Stores the selected TMDB genre id. Empty string means "all results".

```js
const [movieGenres, setMovieGenres] = useState([]);
```

Used for translating genre ids into names for featured/detail displays.

```js
const [searchQuery, setSearchQuery] = useState("");
```

Stores the current search query from the search input.

```js
const [allMovies, setAllMovies] = useState({
  movies: [],
  totalPages: 0,
});
```

Stores Movies page results. It is an object instead of a plain array because the app needs both:

- the list of movies
- the total number of pages

```js
const [shows, setAllShows] = useState({
  shows: [],
  showsTotalPages: 0,
});
```

Stores TV Shows page results with the same object-shaped pattern as `allMovies`.

```js
const [page, setPage] = useState(1);
```

Tracks the current page for discover/search pagination.

### Theme State

The theme state reads from local storage first:

```js
const saved = localStorage.getItem("theme");
```

If saved theme is `"dark"`, dark mode starts as true.
If saved theme is `"light"`, dark mode starts as false.

If no saved theme exists, it checks the user's system preference:

```js
window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
```

Then this effect applies the class:

```js
document.documentElement.classList.toggle("dark", darkMode);
localStorage.setItem("theme", darkMode ? "dark" : "light");
```

Why:

- The `.dark` class is needed for Tailwind `dark:` styles.
- Local storage remembers the user's choice.

### Trending Movies

```js
const trendingUrl = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
const trendingMovies = useMovies(trendingUrl);
const topFiveTrending = trendingMovies.slice(0, 5);
```

This fetches daily trending movies and keeps only the first five for the home section.

```js
const trendingMoviesValue = useMemo(() => {
  return { topFiveTrending };
}, [topFiveTrending]);
```

This object is passed into `TrendingMoviesContext.Provider`.

### Popular Movies

```js
const popularUrl = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
const popularMovies = useMovies(popularUrl);
const topFivePopular = popularMovies.slice(0, 5);
```

This gets popular movies and keeps five for the home page.

### Genre List For Featured And Details

```js
fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
```

This loads all TMDB movie genres. TMDB movie list items often contain only ids like `[28, 12]`. This genre list lets the app convert ids into names like "Action" and "Adventure".

### Featured Movie

```js
const featuredUrl = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`;
const featuredMovies = useMovies(featuredUrl);
const featuredMovie = featuredMovies[0];
```

The featured movie is the first movie from TMDB's now playing results.

### Trending Shows

```js
const trendingShowUrl = `${BASE_URL}/trending/tv/day?api_key=${API_KEY}`;
const trendingShows = useMovies(trendingShowUrl);
const topFiveShows = trendingShows.slice(0, 5);
```

This fetches daily trending TV shows and keeps the first five for the home page.

```js
const trendingShowsValue = useMemo(() => {
  return { topFiveShows };
}, [topFiveShows]);
```

This object is passed into `TrendingShowsContext.Provider`.

### Movies Page Fetch

This is the most complex fetch in the app.

```js
const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : "";
```

If a genre is selected, this adds TMDB's genre filter.

```js
const url = searchQuery === ""
  ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}${genreParam}`
  : `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchQuery}&page=${page}`;
```

If there is no search query, use the discover endpoint.

If there is a search query, use the search endpoint.

Why:

- Discover supports browsing and genre filtering.
- Search supports text queries.

```js
if (page === 1) {
  setAllMovies({
    movies: data.results ?? [],
    totalPages: data.total_pages > 500 ? 500 : data.total_pages,
  });
}
```

When page is 1, replace the movie list. This is important when switching genre or search term.

```js
const combinedMovies = [...prev.movies, ...(data.results ?? [])];
```

For page 2 and beyond, combine old results with new results.

```js
movies: [
  ...new Map(
    combinedMovies.map((movie) => [movie.id, movie]),
  ).values(),
],
```

This removes duplicate movies by id.

Why this was added:

- React keys use `movie.id`.
- If the same movie appears twice, React warns about duplicate keys.
- `Map` keeps only one movie per id.

```js
}, [page, selectedGenre, searchQuery]);
```

The effect reruns when:

- the page changes
- the selected genre changes
- the search query changes

### TV Shows Page Fetch

The Shows page uses the same pattern as Movies, but with TMDB's TV endpoints.

```js
const url = searchQuery === ""
  ? `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}${genreParam}`
  : `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${searchQuery}&page=${page}`;
```

When there is no search query, the app browses TV shows with discover. When there is a search query, it searches TV shows by text.

For page 1, the app replaces the `shows` array. For later pages, it appends new shows and dedupes by id:

```js
shows: [
  ...new Map(
    combinedShows.map((show) => [show.id, show]),
  ).values(),
],
```

### Routes

```jsx
<Route path="/" element={<Home />} />
<Route path="/home" element={<Home />} />
```

Both root and `/home` show the home page.

```jsx
<Route path="/home/:cardId" element={<CardDetails />} />
```

This route shows details for a home page movie. `:cardId` becomes available through `useParams`.

```jsx
<Route path="/movies/:movieId" element={<MoviesDetail />} />
```

This route shows details for a movie from the Movies page. It uses `movieId`.

```jsx
<Route path="/shows/:showId" element={<ShowDetail />} />
```

This route shows details for a TV show from the Shows page or Trending Shows section. It uses `showId`.

```jsx
<Route path="/movies" element={<Movies ... />} />
```

This renders the Movies browsing page and passes the state/functions it needs.

```jsx
<Route path="/shows" element={<Shows ... />} />
```

This renders the TV Shows browsing page and passes show results, genre/search state, and pagination handlers.

```jsx
<Route path="/library" element={<Library />} />
```

This renders saved movies and TV shows from local storage.

```jsx
<Route path="*" element={<ErrorPage />} />
```

This catches unknown URLs.

## 10. Search Component

### File: `src/Components/Search.jsx`

The Search component keeps local input state and only updates the parent search query when the user presses Enter or clicks the search icon.

```js
const [localQuery, setLocalQuery] = useState("");
```

This lets the input update immediately without firing a search on every keystroke.

```js
function handleSearch() {
  setSearchQuery(localQuery);
}
```

This sends the current input value to `App.jsx`.

```js
function handleKeyDown(event) {
  if (event.key === "Enter") {
    handleSearch();
  }
}
```

Pressing Enter triggers search.

### UI Structure

```jsx
<section className="flex items-center justify-center px-3">
```

- `flex`: puts input and search icon in one row.
- `items-center`: vertically aligns them.
- `justify-center`: centers the search row.
- `px-3`: gives mobile horizontal padding.

```jsx
<div className="relative w-full md:w-3/4 mx-2 md:mx-5">
```

This wrapper is `relative` so the X icon can be positioned inside the input.

- `w-full`: mobile input uses full available width.
- `md:w-3/4`: larger screens use 75 percent width.
- `mx-2 md:mx-5`: smaller margins on mobile, larger margins on desktop.

```jsx
className="w-full p-1 pr-9 rounded-sm ..."
```

- `w-full`: input fills wrapper.
- `p-1`: small padding.
- `pr-9`: extra right padding so text does not overlap the X icon.
- `rounded-sm`: slight rounded corners.
- `ring-2`: visible outline ring.
- `bg-gray-400/20`: transparent gray background.
- `dark:ring-zinc-300/20`: softer dark-mode ring.

The X icon:

```jsx
className="bx bx-x absolute right-2 top-1/2 -translate-y-1/2 ..."
```

- `absolute`: positions inside relative wrapper.
- `right-2`: pins it to the right.
- `top-1/2 -translate-y-1/2`: vertically centers it.
- `rounded-full`: circular icon background.
- `cursor-pointer`: indicates it can be clicked.

Clicking X:

```js
setSearchQuery("");
setLocalQuery("");
setPage(1);
```

This clears the search and returns pagination to page 1.

## 11. Movies Page

### File: `src/Pages/Movies.jsx`

This page displays:

- heading
- search input
- genre filter buttons
- page indicator
- movie cards
- see more button

The component receives most of its state from `App.jsx`.

### Props

- `allMovies`: object with `movies` and `totalPages`.
- `setAllMovies`: clears the list when genre changes.
- `setPage`: resets or changes the current page.
- `page`: displays current page number.
- `pageIncrement`: load more handler.
- `genres`: list of genre objects.
- `setGenres`: stores fetched genres.
- `selectedGenre`: active genre id.
- `setSelectedGenre`: updates selected genre.
- `setSearchQuery`: passed to Search.

### Genre Fetch

```js
useEffect(() => {
  fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
    .then((res) => res.json())
    .then((data) => setGenres(data.genres))
}, [setGenres]);
```

This fetches the genre list on mount. `setGenres` is included because ESLint expects dependencies used inside effects.

### All Movies Button

Clicking All:

```js
setSelectedGenre("");
setPage(1);
setAllMovies({ movies: [], totalPages: 0 });
```

Why:

- Clear active genre.
- Go back to first page.
- Clear old results before the new fetch replaces them.

### Genre Buttons

```js
setSelectedGenre(genre.id);
setPage(1);
setAllMovies({ movies: [], totalPages: 0 });
```

This selects a TMDB genre id. `App.jsx` sees `selectedGenre` change and fetches `/discover/movie` with `with_genres`.

The key is on the outer div:

```jsx
<div key={genre.id}>
```

React needs a stable key for items rendered by `.map()`.

### Active Button Classes

For All:

```js
selectedGenre === "" ? "bg-violet-800 text-white" : ...
```

For each genre:

```js
selectedGenre === genre.id ? "bg-violet-800 text-white" : ...
```

This makes the active filter visually different.

### Movie Cards

```jsx
{allMovies.movies.map((movie) => (
  <Link to={`/movies/${movie.id}`} key={`${movie.id}`}>
```

Each card links to a Movies detail route. The key uses `movie.id`, which is correct because each movie should have a unique TMDB id.

The poster URL uses TMDB image paths:

```jsx
https://image.tmdb.org/t/p/w500${movie.poster_path}
```

`w500` chooses a medium poster image size.

### See More Button

```jsx
<button onClick={pageIncrement}>
```

Clicking it increases `page`. `App.jsx` then fetches the next page and appends results.

## 12. Movie Detail Page From Movies

### File: `src/Components/MoviesDetail.jsx`

This page is used for `/movies/:movieId`.

It fetches the movie directly by id, which is the best approach for route pages because it works even after refresh.

### Route Param

```js
const { movieId } = useParams();
```

If the URL is `/movies/550`, `movieId` is `"550"`.

### Fetch Movie By Id

```js
fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`)
```

This gets the full movie object, including:

- title
- overview
- poster path
- backdrop path
- genres
- release date
- runtime

### Runtime Fetch

There is a second fetch for runtime:

```js
fetch(`https://api.themoviedb.org/3/movie/${currentMovie.id}?api_key=${API_KEY}`)
```

This stores `data.runtime` in `runtime`. Since the first movie-by-id response also includes runtime, this could be simplified later, but the current code works.

### Credits Fetch

```js
fetch(`https://api.themoviedb.org/3/movie/${currentMovie.id}/credits?api_key=${API_KEY}`)
```

This returns cast and crew. The app uses `movieCredit.cast`.

### Loading State

```jsx
if (!currentMovie) return (...)
```

Until the API responds, the component shows `GridLoader`.

### Navigation

```js
navigate("/movies");
```

The back chevron returns to the Movies page.

### Helper Functions

`getReleaseYear`:

- Converts `"2024-05-01"` into `2024`.

`getRuntime`:

- Converts minutes into `"2h 05m"` style text.

### Hero Backdrop

The hero uses:

```jsx
backgroundImage: `url(https://image.tmdb.org/t/p/original${currentMovie.backdrop_path})`
```

`original` loads a large backdrop image.

Important Tailwind classes:

- `bg-cover`: image fills the area.
- `bg-center`: image stays centered.
- `h-100`: controls hero height.
- `relative`: allows overlay children to position.
- `overflow-hidden`: prevents overlay/image overflow.

Overlay:

```jsx
dark:bg-linear-to-l from-[#08070fb9] via-black/70 to-black/40 absolute inset-0
```

This darkens the backdrop for readability.

### Main Detail Card

Classes:

- `flex`: layout for poster and content.
- `flex-col md:flex-row`: stacks on mobile, row on medium screens.
- `mx-4 md:mx-20`: small mobile margin, larger desktop margin.
- `items-center md:items-start`: centered on mobile, aligned top on desktop.
- `backdrop-blur-2xl`: glass effect.
- `border-2`: visible border.
- `rounded-t-3xl rounded-b-2xl`: rounded card edges.
- `p-4 md:p-10`: smaller mobile padding, larger desktop padding.

### Poster

Classes:

- `w-full max-w-64`: mobile poster fits the screen.
- `md:w-240`: large width on desktop.
- `rounded-3xl`: rounded poster corners.
- `h-auto md:h-128`: natural height on mobile, fixed height on desktop.

### Details Text

Title:

- `md:text-5xl`: large desktop title.
- `text-3xl`: smaller mobile title.
- `font-bold`: strong emphasis.
- `leading-snug`: readable line height.
- `text-center`: centered title.

Details row:

- rating with star icon
- release year
- runtime

Genre chips:

```jsx
currentMovie.genres.map(...)
```

Movie-by-id endpoint gives genres as full objects, so no id-to-name conversion is needed here.

### Cast Section

The cast section has two modes:

- default: `slice(0, 10)`
- expanded: `slice(11)`

`showMoreCast` toggles between them.

Small screen cast layout:

- `grid grid-cols-2`: two columns on mobile.
- `md:flex md:flex-wrap`: desktop returns to flex layout.
- `max-w-32`: keeps mobile actor cards narrow.
- `wrap-break-word`: long names and characters wrap.

## 13. Card Details Page From Home

### File: `src/Pages/CardDetails.jsx`

This page is used for `/home/:cardId`.

It is similar to `MoviesDetail`, but its data source is different.

Instead of fetching the whole movie by id first, it looks for the movie inside:

- `topFiveTrending`
- `topFivePopular`

```js
const currentMovie =
  topFiveTrending?.find((movie) => movie.id === Number(cardId)) ||
  topFivePopular?.find((movie) => movie.id === Number(cardId));
```

Why:

- Home cards already have movie data.
- The route id is matched against those arrays.

Important note:

- This works for movies that exist in those top-five home lists.
- For a more robust future version, this page could fetch by id like `MoviesDetail`.

### Genre Conversion

Home list movies have `genre_ids`, not full `genres`.

```js
const genreId = currentMovie.genre_ids.map((id) => id);
const matchedGenres = movieGenres.filter((genre) =>
  genreId.includes(genre.id),
);
```

This converts ids into genre names by comparing them against the global TMDB genre list.

### UI

The UI matches the Movies detail style:

- hero backdrop
- overlay
- back chevron
- poster
- title
- rating/year/runtime
- genre chips
- buttons
- overview
- cast

The back button navigates to `/home`.

## 14. Home Page

### File: `src/Pages/Home.jsx`

This is a simple composition page:

```jsx
<FeaturedMovie />
<TrendingMovies />
<PopularMovies />
<TrendingShows />
```

It does not fetch data itself. `App.jsx` fetches data, providers pass data down, and these components consume context.

Why this is good:

- Home stays simple.
- Each section handles its own display.
- App handles data orchestration.

## 15. Featured Movie

### File: `src/Components/FeaturedMovie.jsx`

This component reads:

```js
const { featuredMovie, movieGenres } = useContext(FeaturedMovieContext);
```

If `featuredMovie` is missing, it shows a skeleton loading block.

It gets genre ids from:

```js
featuredMovie.genre_ids
```

Then matches them against `movieGenres`.

The backdrop uses:

```js
https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}
```

UI choices:

- `container mx-auto`: center the feature card.
- `md:w-3/4`: wide but not full desktop width.
- `rounded-3xl`: large card radius.
- `bg-cover bg-center`: cinematic background crop.
- overlay gradient: improves readability.
- `z-10`: puts content above overlay.
- genre tags use purple border/background to match app theme.
- title uses large white text.
- overview uses `line-clamp-3` to avoid oversized text.
- buttons use violet and dark neutral styles.

## 16. Trending Movies

### File: `src/Components/TrendingMovies.jsx`

This component reads:

```js
const { topFiveTrending } = useContext(TrendingMoviesContext);
```

It maps over five trending movies and creates links:

```jsx
to={`/home/${trendingNow.id}`}
```

That opens `CardDetails`.

Card UI:

- responsive column on mobile
- row layout on desktop
- poster with `aspect-2/3`
- hover scale
- clickable `LibraryHeartButton` overlay
- dark gradient hover overlay
- title hover turns violet
- release date and rating below

## 17. Popular Movies

### File: `src/Components/PopularMovies.jsx`

This is the same card idea as trending, but it reads:

```js
const { topFivePopular } = useContext(PopularMoviesContext);
```

Each popular card links to:

```jsx
to={`/home/${popularMovie.id}`}
```

That means popular cards also use `CardDetails`.

Why `CardDetails` searches both lists:

- A clicked movie may come from trending.
- Or it may come from popular.
- So `CardDetails` checks both.

## 18. Trending Shows

### File: `src/Components/TrendingShows.jsx`

This component reads:

```js
const { topFiveShows } = useContext(TrendingShowsContext);
```

It maps over five trending TV shows and creates links:

```jsx
to={`/shows/${trendingNow.id}`}
```

That opens `ShowDetail`, not `CardDetails`, because TV shows need TMDB's `/tv` detail and credits endpoints.

The card UI matches the movie sections, but uses TV show fields:

- `name` instead of `title`
- `first_air_date` instead of `release_date`
- `mediaType: "show"` when saving to the Library

## 19. Library Heart Button

### File: `src/Components/LibraryHeartButton.jsx`

This reusable button powers the heart overlays on movie and TV cards.

It receives a small `item` object:

```js
{
  id,
  mediaType,
  title,
  poster_path,
  voteAverage,
  releaseDate,
}
```

The initial saved state is read from local storage:

```js
const [isSaved, setIsSaved] = useState(() =>
  isLibraryItemSaved(item.id, item.mediaType),
);
```

The click handler stops the surrounding card link from navigating:

```js
event.preventDefault();
event.stopPropagation();
```

Then it either saves or removes the item:

```js
saveLibraryItem(item);
removeLibraryItem(item.id, item.mediaType);
```

The icon changes visually:

- unsaved: `bx bx-heart`
- saved: `bxf bx-heart`

## 20. Navbar

### File: `src/Components/Navbar.jsx`

The Navbar has two versions:

- mobile top bar and drawer
- desktop sidebar

### Theme

```js
const { darkMode, setDarkMode } = useContext(ThemeContext);
```

This lets the navbar toggle the global app theme.

### Mobile State

```js
const [mobileOpen, setMobileOpen] = useState(false);
```

This controls whether the mobile drawer is visible.

### Mobile Top Bar

Classes:

- `md:hidden`: only show on mobile.
- `sticky top-0`: stays at top while scrolling.
- `z-50`: stays above page content.
- `bg-white dark:bg-linear-to-r`: light and dark backgrounds.
- `border-b`: separates the header from content.

The menu button switches icon:

```js
mobileOpen ? "bx-x" : "bx-menu"
```

The theme button switches icon:

```js
darkMode ? "bxf bx-sun" : "bxf bx-moon"
```

### Desktop Sidebar

Classes:

- `hidden md:flex`: hidden on mobile, shown from medium screens.
- `md:flex-col`: vertical layout.
- `w-60`: fixed sidebar width.
- `border-r-2`: right border.

Navigation uses `NavLink` so active links can be styled.

### Mobile Drawer

When `mobileOpen` is true:

- a dark overlay covers the screen
- a side drawer appears from the left

Each `NavLink` closes the drawer on click:

```js
onClick={() => setMobileOpen(false)}
```

## 21. Shows Page

### File: `src/Pages/Shows.jsx`

This page displays TV show results from TMDB. `App.jsx` owns the fetched show data and passes it into this component.

It renders:

- a heading
- search input
- dynamic genre filter buttons
- page indicator
- show cards
- see more button

The UI matches movie card styling:

- poster image
- clickable `LibraryHeartButton`
- hover overlay
- show name
- first air date
- rating

When a genre is clicked, the Shows page clears the current list and resets pagination:

```js
setAllShows({ shows: [], showsTotalPages: 0 });
setPage(1);
```

Each card links to:

```jsx
to={`/shows/${show.id}`}
```

That opens `ShowDetail`.

## 22. Library Page

### File: `src/Pages/Library.jsx`

This page displays saved movies and TV shows from local storage.

It initializes state from the storage helper:

```js
const [libraryItems, setLibraryItems] = useState(() => getLibraryItems());
```

If the library is empty, it shows an empty-state screen and a button that navigates to the Movies page:

```js
navigate("/movies");
```

If saved items exist, it renders a responsive grid. Each item links back to the correct detail route:

```jsx
`/${item.mediaType === "movie" ? "movies" : "shows"}/${item.id}`
```

The remove button calls:

```js
setLibraryItems(removeLibraryItem(id, mediaType));
```

UI purpose:

- Show saved movies and TV shows.
- Let users open saved detail pages.
- Let users remove saved items.
- Keep saved items persisted between browser sessions.

## 23. Error Page

### File: `src/Pages/ErrorPage.jsx`

This is the fallback route for unknown URLs.

It uses:

```js
navigate("/home")
```

The UI displays a 404 style message and a button to go home.

It is connected by:

```jsx
<Route path="*" element={<ErrorPage />} />
```

## 24. Favicon

### File: `public/favicon.svg`

The app uses a custom SVG favicon instead of the default Vite icon.

It is linked in `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

The favicon design matches the app's movie theme:

- dark rounded background
- purple movie frame
- white play icon
- small heart accent

## 25. Data Files

### `src/data/shows.js`

This is older static TV show data from an earlier version of the app. The current Shows page uses TMDB discover/search data instead.

It can be kept as reference data or removed in a cleanup pass if nothing imports it.

### `src/data/movies.js`

This is older static movie data. The current Movies page now uses TMDB discover/search data instead.

### `src/data/popularMovies.js`, `src/data/trendingMovies.js`, `src/data/showMoviesAndShow.js`

These are local/static data files from earlier versions of the app. The current main home sections use live TMDB data from `App.jsx` and `useMovies`.

## 26. Tailwind Class Patterns Used Across The App

### Layout

- `flex`: creates a flexbox row by default.
- `flex-col`: stacks children vertically.
- `md:flex-row`: switches to row layout on medium screens.
- `items-center`: center children vertically.
- `justify-center`: center children horizontally.
- `justify-between`: push children apart.
- `flex-wrap`: allow cards/chips to wrap to new lines.
- `grid grid-cols-2`: two-column mobile cast layout.

### Spacing

- `mx-*`: horizontal margin.
- `my-*`: vertical margin.
- `px-*`: horizontal padding.
- `py-*`: vertical padding.
- `gap-*`: spacing between flex/grid children.
- `space-x-*`: horizontal space between direct children.
- `space-y-*`: vertical space between direct children.

### Responsive Classes

The app uses `md:` for larger screens.

Example:

```txt
mx-4 md:mx-20
```

Means:

- mobile: `mx-4`
- medium and above: `mx-20`

This pattern was used heavily to keep mobile layouts readable while preserving your larger-screen design.

### Colors

The app uses a purple/dark theme:

- `bg-violet-800`
- `bg-[#8b5cf6]`
- `text-violet-500`
- `dark:bg-[#19192d]`
- `dark:bg-[#1b1b2e]`
- `text-zinc-400`

### Dark Mode

Classes like:

- `dark:text-white`
- `dark:bg-[#19192d]`
- `dark:hover:bg-white/10`

work because `App.jsx` toggles `.dark` on the document root.

### Hover And Transition

- `hover:scale-104`: slightly enlarges cards/buttons.
- `hover:text-violet-500`: changes text color on hover.
- `transition-colors`: animates color changes.
- `duration-200`, `duration-300`: controls transition speed.
- `cursor-pointer`: makes clickable UI feel interactive.

### Images

- `aspect-2/3`: keeps posters in movie poster ratio.
- `object-cover`: crop image to fill its box.
- `rounded-xl`, `rounded-3xl`: rounded image corners.
- `bg-cover bg-center`: backdrop fills hero area and stays centered.

## 27. Important Bugs Fixed During Development

### Detail page refresh bug

Problem:

The app tried to read `currentMovie.id` before the data existed.

Fix:

Use optional chaining and guard effects:

```js
if (!currentMovie?.id) return;
```

### Popular movie detail bug

Problem:

`CardDetails` only searched trending movies.

Fix:

Search both trending and popular lists.

### Duplicate key bug

Problem:

Pagination could append the same movie twice.

Fix:

Use `Map` to remove duplicate ids.

### Genre filtering bug

Problem:

`setAllMovies([])` broke state shape because `allMovies` is an object.

Fix:

Use:

```js
setAllMovies({ movies: [], totalPages: 0 });
```

### Search URL syntax bug

Problem:

JSX/JS had invalid syntax:

```js
return {`${url}`}
```

Fix:

Assign the URL string to a variable and pass it to `fetch`.

### Trending shows detail route bug

Problem:

Trending show cards originally linked to `/home/:cardId`, which renders `CardDetails`. That page is movie-focused and fetches TMDB `/movie` endpoints.

Fix:

Trending show cards now link to:

```jsx
to={`/shows/${trendingNow.id}`}
```

That route renders `ShowDetail`, which uses TMDB `/tv` endpoints.

### Card heart click bug

Problem:

The heart icons were inside `Link` cards. Clicking the heart triggered the parent link and navigated to the detail page.

Fix:

`LibraryHeartButton` calls:

```js
event.preventDefault();
event.stopPropagation();
```

This lets the heart save/remove items without activating the card link.

## 28. Current Main Data Flow

### Home flow

```txt
App.jsx
  fetches trending movies, popular movies, featured movie, trending shows, and genres
  provides context values
Home.jsx
  renders FeaturedMovie, TrendingMovies, PopularMovies, TrendingShows
User clicks a movie home card
  /home/:cardId
CardDetails.jsx
  finds movie in topFiveTrending or topFivePopular
  fetches runtime and credits
  renders detail UI
User clicks a trending show
  /shows/:showId
ShowDetail.jsx
  fetches TV show by id and credits
```

### Movies page flow

```txt
App.jsx
  stores page, selectedGenre, searchQuery, allMovies
Movies.jsx
  displays search, genre buttons, cards
User clicks genre
  selectedGenre changes
  page resets to 1
App.jsx effect runs
  fetches discover endpoint with with_genres
User searches
  searchQuery changes
App.jsx effect runs
  fetches search endpoint
User clicks see more
  page increments
App.jsx effect runs
  appends next page and dedupes by id
User clicks movie
  /movies/:movieId
MoviesDetail.jsx
  fetches movie by id and credits
```

### Shows page flow

```txt
App.jsx
  stores page, selectedGenre, searchQuery, shows
Shows.jsx
  displays search, genre buttons, show cards
User clicks genre
  selectedGenre changes
  page resets to 1
App.jsx effect runs
  fetches TV discover endpoint with with_genres
User searches
  searchQuery changes
App.jsx effect runs
  fetches TV search endpoint
User clicks see more
  page increments
App.jsx effect runs
  appends next page and dedupes by id
User clicks show
  /shows/:showId
ShowDetail.jsx
  fetches show by id and credits
```

### Library flow

```txt
User clicks a heart icon or detail-page library button
libraryStorage.js
  saves/removes item in localStorage
Library.jsx
  reads saved items from localStorage
  renders saved movie/show cards
User clicks remove
  item is removed from localStorage and state updates
```

## 29. Why The App Is Structured This Way

The app currently uses a mixed state strategy:

- Context for home page sections and global theme.
- Props for the Movies and Shows pages because `App.jsx` owns the search/filter/pagination state.
- Route params for detail pages.
- Direct API fetch by id for movie and TV detail pages.
- Local storage helpers for saved library items.

This is a reasonable learning-stage architecture because it shows several important React patterns:

- Context for shared data.
- Props for parent-to-child control.
- Hooks for side effects.
- URL params for dynamic pages.
- Conditional rendering for loading states.
- Responsive Tailwind design.

## 30. Future Improvements

These are not required, but they would make the app cleaner later:

- Move Movies and Shows page fetch logic into custom hooks like `useDiscoverMovies` and `useDiscoverShows`.
- Move repeated card UI into a reusable `MovieCard` component.
- Move repeated detail UI into a reusable `MovieDetailLayout`.
- Fetch `MoviesDetail` runtime from the first movie-by-id response instead of a second fetch.
- Add loading state for Movies and Shows page filtering/searching.
- Disable "see more" while a fetch is in progress.
- Debounce search input or search only when clicking search.
- Replace remaining `class` attributes with `className` where needed.
- Add error UI for failed API requests.

## 31. Summary

This app has grown from simple static cards into a routed React application with live TMDB data, search, genre filters, pagination, responsive detail pages, context providers, theme switching, a saved Library, and reusable API/storage patterns.

The main idea is:

- `App.jsx` owns the important global state and routes.
- Home page sections consume context.
- Movies and Shows pages receive browsing state through props.
- Detail pages use route ids.
- Library persistence uses local storage.
- Tailwind handles the visual design and responsive behavior.

The result is a movie and TV browsing app that can show home highlights, browse discover results, filter by genre, search by text, load more results, save items to a Library, and open full detail pages.
