import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeContext } from "./Contexts/ThemeContext";
import { FeaturedMovieContext } from "./Contexts/featuredMovieContext";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import movies from "./data/movies";
import shows from "./data/shows";
import { TrendingMoviesContext } from "./Contexts/TrendingMoviesContext";
import { PopularMoviesContext } from "./Contexts/PopularMoviesContext";
// import popularMovies from "./data/popularMovies";
import { API_KEY, BASE_URL } from "./api/tmdb";
import { useMovies } from "./hooks/useMovies"; // custom hook for the movie api
import Movies from "./Pages/Movies";
import Shows from "./Pages/shows";
import Library from "./Pages/Library";
import ErrorPage from "./Pages/ErrorPage";
import CardDetails from "./Pages/CardDetails";

function App() {
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

  // featured movies endpoints
  const featuredUrl = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}`;
  const featuredMovies = useMovies(featuredUrl);

  const featuredMovie = featuredMovies[0];
  // feature movie useMemo
  const featuredMovieValue = useMemo(() => {
    return { featuredMovie, topFiveTrending };
  }, [featuredMovie, topFiveTrending]);

  return (
    <>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <div className="flex flex-col md:flex-row min-h-screen dark:bg-linear-to-r from-[#0b0a13] via-[#08070f] to-[#08070f]">
          <Navbar />
          <main className="flex-1 overflow-auto min-w-0">
            <TrendingMoviesContext.Provider value={trendingMoviesValue}>
              <PopularMoviesContext.Provider value={popularMoviesValue}>
                <FeaturedMovieContext.Provider value={featuredMovieValue}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/home/:cardId" element={<CardDetails />} />
                    <Route
                      path="/movies"
                      element={<Movies movies={movies} />}
                    />
                    <Route path="/shows" element={<Shows shows={shows} />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="*" element={<ErrorPage />} />
                  </Routes>
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
