import { useState } from "react";

export default function Body() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl:
      "https://images.unsplash.com/photo-1579600161224-cac5a2971069?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  // handle change function
  function handleChange(event) {
    const { value, name } = event.currentTarget;
    setMeme((prevMeme) => ({ ...prevMeme, [name]: value }));
    // console.log(value);
  }
  return (
    <main className="my-20">
      <form>
        <div className="flex items-center justify-center-safe  mx-20">
          {/* Top Text */}
          <div>
            <label for="top" className="text-lg font-semibold">
              Top Text{" "}
            </label>
            <input
              type="text"
              className="px-2 py-1 w-full border mt-2 "
              id="top"
              placeholder="One does not simply"
              name="topText"
              onChange={handleChange}
              value={meme.topText}
            />
          </div>

          {/* Bottom Text */}

          <div className="mx-20">
            <label for="top" className="text-lg font-semibold">
              Bottom Text{" "}
            </label>
            <input
              type="text"
              className="px-2 py-1 w-full border mt-2"
              id="top"
              placeholder="Walk into Mordor"
              name="bottomText"
              onChange={handleChange}
              value={meme.bottomText}
            />
          </div>
        </div>

        {/* Button Text */}
        <div className="text-center my-10 mr-24">
          <button className="font-semibold bg-purple-700 px-2 py-2 text-white cursor-pointer rounded-md max-w-full w-3xl">
            Get a new meme image
          </button>
        </div>

        {/*Image div */}
        <div className="text-center flex items-center justify-center-safe">
          <img src={meme.imageUrl} className="w-2xl" />
          <span className="hidden">{meme.topText}</span>
          <span className="hidden">{meme.bottomText}</span>
        </div>
      </form>
    </main>
  );
}
