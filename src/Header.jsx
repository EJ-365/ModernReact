import Logo from "./assets/logo sigFullRev.png";
export default function Header() {
  return (
    <header className="bg-[#c20d0f] w-full">
      <nav className="flex items-center md:justify-start justify-center py-6 px-26 w-auto h-28">
        {/* LU Logo */}
        <div className="">
          <img src={Logo} className="w-100 text-slate-200" />
        </div>
      </nav>
    </header>
  );
}
