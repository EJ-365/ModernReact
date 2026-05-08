import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeContext } from "./Contexts/ThemeContext";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";

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
  return (
    <>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Navbar />
          <main className="flex-1 overflow-auto min-w-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </main>
        </div>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
