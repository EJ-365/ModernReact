import brucePortrait from "../assets/bruce-portrait.jpg";
function Calltoaction() {
  return (
    <div className="md:my-auto my-20 max-w-full flex md:flex-row flex-col items-center justify-center md:mx-0 mx-5">
      {/* content to the left */}
      <div className="md:mx-24 ml-0">
        <div className="flex items-center justify-start ">
          <div className="w-10 h-px bg-[#ae7338] font-light" />
          <p className="text-[#ae7338] ml-2 md:font-semibold font-light uppercase font-plex text-[14px] leading-0.5">
            Fox plush · portrait no. 01
          </p>
        </div>

        <h1 className="font-black md:text-[8rem] text-6xl font-bricolage leading-35 tracking-[-8px]">
          Bruce
        </h1>
        <h3 className="font-bricolage md:text-[2.20rem] text-[1.5rem] text-wrap md:w-100 w-full font-semibold leading-[1.2]">
          Officially soft. Unofficially in charge.
        </h3>
        <p className="font-plex text-normal text-[#8b5e2b] text-lg md:w-150 max-w-full my-8 text-wrap">
          A bright-eyed fox with a warm russet coat, cloud-soft cheeks, and the
          kind of steady presence every room needs.
        </p>

        {/* button div */}
        <div className="inline-block  bg-[#d8a15a] rounded-sm">
          <button className="bg-[#1a1a1a] text-white md:px-6 md:py-3 px-4 py-2 rounded-sm font-bold font-plex flex items-center gap-2 md:shadow-[5px_5px_0px_#d8a15a] shadow-[3px_3px_0px_#d8a15a] hover:-translate-x-1 hover:-translate-y-1 transition-all  md:hover:shadow-[8px_6px_0px_#d8a15a] hover:[5px_4px_0px_#d8a15a] cursor-pointer">
            Meet the details <i className="bxf bx-arrow-down-stroke bx-remove-padding" />
          </button>

        </div>
      </div>

      {/*image div */}
      <div className="inline-block md:mt-28 my-18 relative md:inset-0 ">
        <div className="shadow-[27px_24px_#1a1a1a] border border-zinc-400 md:w-120 w-80">
          <img src={brucePortrait} className="md:object-cover object-center w-auto  translate-y-0 translate-x-0.5 drop-shadow-sm " />
        </div>

        {/*floating tag */}
        <div className="absolute md:bottom-10 md:-left-10 left-10 bottom-4 transition-transform">
          <button className="bg-[#d8a15a] font-bricolage md:px-5 px-3 py-3 font-semibold -rotate-3 shadow-[3px_3.6px_0px_#c8c8c8] text-[black]">The main fox</button>
        </div>
      </div>
    </div>
  );
}
export default Calltoaction;
