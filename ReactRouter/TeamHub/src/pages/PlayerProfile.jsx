import { useNavigate, useParams } from "react-router-dom";
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
  return (
    <div>
      {" "}
      {/* player name and back to player button */}
      <div className="p-4 mx-3 flex flex-wrap items-center justify-between">
        <h1 className="md:text-4xl text-2xl md:font-extrabold font-bold capitalize lg:mb-0 mb-4 ">
          Player Profile: {players.name}
        </h1>
        <button
          className="md:text-[14px] text-sm md:font-semibold bg-orange-600 md:py-2.5 py-1.5 md:px-6 px-4 rounded-md text-white uppercase cursor-pointer hover:bg-orange-600/90 duration-300 transition-all ease-in-out"
          onClick={redirectToPLayersPage}
        >
          <i className="bx bx-arrow-left items-center align-middle font-extralight md:text-2xl text-xl mr-1.5 " />
          Back to players
        </button>
      </div>
      {/* Players individual cards and perfomance history start here */}
      <section className="flex overflow-y-auto transition-colors min-h-screen">
        {/* left side */}
        <div className="flex-1 p-10  border ">
         <div className="bg-linear-to-br from-[#530c99] via-[#490986] to-[#3c066f] pl-10 h-120 pt-15 rounded-2xl shadow-lg shadow-purple-400">
         <div className="flex items-center justify-start space-x-6 mx-10">
            {/* for the image */}
          <div className="relative">
            <img src={players.photo} alt={players.name} className="w-40 rounded-full border border-gray-300" />
              {/* player number */}
          <div className="w-10 h-auto p-1 border bg-white text-2xl font-extrabold text-violet-600 rounded-full text-center absolute right-0 -bottom-6 flex items-center justify-center">{players.number}</div>
          </div>

        

          {/* for the text heading */}
          <div className="flex items-start flex-col justify-start">
            <h1 className="capitalize text-3xl font-bold text-white">{players.name}</h1>
            <p className="text-white/60 text-xl font-semibold tracking-tight"> <i className="bx bx-football items-center align-middle mx-2 my-2 text-2xl text-[#e66723]"/>{players.position}</p>
            <div className="flex items-center justify-between space-x-4 p-3">
              <p className="bg-white/15 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-zinc-200 font-semibold"> <span className="text-gray-400 mr-1">ID: </span> {randomID}</p>
             
              <p className="bg-white/15 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-zinc-200 font-semibold"> <span className="text-gray-400 mr-1">Age: </span> {players.age}</p>
              
              <p className={`bg-white/15 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-zinc-200 font-semibold`}> 
              <span className="text-gray-400 mr-1">Nationality: </span> {players.nationality} <i className={`fi fi-${players.countryCode.toLocaleLowerCase()} `}/></p>
            </div>
          </div>
          </div>

         </div>


        </div>

        {/* right side */}
        <aside className="w-95 bg-gray-300 border p-10 shadow-sm">
          perfomance and history
        </aside>
      </section>
    </div>
  );
}
export default Profile;
