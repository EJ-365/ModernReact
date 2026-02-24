import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <header className="bg-[#7f13ec] text-slate-200">
      <nav className="flex items-center md:justify-between px-3 py-4 justify-center md:flex-row flex-col md:my-0">
        {/* Logo Area */}
        <div>
          <i className="bg-purple-800 p-2 rounded-full mr-3 text-2xl align-middle ded p bx bx-football" />
          <span className="font-bold text-2xl align-middle">
            <Link to="/">Team Hub</Link>
          </span>{" "}
        </div>

{/* links */}
        <ul className="text-white capitalize md:my-0 my-4 flex space-x-6 items-center">
          <li className="md:text-lg font-semibold hover:text-slate-300">
            <Link to="/home">Home</Link>
          </li>

          <li className="md:text-lg font-semibold hover:text-slate-300">
            <Link to="/players">players</Link>
          </li>

          <li className="md:text-lg font-semibold hover:text-slate-300">
            <Link to="/about">about</Link>
          </li>
          <button className="md:text-lg font-semibold hover:text-slate-300 p-2 border border-zinc-500/40 rounded-xl bg-purple-300/20 capitalize px-6 hover:bg-slate-80 cursor-pointer">
            <Link to="/sign-in">sign in</Link>
          </button>
        </ul>
      </nav>
    </header>
  );
}
