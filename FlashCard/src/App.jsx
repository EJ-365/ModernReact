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
    <div className={` bg-[#f5f7f8] ${toggle && "bg-slate-900"}`}>
      <Header toggle={toggle} setToggle={setToggle} select={select} setSelect={setSelect} amount={amount} setAmount={setAmount}/>
      <StatsCard toggle={toggle}/>
      <CardList data={SAMPLE_FLASHCARDS} toggle={toggle}/>
    </div>
  );
}

export default App;
