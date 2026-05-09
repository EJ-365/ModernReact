import featuredMovieImage from "../assets/featuredMovieSample.jpg"
function FeaturedMovie() {
  return (
    <section className="container mx-auto text-left w-3/4 my-14 relative ">
    <div style={{backgroundImage: `url(${featuredMovieImage})`}} className="bg-cover bg-center h-auto w-auto flex flex-col items-left justify-normal align-bottom pt-70 px-15 py-20 bg-blend-multiply inset-0 object-cover relative rounded-3xl">
       <div className="bg-black/60 absolute inset-0 rounded-3xl"/>
      {/* genre tags */}
      <div className="space-x-2 flex z-10 ">
        <span className="border border-[#483784] px-4 py-1 bg-violet-950/30 rounded-2xl  text-violet-200/80 text-xs font-semibold">
          Sci-Fi
        </span>
        <span className="border border-[#483784] px-4 py-1 bg-violet-950/30 rounded-2xl text-violet-200/80 text-xs font-medium">
          Action
        </span>
        <span className="border border-[#483784] px-4 py-1 bg-violet-950/30 rounded-2xl text-violet-200/80 text-sm font-medium">
          Thriller
        </span>
      </div>

      {/* feature title */}
      <div className="z-10">
        <h2 className="font-bold text-[43px] text-white/80 ">
          Neon Horizon
        </h2>
      </div>
      {/* featured movie; description */}
      <div className="flex flex-col flex-wrap text-wrap break-all z-10">
        <p className="text-zinc-100/90 my-3">
          In a cyberpunk future, a rogue detective uncovers a conspiracy <br/> that
          threatens the very fabric of reality. <br/> As the lines between human and
          machine blur, he must decide who to trust.
        </p>
      </div>

      {/* buttons */}
      <div className="space-x-3 my-5 z-10">
        <button className="border p-2 bg-[#8b5cf6] text-white font-semibold rounded-xl px-6 border-none capitalize cursor-pointer hover:scale-104 shadow-lg shadow-purple-400/70 duration-200 transition-all hover:bg-[#734dce]">
          <i className="bxf bx-play text-2xl align-middle text-white" />
          Watch now
        </button>
        <button className="border p-2 bg-[#1a1a20] text-white/90 font-semibold rounded-xl px-6 border-none capitalize cursor-pointer hover:scale-104 shadow-lg shadow-gray-800 duration-200 transition-all hover:bg-[#131316]">
          <i className=" mr-2 bx bx-alert-octagon text-2xl align-middle" />
          More info
        </button>
      </div>
    </div>
    </section>
  );
}
export default FeaturedMovie;
