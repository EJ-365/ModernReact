import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="">
      {/* header and logo div */}
      <div className="flex items-center flex-col mt-56">
        <div>
          <i className="bg-violet-300/50 p-4 rounded-full mr-3 md:text-5xl text-3xl align-middle ded p bx bx-football mb-8 text-violet-600" />
        </div>

        <div className="text-center md:p-0 px-10">
          <h1 className="md:text-7xl font-extrabold mb-8 text-3xl">
            Welcome to the{" "}
            <span className="text-violet-600  font-extrabold capitalize text-wrap break-all">
              team <br />
              hub!
            </span>
          </h1>
        </div>

        <div className="text-center px-10 mb-6 md:text-xl text-lg text-slate-700 dark:text-slate-300">
          <p>
            Manage your squad, track player stats, and stay organized. The{" "}
            <br />
            central hub for everything related to our soccer team's success.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-evenly space-x-8">
            <button className=" text-white px-6 py-2 rounded-md bg-[#FF9800] font-semibold shadow-lg cursor-pointer">
             <Link to="/players"> View players</Link>
            </button>
            <button className="cursor-pointer bg-white dark:bg-slate-900 dark:text-slate-100 border border-black/10 dark:border-white/10 px-6 py-2 rounded-md font-bold shadow-xs">
              {" "}
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Team Highlights */}
      <div className="mb-0 mt-20 py-10 bg-white dark:bg-slate-900 shadow-xs w-full">
        <div className="lg:px-100  px-20 pt-20">
          <h1 className="md:font-bold font-semibold md:text-3xl text-2xl my-4 text-center md:text-left">
            Team Highlights
          </h1>
          <p className="text-sm md:text-lg text-slate-700 dark:text-slate-300 md:text-auto text-center md:text-left">
            Keep up with the latest stats and team performance metrics.
          </p>
        </div>

        {/* Team Highlights cards */}
        <div className="my-10 flex items-center justify-center xl:flex-row flex-col gap-5 md:p-auto p-10 ">
            {/* card 1 */}
          <div className="bg-violet-100/50 px-8 pb-7 pt-4 rounded-2xl xl:w-90 w-full">
            <i className="bxf bx-bar-chart-big text-xl bg-violet-200/55 p-3 rounded-md mt-3"/>
            <h2 className="font-bold text-xl my-3 capitalize">Player Stats</h2>
            <p className="text-slate-700 dark:text-slate-300 ">
              Track individual performance goals, assists, and defensive metrics
              throughout the season.
            </p>
          </div>

             {/* card 2 */}
          <div className="bg-violet-100/50 px-8 pb-7 pt-4 rounded-2xl xl:w-90 w-full">
            <i className="bx bx-calendar-alt text-xl bg-violet-200/55 p-3 rounded-md mt-3"/>
            <h2 className="font-bold text-xl my-3 capitalize">match schedule</h2>
            <p className="text-slate-700 dark:text-slate-300 ">
            Never miss a match with our integrated calendar. Sync upcoming games fo your device.
            </p>
          </div>

              {/* card 3 */}
          <div className="bg-violet-100/50 px-8 pb-7 pt-4 rounded-2xl xl:w-90 w-full">
            <i className="bxf bx-announcement text-xl bg-violet-200/55 p-3 rounded-md mt-3"/>
            <h2 className="font-bold text-xl my-3 capitalize">Annoucement </h2>
            <p className="text-slate-700 dark:text-slate-300 ">
            Stay updated with the latest news from the coach, practice changes, and team events.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
