import { useEffect, useState } from "react";

const Body = ({ toggle }) => {
  const [quote, setQuote] = useState({
    id: 1,
    quote: "Live is short live it well",
    author: "Ejay Gabriel",
  });

  const [allQuotes, setAllQuotes] = useState([]);

  function handleQuote() {
    if (allQuotes.length === 0) return;
    const randomNum = Math.floor(Math.random() * allQuotes.length);
    const newQuotes = allQuotes[randomNum];
    setQuote(newQuotes);
  }

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await fetch("https://dummyjson.com/quotes");
        const data = await response.json();
        setAllQuotes(data.quotes);
      } catch (err) {
        console.log("Error fetching data", err);
      }
    };

    fetchQuotes();
  }, []);

  return (
    <main
      className={`flex-1 flex items-center justify-center min-h-screen w-full ${toggle ? "bg-slate-950" : "bg-linear-to-br from-purple-50 to-indigo-100"
        }`}
    >
      <div
        className={`bg-white p-12 rounded-[3rem] shadow-2xl shadow-purple-200 w-full max-w-xl ${toggle && "bg-slate-800 border border-slate-700"
          }`}
      >
        <div className="text-center mb-4">
          <p
            className={`text-md ${toggle ? "text-purple-600" : "text-purple-600"
              } font-semibold`}
          >
            Quote #{quote.id}
          </p>
        </div>

        <div>
          <blockquote>
            <h1
              className={`text-3xl  font-black mb-4 leading-tight  text-slate-800`}
            >
              "{quote.quote}"
            </h1>
            <cite
              className={`text-purple-600 italic text-right font-semibold block ${toggle && "text-purple-400"
                }`}
            >
              —{quote.author}
            </cite>
          </blockquote>
        </div>

        <div className="mt-10">
          <button
            className={`px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 cursor-pointer 
              bg-purple-700 hover:bg-purple-600
           
               text-white`}
            onClick={handleQuote}
          >
            Next Quote 🎲
          </button>
        </div>
      </div>
    </main>
  );
};

export default Body;
