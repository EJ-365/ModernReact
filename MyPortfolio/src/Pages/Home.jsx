function Home() {
  // personal information object
  const information = {
    fullName: "Ejay gabriel",
    position: "Front-End Developer Intern",
  };
  return (
    <main>
      <div className="text-center mx-auto flex flex-col items-center justify-center my-80">
        <h1 className="text-6xl capitalize font-bold font-space my-5">
          {information.fullName}
        </h1>
        <p>{information.position}</p>
        <div className="space-x-2 mt-11">
          <button className="bg-[#8B5CF6] text-white px-7 py-2 text-[11px] font-mono uppercase cursor-pointer hover:bg-[#7C3AED]">
            view work
          </button>

          <button className="bg-white text-black px-7 py-2 text-[11px] font-mono uppercase  border border-gray-200 cursor-pointer">
            let's talk
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="my-7 p-20 border-t border-b border-gray-300">
        <p className="font-inter text-xl font-medium">
          {" "}
          I build precise, performant user interfaces with a<br/> focus on technical
          clarity and accessible design <br/> systems.
        </p>
      </div>
    </main>
  );
}
export default Home;
