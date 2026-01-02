import { useState } from "react";
import { LogoIcon, SearchIcon, HamburgerIcon } from "./Icons";
export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="bg-zinc-950 text-white py-4">
      <nav className="flex items-center justify-evenly">
        {/* Logo */}
        <div className="flex items-center">
          <LogoIcon className="md:w-20  w-15 h-15" />
          <span className="font-semibold md:text-2xl mx-1 text-lg"> KeyTech</span>
        </div>

        {/* nav links */}
        <ul
          className={`${
            isOpen
              ? "flex flex-col absolute top-20 left-0 w-full bg-zinc-950 p-6 space-y-4"
              : "hidden"
          } md:flex md:flex-row md:static md:w-auto md:p-0 md:space-y-0 md:space-x-8 items-center justify-center mx-4 cursor-pointer text-zinc-400`}
        >
          <li>
            <a className="active:text-white text-white hover:text-white">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              Courses
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-white">
              About
            </a>
          </li>

          <li>
            <a href="#" className="hover:text-white">
              Blog
            </a>
          </li>

          <li>
            <a href="#" className="hover:text-white">
              Community
            </a>
          </li>

          <li>
            <a href="#" className="hover:text-white">
              FAQ
            </a>
          </li>
        </ul>

        {/* Get started */}
        <div className="flex items-center cursor-pointer mx-4">
          <SearchIcon width="50" height="30" />
          <a
            href="#"
            className="bg-[#dd6713] px-4 py-2 font-semibold rounded-full mx-3"
          >
            Get Started
          </a>
          <button
            className="mx-4 md:hidden cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <HamburgerIcon height="35" width="35" />{" "}
          </button>
        </div>
      </nav>
    </header>
  );
}
