import { useNavigate } from "react-router-dom";
import useFetch from "../Hooks/useFetch";
import { countryCodes } from "../data/countryCodes";
function UpcomingMatches() {
  const { data, loading, error } = useFetch("/api/matches.json");
  const navigate = useNavigate();
  const redirectToMatches = () => {
    return (
      navigate("/matches")
    )
  }
  if (loading) return <p>Loading</p>

  if (error) return <p>Error: {error}</p>;

  const matches = Array.isArray(data?.data) ? data.data.slice(0, 4) : [];
  const hasInvalidMatchData = data && !Array.isArray(data.data);
  // 2026 World Cup teams → ISO codes for flagcdn (keys match API: match.home / match.away)

  if (hasInvalidMatchData) {
    return <p>Match schedule is unavailable.</p>;
  }

  return (
    <section>
      <div className="flex md:flex-row flex-col items-center justify-between container mx-auto px-10 md:px-20 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h2 className="md:text-3xl text-xl md:font-bold ">Upcoming Matches</h2>

        <p className="text-purple-400 font-medium ">
          <button onClick={redirectToMatches} className=" cursor-pointer"> See all <i className="bx bx-arrow-right-stroke align-middle "/></button>
        </p>
      </div>

      <div className="mx-auto mt-8 flex flex-col md:flex-row flex-wrap gap-6 p-10 mb-32">
        {matches.map((match, index) => (
          <div
            key={match.num}
            style={{ animationDelay: `${index * 80}ms` }}
            className="animate-fade-in-up card-hover flex flex-1 min-w-[260px] flex-col border border-white/10 bg-[#151518] p-6 rounded-2xl cursor-pointer hover:bg-[#1c1c22] hover:border-purple-600/40 md:gap-6 md:p-6"
          >
            <div className="flex items-center justify-between gap-2 my-6">
              <small className="text-xs font-medium text-zinc-400">
                {new Date(match.date).toLocaleString("us", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </small>

              <small className="text-xs font-medium text-white bg-zinc-700 px-3 py-0.5 rounded-sm capitalize text-nowrap">
                {match.venue_name ?? "TBD"}
              </small>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <img src={`https://flagcdn.com/w320/${countryCodes[match.home] ?? "un"}.png`} alt={match.home_name} className="bg-[#232325] font-medium text-center border border-white/10 rounded-full md:w-24 w-full"/>
                 
                
                

                <p className="font-medium text-center mt-2">
                  {match.home_name ?? "TBD"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center mx-4">
                <p className="text-zinc-400 font-medium text-lg">vs</p>

                <p className="text-2xl font-bold bg-purple-900/30 px-3 py-1.5 rounded-2xl">
                  {match.score_home ?? 0}-{match.score_away ?? 0}
                </p>
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center">
                <img src={`https://flagcdn.com/w320/${countryCodes[match.away] ?? "un"}.png`} alt={match.away_name} className="bg-[#232325] font-medium  text-center border border-white/10  rounded-full w-full md:w-24"/>
              

                <p className="font-medium text-center mt-2">
                  {match.away_name ?? "TBD"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UpcomingMatches;
