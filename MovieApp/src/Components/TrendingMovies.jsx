import { useContext } from "react"
import { Link } from "react-router-dom"
import { TrendingMoviesContext } from "../Contexts/TrendingMoviesContext"
import LibraryHeartButton from "./LibraryHeartButton"
export default function TrendingMovies(){
    const { topFiveTrending } = useContext(TrendingMoviesContext)
    return (
        <section>
        <div className="capitalize dark:text-white text-[27px] font-bold flex items-center justify-between px-4 md:mx-56 md:px-0 text-center md:text-left">
          <p>Trending now</p>
        </div>

        {/* rendering the trending movies */}
        <div className="flex flex-col items-center gap-4 px-4 mx-0 md:inline-flex md:flex-row md:items-center md:space-x-8 md:mx-52 md:px-0 dark:text-white my-6">
          {topFiveTrending.map((trendingNow) => (
            <Link
              key={`${trendingNow.id}`}
              to={`/home/${trendingNow.id}`}
              className="cursor-pointer mx-auto md:mx-1 group relative flex w-full max-w-[min(92vw,22rem)] flex-col items-center md:max-w-none md:block md:w-auto md:shrink-0"
            >
              <div className="group/image mb-3 relative w-full shrink-0 md:w-full md:shrink">
                <img
                  src={`https://image.tmdb.org/t/p/w500${trendingNow.poster_path}`}
                  alt=""
                  className="aspect-2/3 w-full object-cover rounded-xl transition-all duration-200 hover:scale-104 border border-zinc-400/10 md:w-60 relative"
                />

                <LibraryHeartButton
                  item={{
                    id: trendingNow.id,
                    mediaType: "movie",
                    title: trendingNow.title,
                    poster_path: trendingNow.poster_path,
                    voteAverage: trendingNow.vote_average,
                    releaseDate: trendingNow.release_date,
                  }}
                />

                <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 h-30 top-60 blur-xl" />
              </div>

              <h2 className="dark:text-white font-semibold text-lg group-hover:text-violet-500 transition-colors duration-200 text-wrap">
                {trendingNow.title}
              </h2>

              <div className="flex justify-between my-1">
                <span className="dark:text-zinc-400 font-medium text-sm">
                  {trendingNow.release_date}
                </span>
                <span className="text-violet-500 text-sm">
                  {" "}
                  <i className="bxf bx-star relative top-0.5 mx-1 text-sm" />
                  {`${(trendingNow.vote_average).toFixed(2)}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
}