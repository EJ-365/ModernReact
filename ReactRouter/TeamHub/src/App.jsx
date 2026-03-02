import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Players from "./pages/Players";
import SignIn from "./pages/SignIn";
import ErrorCode from "./pages/ErrorCode";
import Footer from "./components/Footer";
import Profile from "./pages/PlayerProfile";
function App() {
  return (
    <div className="bg-[#f7f6f8] min-h-full w-full min-w-0 flex flex-col flex-1">
      <Navbar />
      <div className="flex-1 w-full max-w-full px-6 md:px-12 lg:px-20">
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
      <Footer />
    </div>
  );
}
export default App;
