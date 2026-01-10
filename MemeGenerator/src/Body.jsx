import { useState, useEffect } from "react";
export default function Body() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl: "https://i.imgflip.com/1bij.jpg",
  });
  const [allMemes, setAllMemes] = useState([]);

  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then((res) => res.json())
      .then((data) => setAllMemes(data.data.memes));
  }, []);

  function getMemeImage() {
    const randomNumber = Math.floor(Math.random() * allMemes.length);
    const newMemeUrl = allMemes[randomNumber].url;
    setMeme((prevMeme) => ({
      ...prevMeme,
      imageUrl: newMemeUrl,
    }));
  }


  return (
    <main className="my-20">
      <form>
        <div className="flex items-center justify-center-safe  mx-20">
          {/* Top Text */}
          <div>
            <label htmlFor="top" className="text-lg font-semibold">
              Top Text{" "}
            </label>
            <input
              type="text"
              className="px-2 py-1 w-full border mt-2 "
              id="top"
              placeholder="Enter top text here:"
              name="topText"
              onChange={(e) => setMeme(prevMeme => ({
                ...prevMeme, topText: e.target.value
              }))}
              value={meme.topText}
            />
          </div>

          {/* Bottom Text */}

          <div className="mx-20">
            <label htmlFor="bottom" className="text-lg font-semibold">
              Bottom Text{" "}
            </label>
            <input
              type="text"
              className="px-2 py-1 w-full border mt-2"
              id="bottom"
              placeholder="Enter bottom text here:"
              name="bottomText"
              onChange={(e) => setMeme(prevMeme => ({
                ...prevMeme, bottomText: e.target.value
              }))}
              value={meme.bottomText}
            />
          </div>
        </div>

        {/* Button Text */}
        <div className="text-center my-10 mr-24">
          <button
            onClick={getMemeImage}
            className="font-bold text-lg hover:bg-purple-800 bg-purple-700 px-2 py-2 text-white cursor-pointer rounded-md max-w-full w-3xl"
            type="button"
          >
            Get a new meme image
          </button>
        </div>

        {/*Image div */}
        <div className="relative flex justify-center max-w-2xl mx-auto">
          <img src={meme.imageUrl} className="w-full rounded-lg" alt="Meme" />
          <h2 className="absolute top-0 w-full text-center py-4 px-8 uppercase text-white font-black text-4xl tracking-tight [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">
            {meme.topText}
          </h2>

          <h2 className="absolute bottom-0 w-full text-center py-4 px-8 uppercase text-white font-black text-4xl tracking-tight [text-shadow:2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">
            {meme.bottomText}
          </h2>
        </div>
      </form>
    </main>
  );
}
