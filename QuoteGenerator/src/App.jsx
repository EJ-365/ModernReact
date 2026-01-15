import Header from "./Header";
import Body from "./Body";
import Footer from "./Footer";
import { useState } from "react";
function App() {
  const [toggle, setToggle] = useState(false);
  return (
    <>
      <Header toggle={toggle} setToggle={setToggle} />
      <Body toggle={toggle} />
      <Footer />
    </>
  )
}

export default App; 