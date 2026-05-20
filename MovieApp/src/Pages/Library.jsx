import { useNavigate } from "react-router-dom";

export default function Library() {
  const navigate = useNavigate();
  function redirectToHome() {
    navigate("/movies");
  }
  return (
    <section>
      <div className="flex md:justify-start justify-center items-center mx-40 my-10  ">
        <h2 className="dark:text-white md:text-3xl text-2xl md:font-[650] font-semibold text-nowrap">
          {" "}
          <i className="bxf bx-heart text-violet-500/50 dark:text-violet-500 align-middle mr-2 relative -top-1" />
          My Library
        </h2>
      </div>

      <div className="flex items-center justify-center flex-col w-1/2 mx-auto md:my-30 my-20">
        <i class="bx bx-film dark:text-zinc-500 text-white/70 text-center align-middle px-7 dark:bg-[#262645] bg-zinc-400 rounded-full text-[3rem] py-7" />
        <div>
          <h3 className="dark:text-white text-2xl md:font-bold font-semibold text-center mt-8 mb-4">
            Your library is empty.
          </h3>
          <p className="text-zinc-400 md:text-lg  mb-4 text-center">
            Save movies and TV shows to your library to keep track of <br />{" "}
            what you want to watch next.
          </p>
          <div className="flex items-center justify-center my-10">
            <button onClick={redirectToHome} className="capitalize dark:bg-violet-500 bg-violet-400 text-white/90 px-7 py-3 rounded-xl font-medium  dark:text-white md:text-[17px] cursor-pointer dark:hover:bg-violet-600 duration-300 transition-colors hover:bg-violet-300">
              explore movies
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
