import { useState } from "react";

function Search({ setSearchQuery, setPage }) {
  const [localQuery, setLocalQuery] = useState("");
  function handleSearch() {
    setSearchQuery(localQuery);
  }

  // handle key event
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }
  return (
    <section className="flex items-center justify-center px-3">
      <div className="relative w-full md:w-3/4 mx-2 md:mx-5">
        <input
          value={localQuery}
          onKeyDown={handleKeyDown}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="w-full p-1 pr-9 rounded-sm border-zinc-500/ ring-2 dark:outline-none active:ring-2 bg-gray-400/20 ring-violet-800/20 dark:ring-zinc-300/20"
          placeholder=" Search movies..."
        />
        <i
          onClick={() => {
            setSearchQuery("");
            setLocalQuery("");

            setPage(1);
          }}
          className="bx bx-x absolute right-2 top-1/2 -translate-y-1/2 text-sm md:text-sm bg-zinc-400/30 p-1 rounded-full text-zinc-200 cursor-pointer"
        />
      </div>
      <i
        onClick={handleSearch}
        className="bx bx-search-big text-2xl bg-violet-700 md:p-2 p-1 rounded-sm text-zinc-200 cursor-pointer"
      />
    </section>
  );
}
export default Search;
