import HoustonTrafficSimulator from "./features/houston-traffic/HoustonTrafficSimulator.jsx";

function Home() {
  return (
    <div className="min-h-full bg-[#05070c] text-[#f2f4ef]">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
            MODERNREACT · PROJECT HUB
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-wide">
            Houston Traffic Simulator
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Live weather via Open-Meteo (free). Flights + real traffic can be
            wired to paid APIs safely through the built-in `/api/*` proxy.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-extrabold text-emerald-100 hover:bg-emerald-500/20"
              href="/houston-traffic"
            >
              Launch simulator
            </a>
            <a
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
            >
              Weather source
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/25 p-4 text-xs text-white/70">
            <div className="font-semibold text-white/80">Paths</div>
            <div className="mt-1 font-mono">
              <div>
                <span className="text-white/50">/</span> (this page)
              </div>
              <div>
                <span className="text-white/50">/</span>houston-traffic
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const path =
    typeof window !== "undefined" ? window.location.pathname : "/";

  if (path.endsWith("/houston-traffic") || path.includes("/houston-traffic/")) {
    return <HoustonTrafficSimulator />;
  }

  return <Home />;
}

