import { Link, Outlet } from "react-router-dom";
import { playersData } from "../playersData";
import { useEffect, useState } from "react";
export default function Players() {
  const [search, setSearch] = useState(""); // for the search input
  const [filteredPlayers, setFilteredplayers] = useState(playersData); // for the filter player
  const [position, setPosition] = useState("all");
  function getSearch(event) {
    setSearch(event.target.value);
  }

  // use effect for the search functionality
  useEffect(() => {
    const query = search.trim().toLowerCase();
    const results = playersData.filter((p) =>
      p.name.toLowerCase().includes(query),
    );
    setFilteredplayers(results);
  }, [search]);

  // for position select
  const finalPlayers = filteredPlayers.filter((p) => {
    if(position === "all") return true;
    return p.position.toLowerCase() === position;
  })

  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row items-center justify-evenly gap-4">
        <div>
          <h1 className="capitalize text-4xl sm:text-5xl font-bold mb-3">
            our players
          </h1>
          <p className="text-slate-700 dark:text-slate-300">
            Meet the squad and explore their stats.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={getSearch}
            type="text"
            className="border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 rounded-md"
            placeholder="Search by name"
          />
          <select
            value={position} onChange={(e) => setPosition(e.target.value)}
            className="px-12 py-1 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md text-left sm:mx-3"
          >
             <option value="all">All</option>
            <option value="forward">Forward</option>
            <option value="midfielder">Midfielder</option>
            <option value="goalkeeper">GoalKeeper</option>
            <option value="defender">Defender</option>
          </select>
        </form>
      </div>

      <div className="mt-10"></div>
      {finalPlayers.length === 0 && search.trim() !== "" ? (
        <p className="text-center text-violet-700 text-2xl italic">
          No players found
        </p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(2,240px)] xl:grid-cols-[repeat(4,240px)] justify-center justify-items-center md:justify-items-stretch gap-x-6 gap-y-6 my-10 bg-gray-100 dark:bg-slate-950">
        {finalPlayers.map((players) => (
          <Link
            className="p-4 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow text-center border border-violet-100 dark:border-white/10 rounded-xl w-full max-w-[240px] md:max-w-none md:w-60 cursor-pointer"
            key={players.id}
            to={`/profile/${players.id}`}
          >
            <div className="relative inline-block mb-4">
              <span className="absolute z-40 -top-2 -left-2 bg-violet-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm shadow-lg border-2 border-white">
                {players.number}{" "}
              </span>
              <img
                src={
                  players.photo ||
                  "https://via.placeholder.com/192x192?text=No+Photo"
                }
                alt={players.name}
                className="w-48 h-48 object-cover rounded-2xl"
              />
            </div>
            <h4 className="font-bold text-lg mb-2">{players.name}</h4>
            <p className="text-violet-800 dark:text-violet-200 font-semibold px-3 py-1 rounded-2xl bg-violet-100 dark:bg-violet-900/25 w-fit mx-auto text-center uppercase tracking-wider text-sm">
              {players.position}
            </p>
          </Link>
        ))}{" "}
      </div>
    </section>
  );
}
