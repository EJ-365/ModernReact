import useFetch from "../Hooks/useFetch";

function UpcomingMatches() {
  const { data, loading, error } = useFetch("/api/matches.json");

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error}</p>;

  const matches = data?.data?.slice(0, 4) ?? [];

  return (
    <section>
      <div className="flex items-center justify-between container mx-auto px-10 md:p-0">
        <h2 className="md:text-3xl text-xl md:font-bold ">Upcoming Matches</h2>

        <p className="text-purple-400 font-medium ">
          See all <i className="bx bx-arrow-right-stroke align-middle" />
        </p>
      </div>

      <div className="mx-auto mt-8 flex flex-col md:flex-row flex-wrap gap-6 p-10">
        {matches.map((match) => (
          <div
            key={match.num}
            className="flex flex-1 min-w-[260px] flex-col border border-white/10 bg-[#151518] p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between gap-2 my-6">
              <small className="text-[15.5px] font-medium text-zinc-400">
                {match.date}
              </small>

              <small className="text-sm font-medium text-white bg-zinc-700 px-3 py-0.5 rounded-sm capitalize">
                {match.venue_name ?? "TBD"}
              </small>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <p className="bg-[#232325] font-medium px-4 text-center border border-white/10 py-4 rounded-full w-15">
                  {match.home ?? "TBD"}
                </p>

                <p className="font-medium text-center mt-2">
                  {match.home_name ?? "TBD"}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center mx-4">
                <p className="text-zinc-400 font-medium text-lg">vs</p>

                <p className="text-2xl font-bold bg-purple-900/30 px-3 py-1.5 rounded-2xl">
                  {match.score_home ?? 0}:{match.score_away ?? 0}
                </p>
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-center">
                <p className="bg-[#232325] font-medium px-4 text-center border border-white/10 py-4 rounded-full w-15">
                  {match.away ?? "TBD"}
                </p>

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
