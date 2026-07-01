import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Standings from "./pages/Standing";
import Venues from "./pages/Venues";
import Footer from "./component/Footer";
import Error from "./pages/Error";

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#08080a]">
      <Navbar />

      <main key={location.pathname} className="animate-fade-in-up pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
export default App;
