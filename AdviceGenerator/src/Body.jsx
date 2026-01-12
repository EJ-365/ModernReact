import { useEffect, useState } from "react";

export default function Body({toggle}) {

  const [advice, setAdvice] = useState({
    id: 150,
    text: "Life is like a water, it flows around.",
  });

  async function fetchAdvice() {
    try {
      const response = await fetch("https://api.adviceslip.com/advice");
      const data = await response.json();
      setAdvice({
        id: data.slip.id,
        text: data.slip.advice,
      });
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  }

  useEffect(() => {
    // Fetch advice on component mount
    (async () => {
      await fetchAdvice();
    })();
  }, []); // Runs once on mount

  return (
    <body className={` ${toggle ? "bg-slate-950 text-white" : "bg-linear-to-b from-purple-100 to-purple-100 text-black"}`}>

      <div className="flex flex-col items-center justify-center h-screen w-full">
        <div className={`rounded-3xl p-10 ${toggle ? "bg-purple-300 text-white shadow-2xs" : "bg-white shadow-2xl"} inset-shadow-sm w-96 h-auto shadow-purple-300 ${toggle && "bg-black"}`}>
          
          <h3 className="text-center text-md text-purple-400 font-semibold">
            Advice #{advice.id}
          </h3>
          <h1 className={`text-2xl font-black text-center my-10 text-balance text-tight ${toggle && "text-black"}`}>
            {advice.text}
          </h1>

          {/* small dot in the middle */}
          <div className="items-center flex justify-center mb-6 ">
            <div className="w-1 h-1 rounded-full bg-linear-to-r from-purple-400 to-purple-200 shadow-xs inset-shadow-2xs"></div>
            <div className="w-1 h-1 rounded-full bg-linear-to-t from-purple-200 to-purple-300 shadow-xs inset-shadow-2xs mx-1.5"></div>
          </div>

          {/* button div's */}
          <div className="flex items-center justify-center">
            <button
              className="bg-purple-700 text-white px-3 py-2 rounded-full text-center mr-4 w-1/2 text-md font-semibold align-middle cursor-pointer hover:bg-purple-800 shadow-xl shadow-purple-200 capitalize"
              onClick={fetchAdvice}
            >
              {" "}
              <i className="bx bx-shuffle text-md mx-2 align-middle"></i>
              Get advice
            </button>
          </div>
        </div>
        <span className="text-center text-sm mt-8 mb-4 text-purple-400 font-semibold">Powered by Advice Slip Api</span>
        <div className="text-purple-400 font-semibold flex items-center justify-between cursor-pointer">
            <i className="bx bx-share text-sm mx-3"></i>
            <i className="bx bx-bookmark text-sm"></i>
            <i className="bx bx-copy text-sm mx-3"></i>
        </div>
      </div>
    </body>
  )
}