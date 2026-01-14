import { useEffect, useState } from "react";

const Body = () => {
  const [quotes, setQuotes] = useState({
    id: 1,
    quote: "Live is short live it well",
    author: "Ejay Gabriel",
  });

  const[allQuotes, setAllQuotes] = useState([]);


  function handleQuote() {
    setQuotes((prevData) => ({
      ...prevData,
      id: allQuotes.id,
      quote: allQuotes.quote,
      author: allQuotes.author,
    }));
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
    <main className="flex items-center justify-center flex-col h-screen w-full bg-orange-50">
      <div className="h-1/2 w-120 shadow-xl drop-shadow-[0_-4px_6px_rgba(0,0,0,0.1)]  align-middle  text-center p-10 flex items-center justify-center flex-col rounded-3xl  ">
        <div className="text-center">
          <p className="text-md text-orange-500 font-semibold">
            Quote #{quotes.id}
          </p>
        </div>

        <div>
          <blockquote className="">
            <h1 className="text-3xl font-black text-orange-800 my-7 -tracking-normal leading-snug text-wrap">
              "{quotes.quote}"
            </h1>
            <h3 className="font-bold text-xl text-center text-black">
              Author:
            </h3>
            <cite className="font-semibold italic text-md text-black">
              —{quotes.author}
            </cite>
          </blockquote>
        </div>
        <div className="mb-0">
          <button className="text-xl my-8 px-4 py-2 rounded-2xl text-white cursor-pointer shadow-md hover:bg-orange-600 bg-orange-500 font-semibold">
            <i
              className="bx bx-refresh-cw mr-2 align-middle"
              onClick={handleQuote}
            ></i>
            Generate Quote
          </button>
        </div>
      </div>
    </main>
  );
};

export default Body;
