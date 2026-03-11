function About() {
  return (
    <section>
      {/* image overlay cta */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="w-full h-[420px] bg-center bg-cover bg-no-repeat bg-[url('https://images.stockcake.com/public/9/3/4/934d4fc7-966a-4e97-bf63-12d7bc93d572/stadium-on-game-day-stockcake.jpg')]" />
        {/*overlay text */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center justify-center text-center my-3">
            <p className="uppercase font-medium bg-white/20 backdrop-blur-3xl border border-gray-200 rounded-3xl px-3 text-sm ">est. 2010</p>
            <h1 className="text-6xl font-bold capitalize">More Than Just a club</h1>
            <p className="text-xl my-6 text-white">
              Building champions on and off the field through dedication,
              teamwork, and an unwavering passion for the beautiful game.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export default About;
