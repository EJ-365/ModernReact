import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Players from "./pages/Players";
import SignIn from "./pages/SignIn";
import ErrorCode from "./pages/ErrorCode";
import Footer from "./components/Footer";
import Profile from "./pages/PlayerProfile";
function App() {
  const location = useLocation();
  const showFooter = location.pathname === "/" || location.pathname === "/home";
  const isProfilePage = location.pathname.startsWith("/profile");

  return (
    <div className="bg-gray-100 min-h-full w-full min-w-0 flex flex-col flex-1">
      <Navbar />
      <div
        className={`flex-1 w-full ${
          isProfilePage ? "px-0" : "px-6 md:px-12 lg:px-20 bg-gray-100"
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/players" element={<Players />}/>
          <Route path="/profile/:id" element={<Profile/>}/>
          <Route path="/about" element={<About />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="*" element={<ErrorCode />} />
        </Routes>
      </div>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
export default App;
