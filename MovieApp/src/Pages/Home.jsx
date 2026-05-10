import { useContext } from "react";
import FeaturedMovie from "../Components/FeaturedMovie";
import { TrendingMoviesContext } from "../Contexts/TrendingMovies";

export default function Home() {
  const { trendingMovies } = useContext(TrendingMoviesContext);
  return (
    <main>
      <FeaturedMovie />
      <section>
        <div className="capitalize dark:text-white text-[27px] font-bold flex items-center justify-between px-4 md:mx-56 md:px-0 text-right">
          <p>Trending now</p>
        </div>

        {/* rendering the trending movies */}
        <div className="flex flex-col items-center gap-6 px-4 mx-0 md:inline-flex md:flex-row md:items-center md:space-x-10 md:mx-52 md:px-0 dark:text-white my-6">
          {trendingMovies.map((trendingNow) => {
            return (
              <div
                key={`${trendingNow.title}-${trendingNow.date}`}
                className="cursor-pointer mx-auto md:mx-3 group relative flex w-full max-w-[min(92vw,22rem)] flex-col items-center md:max-w-none md:block md:w-auto md:shrink-0"
              >
                <div className="mb-3 relative w-full shrink-0 md:w-full md:shrink">
                  <img
                    src={trendingNow.image}
                    alt=""
                    className="aspect-2/3 w-full object-cover rounded-xl transition-all duration-200 hover:scale-104 border border-zinc-400/10 md:w-60"
                  />
                  {/* heart icon */}
                  <div className="absolute top-2 right-2 rounded-xl flex justify-end md:top-auto md:right-auto md:p-3 md:-mt-84 md:left-40 group/heart">
                    <i className="bx bx-heart text-2xl bg-gray-800/30 transition-colors duration-200 h-10 rounded-full w-auto px-2 py-2 align-middle text-white font-thin backdrop-blur-2xl group-hover/heart:bg-gray-800"/>
                  </div>
             
                  <div className="pointer-events-none absolute inset-0 z-[1] rounded-xl blur-3xl transition-colors duration-200 group-hover:bg-linear-to-b via-black/60 to-black/70 md:inset-x-0 md:top-40 md:bottom-auto md:h-[14rem] md:left-auto md:right-auto"/>
                </div>
                <h2 className="dark:text-white font-semibold text-lg group-hover:text-violet-500 transition-colors duration-200">
                  {trendingNow.title}
                </h2>
                <div className="flex justify-between my-1">
                  <span className="dark:text-zinc-400 font-medium text-sm">{trendingNow.date}</span>
                  <span className="text-violet-500 text-sm">
                    {" "}
                    <i className="bxf bx-star relative top-0.5 mx-1 text-sm" />
                    {trendingNow.rating}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
