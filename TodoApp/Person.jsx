import { useState } from "react";
export default function Person() {
  const [quote, setQuote] = useState({
    name: "John Doe",
    initials: null,
    favQuote: false,
  });

  const initial = quote.name
    .split(" ")
    .map((word) => word[0])
    .join(" ")
    .toUpperCase();

  function handleQuote() {
    setQuote((prevQuote) => ({ ...prevQuote, favQuote: !prevQuote.favQuote }));
  }
  return (
    <main className="h-screen w-full flex items-center justify-center">
      <div className="bg-purple-900 w-90 px-8 py-6 rounded-2xl shadow-2xl">
        <div className="flex  items-center justify-start w-auto my-8">
          <h1 className="px-4 py-3  mx-4 font-semibold text-purple-700 bg-purple-200  text-center rounded-full text-xl">
            {" "}
            {initial}{" "}
          </h1>
          <h1 className="font-black text-2xl text-white"> {quote.name} </h1>
        </div>

        <div className="mt-4">
          <h2 className="font-bold mb-6 mt-5 text-white text-xl"> About </h2>
          <p className="leading-relaxed text-lg text-white">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
            commodo ligula eget dolor. Aenean massa. Cum sociis natoque
            penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem.
            Nulla consequat massa quis enim. Donec pede justo, fringilla vel,
            aliquet nec, vulputate eget, arcu.
          </p>
        </div>

        <div className={`${quote.favQuote ? "block" : "hidden"} my-4`}>
          <h3 className="text-white font-semibold text-xl"> Fav Quote </h3>
          <p className="text-purple-200 font-mono font-medium">
            {" "}
            "Bless the lord oh my soul"{" "}
          </p>
        </div>

        <div className="mt-8 flex items-center md:justify-start justify-center">
          <button
            className="w-full md:w-auto rounded-2xl hover:opacity-75 transition-all duration-300 ease-in-out cursor-pointer px-5 py-3 md:rounded-md outline-none bg-purple-500 font-bold  text-white text-sm"
            onClick={handleQuote}
          >
            {" "}
            Fav Quote{" "}
          </button>
        </div>
      </div>
    </main>
  );
}
