import { useNavigate } from "react-router-dom";
import UpcomingMatches from "../component/UpcomingMatches";
import fwc26logo from "../assets/fwc26logo.svg";

const hostFlags = [
  { code: "us", name: "USA" },
  { code: "ca", name: "Canada" },
  { code: "mx", name: "Mexico" },
];

const stats = [
  { icon: "bx-group", value: "48", label: "Teams" },
  { icon: "bx-calendar-alt", value: "104", label: "Matches" },
  { icon: "bx-location", value: "16", label: "Cities" },
];

function Home() {
  const navigate = useNavigate();

  return (
    <section className="text-white">
      {/* Hero */}
      <div className="hero-grid relative overflow-hidden border-b border-white/5 bg-linear-to-br from-[#08080a] via-[#130818] to-[#1a0a2e]">
        <div className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-600/25 blur-3xl md:right-1/4 md:h-96 md:w-96" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-12 md:py-24 lg:gap-16">
          {/* Left — copy + CTAs */}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <p
              className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400"
              style={{ animationDelay: "0ms" }}
            >
              <i className="bx bx-radio-circle-marked align-middle" />
              The biggest tournament
            </p>

            <div
              className="animate-fade-in-up mb-6 flex items-center justify-center gap-3 md:justify-start"
              style={{ animationDelay: "80ms" }}
            >
              {hostFlags.map((flag) => (
                <img
                  key={flag.code}
                  src={`https://flagcdn.com/w40/${flag.code}.png`}
                  alt={flag.name}
                  className="h-6 w-9 rounded border border-white/10 object-cover shadow-sm"
                />
              ))}
              <span className="ml-1 text-sm text-zinc-400">3 nations · 16 cities</span>
            </div>

            <h1
              className="animate-fade-in-up text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl lg:text-6xl"
              style={{ animationDelay: "160ms" }}
            >
              FIFA World Cup
              <span className="mt-1 block bg-linear-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent">
                2026
              </span>
            </h1>

            <p
              className="animate-fade-in-up mt-5 max-w-lg text-base leading-relaxed text-zinc-400 md:text-lg"
              style={{ animationDelay: "240ms" }}
            >
              The expanded 48-team tournament across the United States, Canada,
              and Mexico. 104 matches, 16 host cities, one champion.
            </p>

            <div
              className="animate-fade-in-up mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start"
              style={{ animationDelay: "320ms" }}
            >
              <button
                type="button"
                onClick={() => navigate("/matches")}
                className="card-hover flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-medium capitalize text-purple-700 hover:text-purple-900 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer"
              >
                View schedule
                <i className="bx bx-arrow-right-stroke text-2xl align-middle" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/teams")}
                className="card-hover flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3 font-medium capitalize text-white backdrop-blur-sm hover:border-purple-400/40 hover:bg-white/10 cursor-pointer"
              >
                Explore teams
                <i className="bx bx-arrow-right-stroke text-2xl align-middle" />
              </button>
            </div>

            <div
              className="animate-fade-in-up mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
              style={{ animationDelay: "400ms" }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-full border border-purple-500/20 bg-white/5 px-4 py-2 text-sm"
                >
                  <i className={`bx ${stat.icon} text-lg text-purple-400`} />
                  <span className="font-bold text-white">{stat.value}</span>
                  <span className="text-zinc-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — logo */}
          <div
            className="animate-fade-in-up relative flex flex-1 items-center justify-center"
            style={{ animationDelay: "200ms" }}
          >
            <div className="absolute h-48 w-48 rounded-full bg-purple-500/30 blur-3xl md:h-64 md:w-64" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm md:p-14">
              <img
                src={fwc26logo}
                className="w-44 md:w-60 lg:w-72"
                alt="FIFA World Cup 2026 logo"
              />
            </div>
          </div>
        </div>
      </div>

      <UpcomingMatches />
    </section>
  );
}

export default Home;
