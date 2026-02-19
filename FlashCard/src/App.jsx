import { useState } from "react";
import SAMPLE_FLASHCARDS from "./SampleData";
import Header from "./Header";
import StatsCard from "./StatsCard";
import CardList from "./CardList";
import Footer from "./Footer";
function App() {
  // state for toggling night mode
  const [toggle, setToggle] = useState(false);

  // flashcard category selection
  const [select, setSelect] = useState("Computers");

  // value amount state
  const [amount, setAmount] = useState(10);

  // quizFlashcard state
  const [flashcard, setFlashCard] = useState(SAMPLE_FLASHCARDS.results);

  // quiz stats
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  function checkAnswer(isCorrect) {
    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) setScore((prev) => prev + 1);
  }

  // handle generate
  async function handleGenerate(e) {
    e.preventDefault();
    const categoryId = categoryMap[select];
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}`,
      );
      const data = await response.json();
      setFlashCard(data.results);
      setScore(0);
      setAnsweredCount(0);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  const categoryMap = {
    "General Knowledge": 9,
    "Science & Nature": 17,
    Computers: 18,
    Math: 19,
    Gadgets: 30,
    Mythology: 20,
    Music: 12,
    Film: 11,
    TV: 14,
    Art: 25,
    Politics: 24,
    Celebrities: 26,
    Vehicles: 28,
    Sports: 21,
    Geography: 22,
    History: 23,
    Animals: 27,
  };

  return (
    <div className={` bg-[#f5f7f8] ${toggle && "bg-slate-900"}`}>
      <Header
        handleGenerate={handleGenerate}
        toggle={toggle}
        setToggle={setToggle}
        select={select}
        setSelect={setSelect}
        amount={amount}
        setAmount={setAmount}
      />
      <StatsCard toggle={toggle} data={flashcard} score={score} answeredCount={answeredCount} />
      <CardList data={flashcard} toggle={toggle} checkAnswer={checkAnswer} />
      <Footer toggle={toggle} />
    </div>
  );
}

export default App;
