import { Link, NavLink } from "react-router-dom";
import fwc26logo from "../assets/fwc26logo.svg";

export default function Navbar() {
  return (
    <header className="border-b border-white/5 shadow-lg py-3">
      <nav className="mx-auto flex flex-col items-center justify-center md:flex-row">
        {/* logo section */}
        <div className="mb-2 flex items-center mx-3 md:mb-0">
          <div className="w-full">
            <img src={fwc26logo} className="w-10" alt="FWC26 logo" />
          </div>
          <div className="ml-4 text-white">
            <Link to="/" className="text-2xl font-bold uppercase text-nowrap">
              fwc26
            </Link>
          </div>
        </div>

        {/* links section — stacked on mobile, original row on md+ */}
        <ul className="flex w-full flex-col items-center gap-1 px-4 text-center md:w-auto md:flex-row md:items-center md:justify-center md:gap-0 md:space-x-5 md:mx-10 md:px-0">
          <li className="w-full md:w-auto">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `block w-full md:w-auto hover:bg-[#15151a] capitalize transition-all duration-200 md:text-[17px] text-sm hover:text-purple-400/90 ${isActive ? "bg-[#852ed3] p-3 rounded-xl text-white font-medium py-2" : "p-3 text-zinc-400/80 font-medium py-2"}`
              }
            >
              <i className="bx bx-home-alt-2 align-middle text-[23px] relative -top-0.5 mx-0" />{" "}
              Home
            </NavLink>
          </li>

          <li className="w-full md:w-auto">
            <NavLink
              to="/matches"
              className={({ isActive }) =>
                `block w-full md:w-auto hover:bg-[#15151a] capitalize transition-all duration-200 md:text-[17px] text-sm hover:text-purple-400/90 ${isActive ? "bg-[#852ed3] p-3 rounded-xl text-white font-medium py-2" : "p-3 text-zinc-400/80 font-medium py-2"}`
              }
            >
              <i className="bx bx-calendar-alt align-middle text-[23px] relative -top-0.5 mx-0" />{" "}
              matches
            </NavLink>
          </li>

          <li className="w-full md:w-auto">
            <NavLink
              to="/teams"
              className={({ isActive }) =>
                `block w-full md:w-auto hover:bg-[#15151a] capitalize transition-all duration-200 md:text-[17px] text-sm hover:text-purple-400/90 ${isActive ? "bg-[#852ed3] p-3 rounded-xl text-white font-medium py-2" : "p-3 text-zinc-400/80 font-medium py-2"}`
              }
            >
              <i className="bx bx-shield align-middle text-[23px] relative -top-0.5 mx-0" />{" "}
              teams
            </NavLink>
          </li>

          <li className="w-full md:w-auto">
            <NavLink
              to="/standings"
              className={({ isActive }) =>
                `block w-full md:w-auto hover:bg-[#15151a] capitalize transition-all duration-200 md:text-[17px] text-sm hover:text-purple-400/90 ${isActive ? "bg-[#852ed3] p-3 rounded-xl text-white font-medium py-2" : "p-3 text-zinc-400/80 font-medium py-2"}`
              }
            >
              <i className="bx bx-trophy align-middle text-[23px] relative -top-0.5 mx-0" />{" "}
              standings
            </NavLink>
          </li>

          <li className="w-full md:w-auto">
            <NavLink
              to="/venues"
              className={({ isActive }) =>
                `block w-full md:w-auto hover:bg-[#15151a] capitalize transition-all duration-200 md:text-[17px] text-sm hover:text-purple-400/90 ${isActive ? "bg-[#852ed3] p-3 rounded-md text-white font-medium py-2" : "px-3 text-zinc-400/80 font-medium md:py-2"}`
              }
            >
              <i className="bx bx-calendar-alt align-middle text-[23px] relative -top-0.5 mx-0" />{" "}
              venues
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
