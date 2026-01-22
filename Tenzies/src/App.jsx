import { useState } from "react";
import { nanoid } from "nanoid";
import Confetti from 'react-confetti';
import Die from "./Die";
function App() {
  const [dice, setDice] = useState(generateAllNewDice());

  // determine if button has been selected
  const gameWon = (dice.every(die => die.isHeld) &&
    dice.every(die => die.value === dice[0].value));



  // generate all dies function 
  function generateAllNewDice() {
    return new Array(10)
      .fill(0)
      .map(() => ({
        value: Math.ceil(Math.random() * 6),
        isHeld: false,
        id: nanoid()
      }));
  }

  // function to handle roll Dice button 
  function handleRollDice() {
    setDice(prevDice => prevDice.map(die => die.isHeld ?
      die : { ...die, value: Math.ceil(Math.random() * 6) }
    ))
  }

  // handle hold: when clicked/selected
  function hold(id) {
    setDice(prevDice =>
      prevDice.map(die =>
        die.id === id ? { ...die, isHeld: !die.isHeld } : die
      )
    )
  }

  // handle reset function
  function handleReset() {
    setDice(prevDice => prevDice.map(die => die.isHeld ? { ...die, isHeld: !die.isHeld, value: Math.ceil(Math.random() * 6) } : die));
  }

  // UI Start here
  return (
    <main className="min-h-screen w-full bg-[#0B2434] p-4 md:p-10 flex items-center justify-center box-border">
      {gameWon && <Confetti />}   

      <div className="bg-[#F5F5F5] rounded-xl shadow-2xl p-6 md:p-14 max-w-2xl w-full flex flex-col items-center border-4 md:border-8 border-white/10">

        {/* Tenzies info */}
        <div className="text-center max-w-md">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2B283A]">Tenzies</h1>
          <p className="text-base md:text-lg font-medium text-[#4A4E74] leading-relaxed">
            Roll until all dice are the same. Click each die to freeze it at its current value between rolls.
          </p>
        </div>

        {/* Dice Grid - 5 columns even on mobile for better layout */}
        <div className="grid grid-cols-5 gap-3 md:gap-5 mt-8 md:mt-10">
          {dice.map((dieObj) => (
            <Die
              key={dieObj.id}
              dieNum={dieObj.value}
              isHeld={dieObj.isHeld}
              hold={() => hold(dieObj.id)}
              gameWon={gameWon}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-10 w-full flex justify-center">
          {gameWon ? (
            <button
              className="w-full md:w-auto px-12 py-3 bg-[#5035FF] text-white text-xl font-bold rounded-lg shadow-lg hover:bg-[#4028CC] cursor-pointer transition-transform active:scale-95"
              onClick={handleReset}
            >
              New Game
            </button>
          ) : (
            <button
              className="w-full md:w-auto px-12 py-3 bg-[#5035FF] text-white text-xl font-bold rounded-lg shadow-lg hover:bg-[#4028CC] cursor-pointer transition-transform active:scale-95"
              onClick={handleRollDice}
            >
              Roll
            </button>
          )}
        </div>

      </div>
    </main>
  )

}




/*********DO NOT ENTER*********🚫⛔⛔⛔********DO NOT ENTER*************/
export default App;