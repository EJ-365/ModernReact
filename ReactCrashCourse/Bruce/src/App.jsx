import Calltoaction from "./components/cta";
import Profile from "./components/profile";
import Images from "./components/images";
import Footer from "./components/footer";
import Creator from "./components/creator";

function App() {
  return (
    <div className="overflow-x-hidden max-w-full">
      <Calltoaction />
      <Profile />
      <Images />
      <Creator/>
      <Footer/>
    </div>
  );
}

export default App;
