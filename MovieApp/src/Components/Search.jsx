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
    <section className="flex items-center justify-center">
      <input
        value={localQuery}
        onKeyDown={handleKeyDown}
        onChange={(e) => setLocalQuery(e.target.value)}
        className="relative w-3/4 mx-5 p-1 rounded-sm border-zinc-500/ ring-2 dark:outline-none active:ring-2 bg-gray-400/20 ring-violet-800/20 dark:ring-zinc-300/20"
        placeholder=" Search movies..."
      />
      <i
        onClick={handleSearch}
        className="bx bx-search-big text-2xl bg-violet-700 p-2 rounded-sm text-zinc-200 cursor-pointer"
      />

      <i
        onClick={() => {
          setSearchQuery("");
          setLocalQuery("");
     
          setPage(1);
        }}
        className="bx bx-x text-sm bg-zinc-400/30 p-1 rounded-full text-zinc-200 cursor-pointer md:absolute md:right-60"
      />
    </section>
  );
}
export default Search;
