import { useState } from "react";
import useFetch from "../Hooks/useFetch";
import { countryCodes } from "../data/countryCodes";
import { BarLoader } from "react-spinners";

const STANDINGS_SOURCES = [
  {
    id: "wc26",
    label: "WC26 Widget",
    href: "https://wc26-widget.vercel.app/groups?theme=dark&bg=solid",
    embed: true,
    note: "Embeddable open-source group tables — works on mobile and Netlify.",
  },
  {
    id: "fifa",
    label: "FIFA Official",
    href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings",
    embed: false,
    note: "Official FIFA standings. Most browsers block this in an iframe — use Open link.",
  },
  {
    id: "espn",
    label: "ESPN",
    href: "https://www.espn.com/soccer/standings/_/league/fifa.world",
    embed: false,
    note: "ESPN blocks iframes (X-Frame-Options). Use Open link instead.",
  },
  {
    id: "bbc",
    label: "BBC Sport",
    href: "https://www.bbc.com/sport/football/world-cup/table",
    embed: false,
    note: "BBC World Cup table — opens in a new tab.",
  },
];

function computeStandings(matches, teams) {
  const groupMatches = matches.filter(
    (match) => match.phase === "group" && match.status === "FINISHED"
  );

  const byGroup = {};

  teams.forEach((team) => {
    if (!byGroup[team.group]) byGroup[team.group] = {};
    byGroup[team.group][team.code] = {
      code: team.code,
      name: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      pts: 0,
    };
  });

  groupMatches.forEach((match) => {
    const home = byGroup[match.group]?.[match.home];
    const away = byGroup[match.group]?.[match.away];
    if (!home || !away) return;

    const homeScore = match.score_home ?? 0;
    const awayScore = match.score_away ?? 0;

    home.played += 1;
    away.played += 1;
    home.gf += homeScore;
    home.ga += awayScore;
    away.gf += awayScore;
    away.ga += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      home.pts += 3;
      away.lost += 1;
    } else if (homeScore < awayScore) {
      away.won += 1;
      away.pts += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.pts += 1;
      away.pts += 1;
    }
  });

  return Object.entries(byGroup)
    .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
    .map(([group, teamsMap]) => ({
      group,
      teams: Object.values(teamsMap)
        .map((team) => ({ ...team, gd: team.gf - team.ga }))
        .sort(
          (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
        ),
    }));
}

function Standings() {
  const [activeSource, setActiveSource] = useState(STANDINGS_SOURCES[0].id);
  const selectedSource =
    STANDINGS_SOURCES.find((source) => source.id === activeSource) ??
    STANDINGS_SOURCES[0];

  const {
    data: matchesData,
    loading: matchesLoading,
    error: matchesError,
  } = useFetch("/api/matches.json");
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useFetch("/api/teams.json");

  const loading = matchesLoading || teamsLoading;
  const error = matchesError || teamsError;

  if (loading) {
    return (
      <div className="flex h-screen w-auto flex-col items-center justify-center">
        <BarLoader color="#800080" size={14} aria-label="Loading Spinner" />
        <p className="my-4 text-center text-sm font-sm italic text-purple-300">
          Loading...
        </p>
      </div>
    );
  }

  if (error) return <p>Error: {String(error)}</p>;

  const matches = matchesData?.data ?? [];
  const teams = teamsData?.data ?? [];
  const standings = computeStandings(matches, teams);

  return (
    <main className="container mx-auto mt-20 px-4 md:px-0">
      <div
        className="animate-fade-in-up rounded-4xl bg-[#0d0d0e] p-6 text-white sm:p-8 md:p-10"
        style={{ animationDelay: "100ms" }}
      >
        <h1 className="flex items-center text-2xl font-bold capitalize text-white/70 sm:text-3xl">
          <i className="bx bx-trophy-star mr-2 align-middle text-3xl text-purple-500/60" />
          Group Standings
        </h1>
        <p className="my-3 text-[16px] font-medium text-zinc-500 sm:text-[17px]">
          Live rankings from completed group-stage matches
        </p>
        <span className="mt-4 block w-full rounded-md border border-purple-700/40 bg-[#170f20] px-3 py-0.5 text-center text-sm text-purple-400 sm:inline-block sm:w-auto">
          {standings.length} groups
        </span>
      </div>

      <section
        className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        style={{ animationDelay: "200ms" }}
      >
        {standings.map((group, index) => (
          <div
            key={group.group}
            style={{ animationDelay: `${index * 60}ms` }}
            className="animate-fade-in-up overflow-hidden rounded-2xl border border-purple-800/20 bg-[#0d0d0e]"
          >
            <div className="border-b border-purple-800/20 bg-[#151518] px-4 py-3">
              <h2 className="font-bold text-purple-300">Group {group.group}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] text-left text-sm text-white">
                <thead>
                  <tr className="border-b border-purple-800/10 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-2 py-2 font-medium">Team</th>
                    <th className="px-2 py-2 text-center font-medium">P</th>
                    <th className="px-2 py-2 text-center font-medium">GD</th>
                    <th className="px-2 py-2 text-center font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, rank) => (
                    <tr
                      key={team.code}
                      className="border-b border-purple-800/10 last:border-0"
                    >
                      <td className="px-3 py-2.5 text-zinc-500">{rank + 1}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <img
                            src={`https://flagcdn.com/w40/${countryCodes[team.code] ?? "un"}.png`}
                            alt=""
                            className="h-4 w-6 shrink-0 rounded border border-white/10 object-cover"
                          />
                          <span className="truncate font-medium">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-zinc-400">
                        {team.played}
                      </td>
                      <td
                        className={`px-2 py-2.5 text-center font-medium ${
                          team.gd > 0
                            ? "text-green-400"
                            : team.gd < 0
                              ? "text-red-400"
                              : "text-zinc-400"
                        }`}
                      >
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </td>
                      <td className="px-2 py-2.5 text-center font-bold text-purple-300">
                        {team.pts}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section
        className="animate-fade-in-up mt-10 mb-4 rounded-2xl border border-purple-800/20 bg-[#0d0d0e] p-5 sm:p-6"
        style={{ animationDelay: "300ms" }}
      >
        <h2 className="text-lg font-bold text-white/80 sm:text-xl">
          External standings
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          ESPN and FIFA block iframe embedding on other sites. Use the WC26
          Widget below, or open the other sources in a new tab.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {STANDINGS_SOURCES.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => setActiveSource(source.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeSource === source.id
                  ? "bg-purple-600 text-white"
                  : "border border-purple-800/30 bg-[#151518] text-zinc-400 hover:border-purple-600/40 hover:text-white"
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-zinc-500">{selectedSource.note}</p>

        {selectedSource.embed ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-purple-800/20 bg-[#08080a]">
            <iframe
              src={selectedSource.href}
              title={`${selectedSource.label} FIFA World Cup 2026 standings`}
              className="h-[min(70vh,720px)] w-full border-0"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-purple-800/30 bg-[#151518] p-6 text-center">
            <p className="text-sm text-zinc-400">
              {selectedSource.label} cannot be embedded here. Open it on their
              site instead.
            </p>
            <a
              href={selectedSource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover mt-4 inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-900/20 px-5 py-2.5 text-sm font-medium text-purple-300 hover:border-purple-400/50 hover:bg-purple-900/40"
            >
              Open {selectedSource.label}
              <i className="bx bx-link-external align-middle text-lg" />
            </a>
          </div>
        )}
      </section>
    </main>
  );
}

export default Standings;
