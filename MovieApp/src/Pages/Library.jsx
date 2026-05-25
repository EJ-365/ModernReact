import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLibraryItems, removeLibraryItem } from "../utils/libraryStorage";

export default function Library() {
  const navigate = useNavigate();
  const [libraryItems, setLibraryItems] = useState(() => getLibraryItems());

  function redirectToHome() {
    navigate("/movies");
  }

  function handleRemove(id, mediaType) {
    setLibraryItems(removeLibraryItem(id, mediaType));
  }

  return (
    <section>
      <div className="flex md:justify-start justify-center items-center md:mx-40 mx-4 my-10">
        <h2 className="dark:text-white md:text-3xl text-2xl md:font-[650] font-semibold text-nowrap">
          {" "}
          <i className="bxf bx-heart text-violet-500/50 dark:text-violet-500 align-middle mr-2 relative -top-1" />
          My Library
        </h2>
      </div>

      {libraryItems.length === 0 ? (
        <div className="flex items-center justify-center flex-col w-full max-w-2xl mx-auto md:my-30 my-20 px-4">
          <i className="bx bx-film dark:text-zinc-500 text-white/70 text-center align-middle px-7 dark:bg-[#262645] bg-zinc-400 rounded-full text-[3rem] py-7" />
          <div>
            <h3 className="dark:text-white text-2xl md:font-bold font-semibold text-center mt-8 mb-4">
              Your library is empty.
            </h3>
            <p className="text-zinc-400 md:text-lg mb-4 text-center">
              Save movies and TV shows to your library to keep track of what you
              want to watch next.
            </p>
            <div className="flex items-center justify-center my-10">
              <button
                onClick={redirectToHome}
                className="capitalize dark:bg-violet-500 bg-violet-400 text-white/90 px-7 py-3 rounded-xl font-medium dark:text-white md:text-[17px] cursor-pointer dark:hover:bg-violet-600 duration-300 transition-colors hover:bg-violet-300"
              >
                explore movies
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 md:px-20 pb-20 dark:text-white">
          {libraryItems.map((item) => (
            <div
              key={`${item.mediaType}-${item.id}`}
              className="group relative rounded-xl"
            >
              <Link to={`/${item.mediaType === "movie" ? "movies" : "shows"}/${item.id}`}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="aspect-2/3 w-full object-cover rounded-xl transition-all duration-200 group-hover:scale-104 border border-zinc-400/10"
                />
                <h3 className="font-semibold text-lg mt-3 group-hover:text-violet-500 transition-colors">
                  {item.title}
                </h3>
                <div className="flex justify-between my-1">
                  <span className="dark:text-zinc-400 text-zinc-600 font-medium text-sm">
                    {item.releaseDate || "No date"}
                  </span>
                  <span className="text-violet-500 text-sm">
                    <i className="bxf bx-star relative top-0.5 mx-1 text-sm" />
                    {item.voteAverage?.toFixed(2) ?? "N/A"}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(item.id, item.mediaType)}
                className="mt-3 w-full capitalize bg-[#252542] text-white px-4 py-2 rounded-xl font-medium hover:bg-violet-700 transition-colors cursor-pointer"
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
