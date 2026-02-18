import { useState } from "react";
import SAMPLE_FLASHCARDS from "./SampleData";
import Header from "./Header";
import StatsCard from "./StatsCard";
import CardList from "./CardList";
function App() {
  // state for toggling night mode
  const [toggle, setToggle] = useState(false);
  
  // flashcard category selection
  const [select, setSelect] = useState("math");

  // value amount state
  const[amount, setAmount] = useState();
  return (
    <>
      <Header toggle={toggle} setToggle={setToggle} select={select} setSelect={setSelect} amount={amount} setAmount={setAmount}/>
      <StatsCard/>
      <CardList data={SAMPLE_FLASHCARDS}/>
    </>
  );
}

export default App;
