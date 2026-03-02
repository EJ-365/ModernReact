// profile details for each players
import { useParams } from "react-router-dom";
import { playersData } from "../playersData";

export default function Profile() {
  const { id } = useParams();
  const player = playersData.find((p) => p.id === id);
  if (!player) return <h1 className="text-slate-900 p-10">Player not found</h1>;
  return (
    <section className="text-slate-900 p-6">
      <h2 className="text-3xl font-bold">{player.name}</h2>
      <p className="mt-2 text-slate-700">{player.position}</p>
      <p className="text-slate-700">{player.number}</p>
      <img
        className="mt-4 w-64 h-64 object-cover rounded-xl"
        src={player.photo}
        alt={player.name}
      />
    </section>
  );
}
