import Header from "./Header";
import Body from "./Body";
import { useState } from "react";
import { Footer } from "./Footer";
export default function App() {
  const [toggle, setToggle] = useState(false);
  return (
    <>
      <Header toggle={toggle} setToggle={setToggle} />
      <Body toggle={toggle} />
      <Footer toggle={toggle} />
    </>
  );
}
