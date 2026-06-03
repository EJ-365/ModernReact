import { useContext } from "react";
import { ThemeContext } from "../Context/themeContext";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  return (
    <header>
      <nav className="bg-white flex md:flex-row flex-col items-center justify-evenly pb-4 pt-3 shadow-sm dark:bg-black dark:text-white ">
        {/* Logo div */}
        <div className="flex items-left md:justify-start">
          <Link
            to="/"
            className="font-space uppercase font-extrabold text-[16px] px-3 py-3"
          >
            Ejay Gabriel
          </Link>
        </div>

        {/* Nav-link div */}
        <ul className="flex space-x-5 items-center md:my-0 my-4 ">
          <NavLink
            to="/Home"
            className={({ isActive }) =>
              `text-[16px] capitalize ${
                isActive ? "text-[#8B5CF6]" : "text-gray-700 dark:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                Home
                <div
                  className={
                    isActive
                      ? "w-11 my-0.5 text-center mr-2 bg-red-500 border"
                      : ""
                  }
                />
              </>
            )}
          </NavLink>

          <NavLink
            to="/About"
            className={({ isActive }) =>
              `text-[16px] capitalize ${isActive ? "text-[#8B5CF6] dark:text-[#d2c1fa] " : "text-gray-700 dark:text-white"}`
            }
          >
            {({ isActive }) => (
              <>
                About
                <div
                  className={
                    isActive
                      ? "w-11 my-0.5  text-center mr-2 bg-red-500 border"
                      : ""
                  }
                />{" "}
              </>
            )}
          </NavLink>
          <NavLink
            to="/Project"
            className={({ isActive }) =>
              `text-[16px] capitalize ${isActive ? "text-[#8B5CF6] dark:text-[#d2c1fa] " : "text-gray-700 dark:text-white"}`
            }
          >
            {({ isActive }) => (
              <>
                projects
                <div
                  className={
                    isActive
                      ? "w-15 my-0.5  text-center mr-2 bg-red-500 border"
                      : ""
                  }
                />{" "}
              </>
            )}
          </NavLink>
          <NavLink
            to="/Contact"
            className={({ isActive }) =>
              `text-[16px] capitalize ${isActive ? "text-[#8B5CF6] dark:text-[#d2c1fa] " : "text-gray-700 dark:text-white"}`
            }
          >
            {({ isActive }) => (
              <>
                contact
                <div
                  className={
                    isActive
                      ? "w-15 my-0.5  text-center mr-2 bg-red-500 border"
                      : ""
                  }
                />{" "}
              </>
            )}
          </NavLink>
        </ul>

        <div className="flex items-center space-x-8">
          <button className="capitalize py-2.5 text-sm px-8 bg-[#8B5CF6] text-[#FFFFFF] hover:bg-[#7C3AED] cursor-pointer">
            Hire me
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`text-xl dark:text-white cursor-pointer ${darkMode ? "bxf bx-sun" : "bxf bx-moon"}`}
          />
        </div>
      </nav>
    </header>
  );
}
export default Navbar;

// up next: refactor the underline
