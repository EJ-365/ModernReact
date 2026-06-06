import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import { useEffect, useState } from "react";
import Navbar from "./Component/Navbar";
import { ThemeContext } from "./Context/themeContext";
import Footer from "./Component/Footer";
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
          <Route element={<Home/>} path="/home"/>
        </Routes>
      </ThemeContext.Provider>
      <Footer/>
    </>
  );
}

export default App;
