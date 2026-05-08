import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../Contexts/ThemeContext";
export default function Navbar() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-50 dark:bg-[#2c2c4e] bg-white border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg dark:hover:bg-white/10 hover:bg-black/5"
            >
              <i
                className={`${mobileOpen ? "bx-x" : "bx-menu"} text-2xl dark:text-white text-black`}
              />
            </button>

            <span className="text-[20px] font-bold dark:text-white text-black">
              <i className="bx bx-film text-[#8b5cf6] align-middle bottom-1.0 -top-0.5 relative text-2xl" />{" "}
              <NavLink to="/" onClick={() => setMobileOpen(false)}>
                CineVault
              </NavLink>
            </span>
          </div>

          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setDarkMode((prev) => !prev)}
            className="p-2 rounded-lg dark:hover:bg-white/10 hover:bg-black/5"
          >
            <i
              className={`${darkMode ? "bxf bx-moon" : "bxf bx-sun"} text-2xl dark:text-white text-black`}
            />
          </button>
        </div>
      </header>

      {/* Sidebar (desktop always visible, mobile drawer) */}
      <header
        className={`dark:bg-[#2c2c4e] text-white p-4 border-r-2 border-black/10 dark:border-white/10
          w-60 h-screen max-h-screen hidden md:block`}
      >
        <nav className="flex items-left justify-start flex-col h-full">
          <div className="mb-14">
            <span className="text-center text-[20px] font-bold dark:text-white text-black">
              <i className="bx bx-film text-[#8b5cf6] align-middle bottom-1.0 -top-0.5 relative text-2xl" />{" "}
              <NavLink to="/"> CineVault</NavLink>
            </span>

            <i
              onClick={() => setDarkMode((prev) => !prev)}
              className={`${darkMode ? "bxf bx-moon" : "bxf bx-sun text-black"} text-2xl ml-10 cursor-pointer`}
            />
          </div>

          <ul className="flex space-y-4 flex-col justify-evenly">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive
                  ? " text-white  bg-[#8b5cf6] px-4 py-2 rounded-xl w-full hover:scale-101 "
                  : "text-zinc-400 dark:hover:bg-gray-950/40 hover:bg-gray-200/40 rounded-xl py-2 px-3"
              }
            >
              <li className="capitalize text-[18px] font-semibold transition-all duration-200 ">
                <i className="bx bx-home-alt text-xl mr-3 align-middle  bottom-1.0 -top-0.5 relative" />
                Home
              </li>
            </NavLink>

            <NavLink
              to="/movies"
              className={({ isActive }) =>
                isActive
                  ? ` text-white  bg-[#8b5cf6] px-4 py-2 rounded-xl w-full hover:scale-101 `
                  : `text-zinc-400 dark:hover:bg-gray-950/40 hover:bg-gray-200/40 rounded-xl py-2 px-3`
              }
            >
              <li className="capitalize text-[18px] font-semibold transition-all duration-200 ">
                <i className="bx bx-movie text-xl mr-3 align-middle  bottom-1.0 -top-0.5 relative" />
                movies
              </li>
            </NavLink>
            <NavLink
              to="/shows"
              className={({ isActive }) =>
                isActive
                  ? " text-white  bg-[#8b5cf6] px-4 py-2 rounded-xl w-full hover:scale-101 "
                  : "text-zinc-400 dark:hover:bg-gray-950/40 hover:bg-gray-200/40 rounded-xl py-2 px-3"
              }
            >
              <li className="capitalize text-[18px] font-semibold transition-all duration-200 ">
                <i className="bx bx-tv text-xl mr-3 align-middle  bottom-1.0 -top-0.5 relative" />
                TV Shows
              </li>
            </NavLink>
            <NavLink
              to="/library"
              className={({ isActive }) =>
                isActive
                  ? " text-white  bg-[#8b5cf6] px-4 py-2 rounded-xl w-full hover:scale-101 "
                  : "text-zinc-400 dark:hover:bg-gray-950/40 hover:bg-gray-200/40 rounded-xl py-2 px-3"
              }
            >
              <li className="capitalize text-[18px] font-semibold transition-all duration-200 ">
                <i className="bx bx-heart text-xl mr-3 align-middle  bottom-1.0 -top-0.5 relative" />
                my library
              </li>
            </NavLink>
          </ul>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />

        <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] dark:bg-[#2c2c4e] bg-white border-r border-black/10 dark:border-white/10 p-4 overflow-auto">
          <nav className="flex flex-col">
            <div className="mb-10 flex items-center justify-between">
              <span className="text-[20px] font-bold dark:text-white text-black">
                <i className="bx bx-film text-[#8b5cf6] align-middle bottom-1.0 -top-0.5 relative text-2xl" />{" "}
                <NavLink to="/" onClick={() => setMobileOpen(false)}>
                  CineVault
                </NavLink>
              </span>

              <button
                type="button"
                aria-label="Toggle theme"
                className="p-2 rounded-lg dark:hover:bg-white/10 hover:bg-black/5"
              >
                <i
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className={`${darkMode ? "bxf bx-x bg-zinc-700 p-1 rounded-full" : "bxf bx-x"}  dark:text-white bg-zinc-700 text-white  p-1 rounded-full text-sm`}
                />
              </button>
            </div>

            <ul className="flex space-y-3 flex-col">
              <NavLink
                to="/home"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? " text-white bg-[#8b5cf6] px-4 py-2 rounded-xl w-full"
                    : "text-zinc-500 dark:text-zinc-300 dark:hover:bg-white/10 hover:bg-black/5 rounded-xl py-2 px-3"
                }
              >
                <li className="capitalize text-[18px] font-semibold transition-all duration-200">
                  <i className="bx bx-home-alt text-xl mr-3 align-middle bottom-1.0 -top-0.5 relative" />
                  Home
                </li>
              </NavLink>

              <NavLink
                to="/movies"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? " text-white bg-[#8b5cf6] px-4 py-2 rounded-xl w-full"
                    : "text-zinc-500 dark:text-zinc-300 dark:hover:bg-white/10 hover:bg-black/5 rounded-xl py-2 px-3"
                }
              >
                <li className="capitalize text-[18px] font-semibold transition-all duration-200">
                  <i className="bx bx-movie text-xl mr-3 align-middle bottom-1.0 -top-0.5 relative" />
                  movies
                </li>
              </NavLink>

              <NavLink
                to="/shows"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? " text-white bg-[#8b5cf6] px-4 py-2 rounded-xl w-full"
                    : "text-zinc-500 dark:text-zinc-300 dark:hover:bg-white/10 hover:bg-black/5 rounded-xl py-2 px-3"
                }
              >
                <li className="capitalize text-[18px] font-semibold transition-all duration-200">
                  <i className="bx bx-tv text-xl mr-3 align-middle bottom-1.0 -top-0.5 relative" />
                  TV Shows
                </li>
              </NavLink>

              <NavLink
                to="/library"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? " text-white bg-[#8b5cf6] px-4 py-2 rounded-xl w-full"
                    : "text-zinc-500 dark:text-zinc-300 dark:hover:bg-white/10 hover:bg-black/5 rounded-xl py-2 px-3"
                }
              >
                <li className="capitalize text-[18px] font-semibold transition-all duration-200">
                  <i className="bx bx-heart text-xl mr-3 align-middle bottom-1.0 -top-0.5 relative" />
                  my library
                </li>
              </NavLink>
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
