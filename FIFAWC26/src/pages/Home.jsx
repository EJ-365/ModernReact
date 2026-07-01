import { useNavigate } from "react-router-dom";
import UpcomingMatches from "../component/UpcomingMatches";
import fwc26logo from "../assets/fwc26logo.svg";
function Home() {
  const navigate = useNavigate();

  const redirectMatchesPage = () => {
    return (
      navigate("/matches")
    )
  };

  const redirectToTeams = () => {
    return (
      navigate("/teams")
    )
  };
  return (
    <section className="text-white">
      <div className="w-full text-center my-15 flex flex-col items-center justify-start bg-[#7323b8]  py-30  ">
        <div className="mb-10">
          <p className="capitalize bg-[#743fa3] px-8 py-1 rounded-3xl text-[15px] border border-purple-100/40">
            {" "}
            <i className="bxf bx-radio-circle text-green-500 align-middle relative top-0" />{" "}
            The biggest tournament
          </p>
        </div>

        <div>
          <h1 className="uppercase font-black md:text-[56px] text-4xl">
            fifa world cup 2026 <sup>TM</sup>
          </h1>
        </div>
        <div className="my-10">
            <img src={fwc26logo} className="w-60" alt="FIFA World Cup 2026 logo" />
        </div>

        <div className="my-9 md:w-130 w-90">
         <p className="md:text-[19px] text-lg text-wrap"> Experience the expanded <span className="underline bg-yellow-600 font-medium px-2">48-team</span> tournament across the United States,
         Canada, and Mexico. <span className="underline bg-yellow-600 font-medium px-2">104 matches</span>, <span className="underline bg-yellow-600 font-medium px-2">16 cities,</span> 1 champion.</p>
        </div>
        <div className="my-8 space-x-6 space-y-3 flex md:flex-row flex-col items-center justify-center">
          <button onClick={redirectMatchesPage} className="capitalize bg-white text-purple-600 font-medium p-3 rounded-xl px-10 hover:text-purple-800 hover:shadow-xl transition-all duration-300 cursor-pointer">view schedule <i className="bx bx-arrow-right-stroke align-middle text-2xl" /></button>

          <button onClick={redirectToTeams} className="capitalize bg-[#6e23ae] border border-purple-200/60 text-white font-medium p-3 rounded-xl px-10 hover:shadow-sm transition-all duration-300 hover:bg-[#6e23ae] cursor-pointer">explore teams <i className="bx bx-arrow-right-stroke align-middle text-2xl" /></button>
        </div>
      </div>

      {/* host cities, matches and teams grid */}
      <div className="flex md:flex-row flex-col items-center justify-evenly p-20 space-x-4 md:my-0 space-y-4">
        <div className="bg-[#151518] border border-purple-100/10 flex items-center space-x-3 w-full p-7 rounded-2xl">
          <div className="px-4 py-3 border border-purple-800/10 bg-[#3b304b]/60 rounded-lg">
          <i className="bx bx-group text-3xl text-purple-400/90" />
          </div>

          <div>
            <p className="capitalize text-zinc-400">teams</p>
            <h3 className="font-bold text-2xl">48</h3>
            <small className="text-zinc-400">Expanded format</small>
          </div>
        </div>

        <div className="bg-[#151518] border border-purple-100/10 flex items-center space-x-3 w-full p-7 rounded-2xl">
          <div className="px-4 py-3 border border-purple-800/10 bg-[#3b304b]/60 rounded-lg">
          <i className="bx bx-calendar-alt text-3xl text-purple-400/90" />
          </div>

          <div>
            <p className="capitalize text-zinc-400">matches</p>
            <h3 className="font-bold text-2xl">104</h3>
            <small className="text-zinc-400">Across 39 days</small>
          </div>
        </div>

        <div className="bg-[#151518] border border-purple-100/10 flex items-center space-x-3 w-full p-7 rounded-2xl">
          <div className="px-4 py-3 border border-purple-800/10 bg-[#3b304b]/60 rounded-lg">
          <i className="bx bx-location text-3xl text-purple-400/90" />
          </div>

          <div>
            <p className="capitalize text-zinc-400">host cities</p>
            <h3 className="font-bold text-2xl">16</h3>
            <small className="text-zinc-400">USA, CAN, MEX</small>
          </div>
        </div>
      </div>

      <UpcomingMatches/>
    </section>
  );
}

export default Home;
