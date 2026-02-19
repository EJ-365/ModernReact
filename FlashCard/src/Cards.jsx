import { useState, useMemo } from "react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Cards({ item, toggle, checkAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const hasAnswered = selectedAnswer !== null;

  const options = useMemo(
    () => shuffle([...item.incorrect_answers, item.correct_answer]),
    [item.incorrect_answers, item.correct_answer]
  );

  function handleChoice(selected) {
    if (hasAnswered) return;
    setSelectedAnswer(selected);
    checkAnswer(selected === item.correct_answer);
  }

  function getCategoryStyles(category) {
    const colors = {
      "General Knowledge": "bg-amber-200 border-amber-400",
      "Science & Nature": "bg-teal-200 border-teal-400",
      "Science: Computers": "bg-teal-300 border-teal-500",
      Computers: "bg-teal-200 border-teal-400",
      Math: "bg-purple-200 border-purple-400",
      Gadgets: "bg-orange-200 border-orange-400",
      Mythology: "bg-indigo-200 border-indigo-400",
      Music: "bg-pink-200 border-pink-400",
      Film: "bg-rose-200 border-rose-400",
      "Entertainment: Film": "bg-rose-200 border-rose-400",
      TV: "bg-red-200 border-red-400",
      "Entertainment: Television": "bg-red-200 border-red-400",
      Art: "bg-fuchsia-200 border-fuchsia-400",
      Politics: "bg-slate-300 border-slate-500",
      Celebrities: "bg-yellow-200 border-yellow-400",
      Vehicles: "bg-sky-200 border-sky-400",
      Sports: "bg-emerald-200 border-emerald-400",
      Geography: "bg-blue-200 border-blue-400",
      History: "bg-amber-200 border-amber-400",
    };
    return colors[category] ?? "bg-gray-200 border-gray-300";
  }

  function getDifficultyStyles(difficulty) {
    const styles = {
      easy: "bg-green-300 text-green-900 border-green-400",
      medium: "bg-yellow-200 text-yellow-900 border-yellow-400",
      hard: "bg-red-200 text-red-900 border-red-400",
    };
    return styles[difficulty?.toLowerCase()] ?? "bg-gray-200 border-gray-300";
  }

  return (
    <div
      className={` ${toggle && "bg-white/80"} md:w-90 w-full min-h-[350px] flex flex-col shadow-md rounded-md p-10 mb-4 `}
    >
      <div className={`flex items-center justify-between my-4`}>
        <span className={`${getCategoryStyles(item.category)} py-1.5 border rounded-md px-5`}>
          {item.category}
        </span>
        <span className={` ${getDifficultyStyles(item.difficulty)} py-1.5 border-0 shadow-xs rounded-md px-4`}>
          {item.difficulty}
        </span>
      </div>

      <h2 className="text-lg font-semibold">{item.question}</h2>
      
      <ul>
        {options.map((option, index) => {
          const isCorrect = option === item.correct_answer;
          const isSelected = selectedAnswer === option;
          const showCorrect = hasAnswered && isCorrect;
          const showWrong = hasAnswered && isSelected && !isCorrect;

          return (
            <li
              key={index}
              className={`p-2 rounded shadow-sm my-3 border cursor-pointer transition-colors ${
                showCorrect ? "bg-green-400 text-white border-green-500" :
                showWrong ? "bg-red-400 text-white border-red-500" :
                hasAnswered ? "opacity-60 cursor-default border-gray-100" :
                "border-gray-100 hover:bg-gray-100"
              }`}
              onClick={() => handleChoice(option)}
            >
              {option}
            </li>
          );
        })}
      </ul>

      <div className="mt-auto text-center pt-4">
        <small className="align-bottom italic text-gray-400">
          {hasAnswered ? "Answered" : "Click an option to answer"}
        </small>
      </div>
    </div>
  );
}
