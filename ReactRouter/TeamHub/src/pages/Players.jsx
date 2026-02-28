import Navbar from "../Components/Navbar";
import { playersData } from "../playersData";
export default function Players() {
  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row items-center justify-evenly gap-4">
        <div>
          <h1 className="capitalize text-4xl sm:text-5xl font-bold mb-3">our players</h1>
          <p className="text-slate-700">
            Meet the squad and explore their stats.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            className="border border-slate-300 px-2 py-1 rounded-md"
            placeholder="Search by name"
          />
          <select className="px-12 py-1 border border-slate-300 rounded-md text-left sm:mx-3">
            <option value="forward">Forward</option>
            <option value="midfielder">Midfielder</option>
          </select>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(2,240px)] xl:grid-cols-[repeat(4,240px)] justify-center justify-items-center md:justify-items-stretch gap-x-6 gap-y-6 my-10">
        {playersData.map((players) => (
          <div className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow text-center border border-purple-100 rounded-xl w-full max-w-[240px] md:max-w-none md:w-60 cursor-pointer" key={players.id}>
            <div className="relative inline-block mb-4">
              <span className="absolute z-40 -top-2 -left-2 bg-[#7f13ec] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm shadow-lg border-2 border-white">
                {players.number}
              </span>
              <img src={players.photo || "https://via.placeholder.com/192x192?text=No+Photo"} alt={players.name} className="w-48 h-48 object-cover rounded-2xl" />
            </div>
            <h4 className="font-bold text-lg mb-2">{players.name}</h4>
            <p className="text-purple-800 font-semibold px-3 py-1 rounded-2xl bg-purple-100 w-fit mx-auto text-center uppercase tracking-wider text-sm">{players.position}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


