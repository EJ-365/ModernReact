import { Link, NavLink } from "react-router-dom";
export default function Navbar() {
  return (
    <header className="bg-[#7f13ec] text-slate-200 w-full min-w-0 shrink-">
      <nav className="flex items-center lg:justify-between px-3 py-4 justify-center lg:flex-row flex-col lg:my-0 w-full max-w-full min-w-0">
        {/* Logo Area */}
        <div className="shrink">
          <i className="bg-purple-800 p-2 rounded-full mr-3 text-2xl align-middle ded p bx bx-football" />
          <span className="font-bold text-2xl align-middle">
            <NavLink to="/">Team Hub</NavLink>
          </span>{" "}
        </div>

{/* links */}
        <ul className="text-white capitalize lg:my-0 my-4 flex flex-wrap justify-center gap-x-6 gap-y-2 items-center">
          <li>
            <NavLink to="/home" className={({isActive}) => isActive ? "md:text-lg font-semibold hover:text-slate-300 text-amber-300" : "md:text-lg font-semibold hover:text-slate-300"}>Home</NavLink>
          </li>

          <li >
          <NavLink to="/players" className={({isActive}) => isActive ? "lg:text-lg font-semibold hover:text-slate-300 text-amber-300" : "lg:text-lg font-semibold hover:text-slate-300"}>players</NavLink>
          </li>

          <li >
          <NavLink to="/about" className={({isActive}) => isActive ? "lg:text-lg font-semibold hover:text-slate-300 text-amber-300" : "lg:text-lg font-semibold hover:text-slate-300"}>about</NavLink>
          </li>

          <button className="lg:text-lg font-semibold hover:text-slate-300 p-2 border border-zinc-500/40 rounded-xl bg-purple-300/20 capitalize px-6 hover:bg-slate-80 cursor-pointer shrink">
            <NavLink to="/sign-in">sign in</NavLink>
          </button>
        </ul>
      </nav>
    </header>
  );
}
