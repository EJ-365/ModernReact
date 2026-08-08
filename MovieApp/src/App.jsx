import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeContext } from "./Contexts/ThemeContext";
import { FeaturedMovieContext } from "./Contexts/featuredMovieContext";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import { TrendingMoviesContext } from "./Contexts/TrendingMoviesContext";
import { PopularMoviesContext } from "./Contexts/PopularMoviesContext";
import { TrendingShowsContext } from "./Contexts/trendingShowsContext";
// import popularMovies from "./data/popularMovies";
import { API_KEY, BASE_URL } from "./api/tmdb";
import { useMovies } from "./hooks/useMovies"; // custom hook for the movie api
import Movies from "./Pages/Movies";
import Shows from "./Pages/Shows";
import Library from "./Pages/Library";
import ErrorPage from "./Pages/ErrorPage";
import CardDetails from "./Pages/CardDetails";
import MoviesDetail from "./Components/MoviesDetail";
import ShowDetail from "./Components/ShowDetail";

function App() {
  const [genres, setGenres] = useState([]); // for movies page
  const [selectedGenre, setSelectedGenre] = useState(""); // holds the genre id
  const [movieGenres, setMovieGenres] = useState([]); // movie page genre
  const [searchQuery, setSearchQuery] = useState("");
  const [allMovies, setAllMovies] = useState({
    movies: [],
    totalPages: 0,
  });

  const [shows, setAllShows] = useState({
    shows: [],
    showsTotalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return (
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // trending movies api calls and endpoints
  const trendingUrl = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
  const trendingMovies = useMovies(trendingUrl);
  const topFiveTrending = trendingMovies.slice(0, 5);

  // useMemo for trending movies
  const trendingMoviesValue = useMemo(() => {
    return { topFiveTrending };
  }, [topFiveTrending]);

  // popular movies endpoints and api calls
  const popularUrl = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
  const popularMovies = useMovies(popularUrl);
  const topFivePopular = popularMovies.slice(0, 5);

  // useMemo for popular movies
  const popularMoviesValue = useMemo(() => {
    return { topFivePopular };
  }, [topFivePopular]);

  // featured movies endpoint for featured movies/now playing genres
  useEffect(() => {
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        setMovieGenres(Array.isArray(data.genres) ? data.genres : []);
      })
      .catch((err) => console.log("Error finding movie genre", err));
  }, []);

  // featured movies endpoints
  const featuredUrl = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`;
  const featuredMovies = useMovies(featuredUrl);

  const featuredMovie = featuredMovies[0];
  // feature movie useMemo
  const featuredMovieValue = useMemo(() => {
    return { featuredMovie, topFiveTrending, topFivePopular, movieGenres };
  }, [featuredMovie, topFiveTrending, topFivePopular, movieGenres]);


  // trendingShows endpoints and api calls
  const trendingShowUrl = `${BASE_URL}/trending/tv/day?api_key=${API_KEY}`;
  const trendingShows = useMovies(trendingShowUrl);
  const topFiveShows = trendingShows.slice(0, 5);

  // useMemo for popular movies
  const trendingShowsValue = useMemo(() => {
    return { topFiveShows };
  }, [topFiveShows]);

  /* ---------- Movies page------ */
  // useEffect for movies
  useEffect(() => {
    const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : "";
    const url =
      searchQuery === ""
        ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}${genreParam}`
        : `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchQuery}&page=${page}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (page === 1) {
          setAllMovies({
            movies: data.results ?? [],
            totalPages: data.total_pages > 500 ? 500 : data.total_pages,
          });
        } else {
          setAllMovies((prev) => {
            const combinedMovies = [...prev.movies, ...(data.results ?? [])];
            return {
              movies: [
                ...new Map(
                  combinedMovies.map((movie) => [movie.id, movie]),
                ).values(),
              ],
              totalPages: prev.totalPages,
            };
          });
        }
      })
      .catch((err) => console.log("Error fetching movies:", err));
  }, [page, selectedGenre, searchQuery]);

  // see more page incrementation
  function pageIncrement() {
    setPage((prev) => prev + 1);
  }

  /*------------------TV Shows useEffect and endpoint -----------------*/
  useEffect(() => {
    const genreParam = selectedGenre ? `&with_genres=${selectedGenre}` : "";
    const url =
      searchQuery === ""
        ? `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}${genreParam}`
        : `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${searchQuery}&page=${page}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (page === 1) {
          setAllShows({
            shows: data.results ?? [],
            showsTotalPages: data.total_pages > 500 ? 500 : data.total_pages,
          });
        } else {
          setAllShows((prev) => {
            const combinedShows = [...prev.shows, ...(data.results ?? [])];
            return {
              shows: [
                ...new Map(
                  combinedShows.map((show) => [show.id, show]),
                ).values(),
              ],
              showsTotalPages: prev.showsTotalPages,
            };
          });
        }
      })
      .catch((err) => console.log("Error fetching shows:", err));
  }, [page, selectedGenre, searchQuery]);

  return (
    <>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <div className="flex flex-col md:flex-row min-h-screen dark:bg-linear-to-r from-[#0b0a13] via-[#08070f] to-[#08070f]">
          <Navbar />
          <main className="flex-1 overflow-auto min-w-0">
            <TrendingMoviesContext.Provider value={trendingMoviesValue}>
              <PopularMoviesContext.Provider value={popularMoviesValue}>
                <FeaturedMovieContext.Provider value={featuredMovieValue}>
                  <TrendingShowsContext.Provider value={trendingShowsValue}>
                    <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/home/:cardId" element={<CardDetails />} />
                    <Route path="/movies/:movieId" element={<MoviesDetail />} />
                    <Route path="/shows/:showId" element={<ShowDetail />} />
                    <Route
                      path="/movies"
                      element={
                        <Movies
                          setPage={setPage}
                          pageIncrement={pageIncrement}
                          page={page}
                          allMovies={allMovies}
                          setAllMovies={setAllMovies}
                          genres={genres}
                          setGenres={setGenres}
                          selectedGenre={selectedGenre}
                          setSelectedGenre={setSelectedGenre}
                          setSearchQuery={setSearchQuery}
                        />
                      }
                    />
                    <Route
                      path="/shows"
                      element={
                        <Shows
                          shows={shows}
                          setAllShows={setAllShows}
                          setPage={setPage}
                          page={page}
                          pageIncrement={pageIncrement}
                          genres={genres}
                          setGenres={setGenres}
                          selectedGenre={selectedGenre}
                          setSelectedGenre={setSelectedGenre}
                          setSearchQuery={setSearchQuery}
                        />
                      }
                    />
                    <Route path="/library" element={<Library />} />
                    <Route path="*" element={<ErrorPage />} />
                    </Routes>
                  </TrendingShowsContext.Provider>
                </FeaturedMovieContext.Provider>
              </PopularMoviesContext.Provider>
            </TrendingMoviesContext.Provider>
          </main>
        </div>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
