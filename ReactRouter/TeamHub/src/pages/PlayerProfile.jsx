import { Link, useNavigate, useParams } from "react-router-dom";
import { playersData } from "../playersData";

function Profile() {
  const navigate = useNavigate();

  const { id } = useParams();
  const players = playersData.find((p) => p.id === id);
  if (!players) return <h1>Couldn't find the player</h1>;

  // rediret back to players page

  function redirectToPLayersPage() {
    navigate("/players");
  }
  const randomID = Math.floor(Math.random() * 40001) + 10000;

  // converting date join into readable string format
  const dateJoined = players.dateJoined;
  const dateJoinedObj = new Date(dateJoined.replace(/-/g, "/")).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  // converting contract expires date into a readable string format
  const contractExpire = players.contractExpires;
  const contractExpireObj = new Date(
    contractExpire.replace(/-/g, "/"),
  ).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // players height in feet
  const playersHeight = players.height; // getting the height in string
  const playersHeightNumber = parseInt(playersHeight) / 30.48; // convert to a number
  const playersHeightInFeet = Math.floor(playersHeightNumber * 100) / 100;

  return (
    <div className="bg-gray-100 min-h-screen w-full pl-4 md:pl-6 lg:pl-8 pr-0">
      {" "}
      {/* player name and back to player button */}
      <div className="p-4  flex flex-wrap items-center justify-between">
        <div>
          {/* file path rerouting */}
          <div className="flex items-start justify-start font-semibold text-purple-800">
            <span className="">
              {" "}
              <i className="bxf bx-group items-center align-middle text-xl mx-2" />
              <Link to="/players">Team Roaster</Link>
            </span>
            <i className="mx-2" /> {">"}
            <span className="capitalize mx-3">player details</span>
          </div>
          <h1 className="md:text-4xl text-2xl md:font-extrabold font-bold capitalize lg:mb-0 mb-4 mx-3">
            Player Profile: {players.name}
          </h1>
        </div>

        <button
          className="md:text-[14px] text-sm md:font-semibold bg-orange-600 md:py-2.5 py-1.5 md:px-6 px-4 rounded-md text-white uppercase cursor-pointer hover:bg-orange-600/90 duration-300 transition-all ease-in-out w-full md:w-auto"
          onClick={redirectToPLayersPage}
        >
          <i className="bx bx-arrow-left items-center align-middle font-extralight md:text-2xl text-xl mr-1.5 " />
          Back to players
        </button>
      </div>
      {/* Players individual cards and perfomance history start here */}
      <section className="lg:flex overflow-y-auto transition-colors min-h-screen bg-gray-100 ">
        {/* left side */}
        <div className="lg:flex-1 lg:p-auto p-4 bg-gray-100 ">
          <div className="bg-linear-to-r from-[#530263] via-[#490986] to-[#3c066f] md:pl-10 pl-4 md:pr-0 pr-4 lg:h-120 md:h-180 md:pt-15 pt-10 rounded-2xl shadow-lg shadow-purple-400 w-full lg:w-7xl">
            <div className="flex items-center justify-center md:justify-start md:space-x-6 space-x-0 md:mx-10 mx-0 flex-col md:flex-row gap-4 md:gap-0">
              {/* for the image */}
              <div className="relative">
                <img
                  src={players.photo}
                  alt={players.name}
                  className="md:w-40 w-32 rounded-full border border-gray-300"
                />
                {/* player number */}
                <div className="w-10 h-auto p-1 border bg-white md:text-2xl font-extrabold text-violet-600 rounded-full text-center absolute right-0 -bottom-6 flex items-center justify-center md:my-0 my-0">
                  {players.number}
                </div>
              </div>

              <div className="flex justify-center flex-col items-center gap-3 md:flex-row md:items-start md:gap-0">
                {/* for the text heading */}
                <div className="flex md:items-start flex-col md:justify-start  items-center justify-center ">
                  <h1 className="capitalize text-3xl font-bold text-white text-center ml-0 md:ml-0">
                    {players.name}
                  </h1>
                  <p className="text-white/60 text-xl font-semibold tracking-tight ">
                    {" "}
                    <i className="bx bx-football items-center align-middle mx-2 my-2 text-2xl text-[#e66723] text-center md:text-start" />
                    {players.position}
                  </p>
                  {/* id, age, nationality div */}
                  <div className="flex flex-wrap items-center justify-center gap-2 p-3 md:flex-nowrap md:justify-between md:gap-0 md:space-x-4 ml-0 md:ml-0">
                    <p className="bg-white/15 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-zinc-200 font-semibold">
                      {" "}
                      <span className="text-gray-400 mr-1 text-[15px]">
                        ID:{" "}
                      </span>{" "}
                      {randomID}
                    </p>

                    <p className="bg-white/15 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-zinc-200 font-semibold">
                      {" "}
                      <span className="text-gray-400 mr-1 text-[15px]">
                        Age:{" "}
                      </span>{" "}
                      {players.age}
                    </p>

                    <p
                      className={`bg-white/15 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-zinc-200 font-semibold`}
                    >
                      <span className="text-gray-400 mr-1 text-[15px] ">
                        Nationality:{" "}
                      </span>{" "}
                      {players.nationality}{" "}
                      <i
                        className={`fi fi-${players.countryCode.toLocaleLowerCase()} `}
                      />
                    </p>
                  </div>
                </div>
                {/* active div */}
                <div className="lg:ml-60 ml-0 mt-0 md:mt-0 uppercase text-[#86efac]/75 relative text-center w-fit">
                  <p className="bg-[#25313d]/65 md:px-8 md:py-1 px-4 py-2 rounded-3xl  font-semibold tracking-widest border-[#86efac]/30 border mx-0 text-normal text-xs">
                    {" "}
                    <p className="md:w-2 md:h-2  w-1 h-1 rounded-full bg-linear-to-r from-[#498a82]/95 to-[#1b2927] absolute md:top-3 md:left-4 hidden md:block "></p>
                    {players.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* goals, assists, matches and rating div */}
            <div className="lg:flex text-white my-18 backdrop-blur-xl lg:mx-4 lg:space-x-5 gap-4 grid grid-cols-2 lg:flex-row lg:m-12 m-4">
              {/*Goals */}
              <div className="bg-white/5 border-white/10 md:px-10 md:py-8 px-3 py-4 rounded-2xl lg:w-60 w-full flex md:justify-start flex-col  justify-center text-center items-center">
                <p className="uppercase text-gray-400/70 font-semibold md:text-lg text-sm">
                  Goals
                </p>
                <p className="md:font-extrabold font-semibold md:text-4xl text-xl">
                  {players.goals}
                </p>
              </div>

              {/*Assists */}
              <div className="bg-white/5 border-white/10 md:px-10 md:py-8 px-3 py-4 rounded-2xl lg:w-60 w-full flex md:justify-start flex-col  justify-center text-center items-center">
                <p className="uppercase text-gray-400/70 md:text-lg text-sm  font-semibold">
                  assists
                </p>
                <p className="md:font-extrabold font-semibold md:text-4xl text-xl">
                  {players.assists}
                </p>
              </div>

              {/*Matches */}
              <div className="bg-white/5 border-white/10 md:px-10 md:py-8 px-3 py-4 rounded-2xl lg:w-60 w-full flex md:justify-start flex-col  justify-center text-center items-center">
                <p className="uppercase text-gray-400/70 md:text-lg text-sm font-semibold">
                  matches
                </p>
                <p className="md:font-extrabold font-semibold md:text-4xl text-xl">
                  {players.matches}
                </p>
              </div>

              {/*Rating */}
              <div className="bg-white/5 border-white/10 md:px-10 md:py-8 px-3 py-4 rounded-2xl lg:w-60 w-full flex md:justify-start flex-col  justify-center text-center items-center">
                <p className="uppercase text-gray-400/70 md:text-lg font-semibold text-sm">
                  ratings
                </p>
                <p className="md:font-extrabold font-semibold md:text-4xl text-xl  text-[#f57118]">
                  {players.rating}
                </p>
              </div>
            </div>
          </div>

          {/*contract and person detail */}
          <div className="my-12 bg-white shadow-sm p-6 md:p-8 rounded-xl w-full">
            <h2 className="font-bold capitalize text-2xl text-wrap md:text-start text-center">
              <i class="bxf bx-dots-vertical-rounded-circle align-middle mx-2 text-3xl text-violet-800 " />
              Contract & personal details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 ml-0 my-8">
              {/* grid div 1 */}
              <div className="flex justify-center flex-col w-full">
                <div className="flex justify-between items-center border-b border-gray-200">
                  <span className="text-gray-700 capitalize md:font-semibold my-3">
                    Date Join
                  </span>
                  <span className="font-semibold capitalize">
                    {dateJoinedObj}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200">
                  <span className="text-gray-700 capitalize md:font-semibold my-3">
                    preferred foot
                  </span>
                  <span className="capitalize font-semibold">
                    {players.preferredFoot}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200">
                  <span className="text-gray-700 capitalize md:font-semibold my-3">
                    weight
                  </span>
                  <span className="font-semibold lowercase">
                    {players.weight}/{" "}
                    {Math.floor(parseInt(players.weight) * 2.205)} lb
                  </span>
                </div>
              </div>

              {/* grid div 2 */}
              <div className="flex justify-center flex-col w-full">
                <div className="flex justify-between items-center border-b border-gray-200">
                  <span className="text-gray-700 capitalize md:font-semibold my-3">
                    contract expires
                  </span>
                  <span className="font-semibold capitalize">
                    {contractExpireObj}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200">
                  <span className="text-gray-700 capitalize md:font-semibold my-3">
                    Height
                  </span>
                  <span className="font-semibold  lowercase">
                    {players.height}/ {playersHeightInFeet} ft
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200">
                  <span className="text-gray-700 capitalize md:font-semibold my-3">
                    agent
                  </span>
                  <span className="font-semibold capitalize">
                    {players.agent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* right side */}
        <aside className="lg:w-120 w-full bg-white lg:p-10 p-4 h-230 shadow-sm rounded-xl lg:mt-0 mt-6">
          {/* main div start here */}
          <div>
            <h1 className="font-bold capitalize text-[20px]">
              {" "}
              perfomance & history
            </h1>
            <div className="bg-green-300/25 border border-green-500/20 p-4 shadow-xs rounded-xl my-5">
              <p className="capitalize font-bold text-[18px] my-3 ">
                <i class="bx bx-chart-trend mx-2 align-middle text-2xl text-green-800 " />
                season summary
              </p>
              <p className="text-[16px] leading-normal text-wrap text-zinc-900/85 font-semibold">
                {players.name.split(" ")[0]} shows strong left-wing dominance
                during transitions, frequently creating overload situations in
                the final third.
              </p>
              <div className="flex space-x-6 my-3">
                <p className="capitalize text-green-700/80 border-green-500/60 px-2 rounded-sm py-1 border bg-white/30 font-semibold shadow-xs ">
                  High impact
                </p>
                <p className="capitalize text-green-700/80 border-green-500/60 px-2 py-1 border rounded-sm bg-white/30 shadow-xs font-semibold">
                  playmaker
                </p>
              </div>
            </div>

            {/* Recent matches div */}
            <div className="mt-20 flex justify-between items-center">
              <h1 className="font-bold capitalize text-[20px]">
                {" "}
                recent matches
              </h1>
              <button className="capitalize text-purple-800 font-normal cursor-pointer">
                view all
              </button>
            </div>

            {/* match details */}
            <div className="flex flex-col items-start justify-center my-4">
              {/* individual match info */}
              <div className="flex space-x-20 justify-between w-full bg-gray-100 pt-4 pb-2 px-6 rounded-md my-4">
                <div className="flex flex-col justify-start items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-700 w-2 h-12 rounded-sm" />
                    <div className="flex flex-col">
                      <p className="font-semibold">vs. Man City</p>
                      <p className="text-[15px] text-zinc-700">won 2-1</p>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-green-800 font-semibold bg-green-200 p-1 rounded-md text-sm">
                    8.2
                  </span>
                </div>
              </div>

              {/* vs. arsenal */}
              <div className="flex space-x-20 justify-between w-full bg-gray-100 pt-4 pb-2 px-6 rounded-md">
                <div className="flex flex-col justify-start items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-600 w-2 h-12 rounded-sm" />
                    <div className="flex flex-col">
                      <p className="font-semibold">vs. Arsenal</p>
                      <p className="text-[15px] text-zinc-700 capitalize">
                        draw 1-1
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-amber-800 font-semibold bg-amber-200 p-1 rounded-md text-sm">
                    6.5
                  </span>
                </div>
              </div>

              {/* vs. Liverpool */}
              <div className="flex space-x-20 justify-between w-full bg-gray-100 pt-4 pb-2 px-6 rounded-md my-4">
                <div className="flex flex-col justify-start items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-700 w-2 h-12 rounded-sm" />
                    <div className="flex flex-col">
                      <p className="font-semibold">vs. Liverpool</p>
                      <p className="text-[15px] text-zinc-700 capitalize">
                        won 3-0
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-green-800 font-semibold bg-green-200 p-1 rounded-md text-sm">
                    9.0
                  </span>
                </div>
              </div>
            </div>

            {/*Load full history */}
            <div className="border text-center mt-30 px-1 py-2 rounded-lg border-gray-400/40 hover:bg-gray-200/30 duration-300 transition-all ">
              <button className="font-semibold capitalize cursor-pointer">Load full history</button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
export default Profile;
