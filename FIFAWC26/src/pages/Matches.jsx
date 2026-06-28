import useFetch from "../Hooks/useFetch";
import { PacmanLoader } from "react-spinners";

import { countryCodes } from "../data/countryCodes";
function Matches() {
  const { data, loading, error } = useFetch("/api/matches.json");
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center w-auto flex-col">
        <PacmanLoader
          color="#800080"
          size={14}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="text-purple-200 my-4 font-sm text-sm italic text-center">Loading...</p>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;
  const matches = data.data ?? error;
  return (
    <main className="mx-auto w-full max-w-full overflow-x-hidden px-4 text-white md:px-20">
      <div className="flex flex-col items-left justify-start my-10">
        <h1 className="text-2xl font-bold my-2 md:text-4xl">Match Schedule</h1>
        <p className="text-zinc-400 text-[16.5px] font-medium">
          All 104 matches of the 2026 tournament
        </p>
        <p className="text-purple-400 border px-3 rounded-md border-purple-700/40  bg-[#170f20] w-[160px] py-0.5 mt-4 text-sm text-center">
          showing all matches
        </p>
      </div>

      {/*showing all matches */}
      <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
        {matches.map((match) => (
          <div
            key={match.num}
            className="flex w-full flex-col gap-5 rounded-2xl border border-purple-800/30 bg-[#161618] p-5 cursor-pointer hover:bg-[#1c1c22] hover:border-purple-600/40 hover:transition-all hover:duration-200 md:gap-6 md:p-6"
          >
            <div className="min-w-0 w-full">
              <p className="truncate text-sm font-medium text-purple-400/90 md:text-base">
                <i className="bx bx-calendar align-middle -top-0.5 relative" />{" "}
                {new Date(match.date).toLocaleString("en-US", {
                  day: "numeric",
                  year: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-sm text-zinc-400 md:text-[16.5px]">
                <i className="bx bx-clock-4 align-middle -top-0.5 relative" />{" "}
                {match.time_utc}
              </p>
              <p className="text-sm text-zinc-400 truncate md:text-[16.5px] md:text-nowrap">
                <i className="bx bx-location align-middle -top-0.5 relative" />{" "}
                {match.venue_name}
              </p>
              <p className="text-purple-400 border px-3 pb-1 rounded-full text-center border-purple-700/40 bg-[#170f20] w-20 py-0.5 mt-4 text-[11px] font-medium">
                {match.status ?? "TBD"}
              </p>
            </div>

            <div className="flex w-full min-w-0 items-center justify-between gap-3 md:gap-6">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <img
                  className="w-[72px] rounded-lg border border-white/10 object-cover aspect-3/2 bg-[#232325] md:w-24 md:rounded-xl"
                  src={`https://flagcdn.com/w80/${countryCodes[match.home] ?? "un"}.png`}
                  alt={match.home_name}
                />
                <p className="mt-2 w-full text-center text-sm font-medium leading-snug md:text-base">
                  {match.home_name}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center px-1 md:px-3">
                <p className="mb-1 rounded-md bg-[#232326] px-2 py-1 text-xs font-medium text-zinc-400 md:text-sm">
                  VS
                </p>
                <p className="text-lg font-bold text-purple-400 md:text-xl">
                  {match.score_home}:{match.score_away}
                </p>
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center">
                <img
                  className="w-[72px] rounded-lg border border-white/10 object-cover aspect-3/2 bg-[#232325] md:w-24 md:rounded-xl"
                  src={`https://flagcdn.com/w80/${countryCodes[match.away] ?? "un"}.png`}
                  alt={match.away_name}
                />
                <p className="mt-2 w-full text-center text-sm font-medium leading-snug md:text-base">
                  {match.away_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Matches;
