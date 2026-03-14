import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Players from "./pages/Players";
import ErrorCode from "./pages/ErrorCode";
import Footer from "./components/Footer";
import Profile from "./pages/PlayerProfile";
function App() {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith("/profile");

  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="bg-gray-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-full w-full min-w-0 flex flex-col flex-1">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((v) => !v)}
      />
      <div
        className={`flex-1 w-full bg-gray-100 dark:bg-slate-950 ${isProfilePage ? "px-0" : "px-6 md:px-12 lg:px-20"}`}
      >
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} />} />
          <Route path="/home" element={<Home darkMode={darkMode} />} />
          <Route path="/players" element={<Players darkMode={darkMode} />} />
          <Route
            path="/profile/:id"
            element={<Profile darkMode={darkMode} />}
          />
          <Route path="/about" element={<About darkMode={darkMode} />} />
         
          <Route path="*" element={<ErrorCode darkMode={darkMode} />} />
        </Routes>
      </div>
      <Footer/>
    </div>
  );
}
export default App;
