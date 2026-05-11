import { useEffect, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeContext } from "./Contexts/ThemeContext";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import trendingMovies from "./data/trendingMovies"; // actual movies data
import { TrendingMoviesContext } from "./Contexts/TrendingMoviesContext";
import { PopularMoviesContext } from "./Contexts/PopularMoviesContext";
import popularMovies from "./data/popularMovies";

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

  // useMemo for popular movies 
  const trendingMoviesValue = useMemo(() => {
   return {trendingMovies};
  }, [trendingMovies]
)

const popularMoviesValue = useMemo(() => {
  return {popularMovies}
}, [popularMovies])
  return (
    <>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <div className="flex flex-col md:flex-row min-h-screen dark:bg-linear-to-r from-[#0b0a13] via-[#08070f] to-[#08070f]">
          <Navbar />
          <main className="flex-1 overflow-auto min-w-0">
           <TrendingMoviesContext.Provider value={trendingMoviesValue}>
            <PopularMoviesContext value={popularMoviesValue}>
           <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
            </Routes>
            </PopularMoviesContext>
           </TrendingMoviesContext.Provider>
          </main>
        </div>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
