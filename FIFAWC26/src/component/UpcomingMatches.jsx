import useFetch from "../Hooks/useFetch";

function UpcomingMatches() {
  const { data, loading, error } = useFetch("/api/matches.json");

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error}</p>;

  const matches = data?.data?.slice(0, 4) ?? [];
  // 2026 World Cup teams → ISO codes for flagcdn (keys match API: match.home / match.away)
  const countryCodes = {
    ARG: "ar",
    AUS: "au",
    AUT: "at",
    BEL: "be",
    BIH: "ba",
    BRA: "br",
    CAN: "ca",
    CIV: "ci",
    COD: "cd",
    COL: "co",
    CPV: "cv",
    CRO: "hr",
    CUW: "cw",
    CZE: "cz",
    DZA: "dz",
    ECU: "ec",
    EGY: "eg",
    ENG: "gb-eng",
    ESP: "es",
    FRA: "fr",
    GER: "de",
    GHA: "gh",
    HAI: "ht",
    IRN: "ir",
    IRQ: "iq",
    JAM: "jm",
    JOR: "jo",
    JPN: "jp",
    KOR: "kr",
    KSA: "sa",
    MAR: "ma",
    MEX: "mx",
    NED: "nl",
    NOR: "no",
    NZL: "nz",
    PAN: "pa",
    PAR: "py",
    POR: "pt",
    QAT: "qa",
    RSA: "za",
    SCO: "gb-sct",
    SEN: "sn",
    SUI: "ch",
    SWE: "se",
    TUN: "tn",
    TUR: "tr",
    URU: "uy",
    USA: "us",
    UZB: "uz",
  };

  return (
    <section>
      <div className="flex items-center justify-between container mx-auto px-10 md:px-20">
        <h2 className="md:text-3xl text-xl md:font-bold ">Upcoming Matches</h2>

        <p className="text-purple-400 font-medium ">
          See all <i className="bx bx-arrow-right-stroke align-middle" />
        </p>
      </div>

      <div className="mx-auto mt-8 flex flex-col md:flex-row flex-wrap gap-6 p-10 mb-32">
        {matches.map((match) => (
          <div
            key={match.num}
            className="flex flex-1 min-w-[260px] flex-col border border-white/10 bg-[#151518] p-6 rounded-2xl"
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
                <img src={`https://flagcdn.com/w320/${countryCodes[match.home]?? "TBD"}.png`} alt={countryCodes[match.home_name]} className="bg-[#232325] font-medium text-center border border-white/10 rounded-full w-full"/>
                 
                
                

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
                <img src={`https://flagcdn.com/w320/${countryCodes[match.away] ?? "TBD"}.png`} className="bg-[#232325] font-medium  text-center border border-white/10  rounded-full w-60"/>
              

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
