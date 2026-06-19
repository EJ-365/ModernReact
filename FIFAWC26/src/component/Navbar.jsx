import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header>
      <nav>
        {/* logo section */}
        <div>
          <h2 className="text-2xl">FifaWorldCup26</h2>
        </div>

        {/* links section */}
        <ul>
          <li>
            <Link to="/home"><i className="bx bx-home align-middle" /> Home </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
