import { useEffect, useState } from "react";

export default function Body({ toggle }) {

  const [advice, setAdvice] = useState({
    id: 9,
    text: "Do what makes you happy.",
  });

  async function fetchAdvice({ signal } = {}) {
    try {
      const response = await fetch("https://api.adviceslip.com/advice", { signal });
      const data = await response.json();
      const slip = data?.slip;
      if (!slip || slip.advice == null) return;
      setAdvice({ id: slip.id, text: slip.advice });
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.log("Error fetching data:", error);
    }
  }

  // Mount-only fetch. Do not depend on advice/setters that change after the
  // response — that previously retriggered this effect in an infinite loop.
  useEffect(() => {
    const controller = new AbortController();
    fetchAdvice({ signal: controller.signal });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  return (
    <main className={` ${toggle ? "bg-slate-950 text-white" : "bg-linear-to-b from-purple-100 to-purple-100 text-black"}`}>

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
            <div className={`w-1 h-1 rounded-full bg-linear-to-r from-purple-400 to-purple-200 shadow-xs inset-shadow-2xs ${toggle && "from-purple-700 to-pink-400"}`}></div>
            <div className={`w-1 h-1 rounded-full bg-linear-to-t from-purple-200 to-purple-300 shadow-xs inset-shadow-2xs mx-1.5 ${toggle && "from-purple-700 to-pink-400"}`}></div>
          </div>

          {/* button div's */}
          <div className="flex items-center justify-center">
            <button
              className="bg-purple-700 text-white px-3 py-2 rounded-full text-center mr-4 w-1/2 text-md font-semibold align-middle cursor-pointer hover:bg-purple-800 shadow-xl shadow-purple-200 capitalize"
              onClick={() => fetchAdvice()}
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
    </main>
  )
}
