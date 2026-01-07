export default function Header() {
    return (
      <header className="text-white bg-purple-700 pb-4">
        <nav className="flex items-center justify-start">
          <div className="mx-3 ">
            <i className="bx bx-laugh mx-auto items-center text-4xl align-middle pt-2"></i>
            <span className="text-2xl font-semibold align-middle"> Meme Generator</span>{" "}
          </div>
        </nav>
      </header>
    );
}