function Standings() {
  return (
    <main className="mx-auto container mt-20 md:px-0 px-2 sm:px-4">
      {/* CTA  */}
      <div className="animate-fade-in-up bg-[#0d0d0e] text-white md:p-10 p-6 sm:p-8 rounded-4xl" style={{ animationDelay: "100ms" }}>
        <h1 className="capitalize font-bold  sm:text-3xl text-2xl text-white/70 flex items-center">
          <i className="bx bx-trophy-star text-3xl items-center align-middle mr-2 text-purple-500/60" />
          Group Standings
        </h1>
        <p className="text-zinc-500 text-[16px] sm:text-[17px] font-medium my-3 text-nowrap">
          Current rankings across all 12 groups{" "}
        </p>
        <span className="text-purple-400 border px-3 rounded-md border-purple-700/40 bg-[#170f20] w-full sm:w-[160px] py-0.5 mt-4 text-sm text-center block sm:inline-block md:text-nowrap">
          All group standings
     
        </span>
      </div>

      <section className="mt-10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="card-hover overflow-hidden rounded-2xl border border-purple-800/20">
            <iframe 
            src="https://www.espn.com/soccer/standings/_/league/fifa.world"
            title="external site"
            width="100%"
            height="700px"
            style={{ border: 'none' }}> 
            </iframe>
        </div>

      </section>
    </main>
  );
}

export default Standings;
