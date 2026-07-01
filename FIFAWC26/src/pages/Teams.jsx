import useFetch from "../Hooks/useFetch";
import { countryCodes } from "../data/countryCodes";
import { PacmanLoader } from "react-spinners";
import { getArrayData, hasInvalidArrayData } from "../utils/apiPayload";
function Teams() {
  const { data, loading, error } = useFetch("/api/teams.json");
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center w-auto flex-col">
        <PacmanLoader
          color="#800080"
          size={14}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="text-purple-200 my-4 font-sm text-sm italic text-center">
          Loading...
        </p>
      </div>
    );
  }
  if (error) return <p>Error: {error}</p>;
  const teams = getArrayData(data);

  if (hasInvalidArrayData(data)) {
    return <p>Team list is unavailable.</p>;
  }

  return (
    <main className=" mx-auto container mt-20 md:px-0 px-4">
      {/* CTA  */}
      <div className=" bg-[#0d0d0e] text-white md:p-10 p-8  rounded-4xl">
        <h1 className="capitalize font-bold text-3xl text-white/70">
          <i className="bx bx-globe-alt-3 text-3xl items-center align-middle mr-2 text-purple-500/60" />
          Participating Teams
        </h1>
        <p className="text-zinc-500 text-[17px] font-medium my-3">
          Explore the 48 nations competing for glory
        </p>
        <span className="text-purple-400 border px-3 rounded-md border-purple-700/40  bg-[#170f20] w-[160px] py-0.5 mt-4 text-sm text-center">
          Showing all teams
        </span>
      </div>

      {/* All teams */}
      <section className="mt-4">
        <div className="grid xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 text-center gap-8 px-10">
          {teams.map((team) => {
            return (
              <div key={team.code} className="border border-purple-800/20 flex items-center justify-center flex-col md:w-auto w-full h-auto mx-auto md:mx-0 bg-[#0d0d0e] rounded-3xl  cursor-pointer hover:bg-[#1c1c22] hover:border-purple-600/40 hover:transition-all hover:duration-200  hover:scale-101 mt-5 p-10">
                <div className=" text-center">
                  <img
                    className="w-30 rounded-lg border border-white/10 object-cover aspect-3/2 bg-[#232325] md:w-24 md:rounded-xl"
                    src={`https://flagcdn.com/w160/${countryCodes[team.code] ?? "un"}.png`}
                    alt={team.name}
                  />
                </div>
                <p className="text-white/60 font-medium my-3 text-[17px]">{team.name}</p>
                <p className="text-purple-400 border px-3 rounded-md border-purple-700/40  bg-[#170f20] w-[90px] py-0.5 text-sm text-center">
                  {" "}
                  Group {team.group}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Teams;
