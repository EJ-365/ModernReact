import { Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Standings from "./pages/Standing";
import Venues from "./pages/Venues";
import Footer from "./component/Footer";

function App() {
  return (
    <div className="bg-[#08080a]">
      <Navbar />

      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/matches" element={<Matches/>} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/standings" element={<Standings/>} />
        <Route path="/venues" element={<Venues/>} />

      </Routes>
      <Footer/>
    </div>
  );
}
export default App;
