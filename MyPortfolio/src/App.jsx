import { Route, Routes } from "react-router-dom";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Home from "./Pages/Home";
import Project from "./Pages/Project";
import { useEffect, useState } from "react";
import Navbar from "./Component/Navbar";
import { ThemeContext } from "./Context/themeContext";
function App() {

  // useState and useEffect for darkMode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  return (
    <>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <Navbar />
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Home />} path="/home" />
          <Route element={<About />} path="/about" />
          <Route element={<Project />} path="/project" />
          <Route element={<Project />} path="/projects" />
          <Route element={<Contact />} path="/contact" />
        </Routes>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
