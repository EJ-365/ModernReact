import { Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/matches" element={<Matches/>} />
      </Routes>
    </>
  );
}
export default App;
