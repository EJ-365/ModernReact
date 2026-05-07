import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../Contexts/ThemeContext";
export default function Navbar() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <header
      className={`dark:bg-[#2c2c4e]  text-white p-4 w-60 max-h-screen border-r-2 border-black/10`}
    >
      <nav className="flex items-left justify-start flex-col">
        <div className="mb-14">
          <span className={`text-center text-[20px] font-bold dark:text-white text-black`}>
            {" "}
            <i className="bx bx-film text-[#8b5cf6] align-middle bottom-1.0 -top-0.5 relative text-2xl" />{" "}
            <NavLink to="/"> CineVault</NavLink>
          </span>

          <i
            onClick={() => setDarkMode((prev) => !prev)}
            className={`${darkMode ? "bxf bx-moon" : "bxf bx-sun text-black"} text-2xl ml-10 cursor-pointer`}
          />
        </div>

        <ul className="flex space-y-4 flex-col justify-evenly ">
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

        <div className="mt-140 flex space-x-3 justify-start">
          <i className="bx bx-user text-zinc-400 p-3 rounded-full outline-0 outline-zinc-600 bg-gray-700/210 text-xl border border-zinc-700/60 " />
          <div className="flex-col flex">
            <p className="font-semibold text-sm dark:text-white text-black/80"> Guest User</p>
            <small className="text-sm text-gray-400 capitalize">
              free plan
            </small>
          </div>
        </div>
      </nav>
    </header>
  );
}
