import FeaturedProject from "../Component/FeaturedProject";

function Home() {
  // personal information object
  const information = {
    fullName: "Ejay gabriel",
    position: "Front-End Developer Intern",
  };
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-y-auto">
      <div className="text-center flex flex-col items-center justify-center px-6 py-32 md:py-80 w-full">
        <h1 className="text-4xl capitalize font-bold font-space my-5 md:text-6xl">
          {information.fullName}
        </h1>
        <p>{information.position}</p>
        <div className="mt-11 flex flex-wrap justify-center gap-2">
          <button className="bg-black text-white px-7 py-2 text-xs font-mono uppercase cursor-pointer hover:bg-white hover:border border-black hover:text-black transition-all duration-300 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
            view work
          </button>

          <button className="bg-white text-black px-7 py-2 text-xs font-mono uppercase  border border-gray-200 cursor-pointer dark:border-neutral-700 dark:bg-black dark:text-white">
            let's talk
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="my-7 border-t border-b border-gray-300 p-6 dark:border-neutral-800 md:p-13">
        <p className="font-manrope text-xl font-bold my-12 md:my-20 md:text-2xl">
          {" "}
          I build precise, performant user interfaces with a<br /> focus on
          technical clarity and accessible design <br /> systems.
        </p>
      </div>
      {/* Featured project */}
      <FeaturedProject />

      <div className="flex flex-col items-center py-60">
        <h3 className="font-semibold md:text-4xl text-3xl mb-10">Ready to start?</h3>
        <p className="my-0 md:w-140 text-center text-base text-gray-700 dark:text-white">
          Currently looking for internship opportunities starting Summer 2027.
          Let's discuss how I can contribute to your team.
        </p>
        <button className="uppercase dark:bg-white bg-black dark:text-black cursor-pointer  text-white px-12 py-4.5 mt-20 tracking-[3px] text-xs font-mono hover:bg-black/95 dark:hover:bg-white/95">send an email</button>
      </div>
    </main>
  );
}
export default Home;
