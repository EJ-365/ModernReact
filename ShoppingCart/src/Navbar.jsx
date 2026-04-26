export default function Navbar() {
  return (
    <nav className="shadow-sm py-4 flex items-center justify-between">
      <div className="mx-4   px-10">
        <span className="font-black uppercase">Boutique</span>
      </div>

      <ul className="uppercase flex space-x-6 text-sm">
        <li>
          <a
            href="#"
            className=" transition-all duration-300 font-normal underline hover:underline decoration-2"
          >
            Shop
          </a>
        </li>
        <li>
          <a
            href="#"
            className="  transition-all duration-300 font-normal text-gray-500 hover:text-black hover:underline decoration-2"
          >
            collections
          </a>
        </li>
        <li>
          <a
            href="#"
            className="  transition-all duration-300 font-normal text-gray-500 hover:text-black hover:underline decoration-2"
          >
            new arrivals
          </a>
        </li>
        <li>
          <a
            href="#"
            className="  transition-all duration-300 font-normal text-gray-500 hover:text-black hover:underline decoration-2"
          >
            about
          </a>
        </li>
      </ul>

      <div className="space-x-4 px-10 text-xl cursor-pointer">
        <i className="bxf bx-shopping-bag-alt text-black"/>
        <i className="bxf bx-user text-black"/>
      </div>
    </nav>
  );
}
