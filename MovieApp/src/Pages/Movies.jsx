import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BASE_URL, API_KEY } from "../api/tmdb";
import Search from "../Components/Search";
function Movies({
  allMovies,
  setAllMovies,
  setPage,
  page,
  pageIncrement,
  genres,
  setGenres,
  selectedGenre,
  setSelectedGenre,
  setSearchQuery
}) {
  // fetching the genres endpoint
  useEffect(() => {
    fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => setGenres(Array.isArray(data.genres) ? data.genres : []))
      .catch((err) => console.log("Error fetching genre", err));
  }, [setGenres]);

  // UI START HERE
  return (
    <section className="dark:text-white">
      <div className="font-bold md:text-3xl flex md:justify-start md:ml-50 text-center justify-center text-xl my-10 md:my-5">
        <h2>Movies</h2>
      </div>
      <Search setSearchQuery={setSearchQuery} setPage={setPage}/>

      <div className=" p-5 flex items-center md:space-x-2 justify-center mb-4 flex-wrap md:my-0 my-3 space-y-3 space-x-3">
        {/*All button */}
        <button
          onClick={() => {
            setSelectedGenre("");
            setPage(1);
            setAllMovies({ movies: [], totalPages: 0 });
          }}
          className={`${selectedGenre === ""
            ? "bg-violet-800 text-white"
            : "bg-gray-200/60 text-zinc-500 dark:bg-[#19192d] dark:text-zinc-300"
          } px-4 py-2 rounded-3xl font-medium capitalize transition-all duration-50 cursor-pointer hover:bg-violet-800 hover:text-white dark:hover:bg-violet-700`}
       
     
        >
          All movies
        </button>
        {genres.map((genre) => (
          <div key={genre.id}>
            <button
              onClick={() => {
                setSelectedGenre(genre.id);
                setPage(1);
                setAllMovies({ movies: [], totalPages: 0 });
              }}
              className={`${selectedGenre === genre.id
                ? "bg-violet-800 text-white"
                : "bg-gray-200/60 text-zinc-500 dark:bg-[#19192d] dark:text-zinc-300"
              } px-4 py-2 rounded-3xl font-medium capitalize transition-all duration-50 cursor-pointer hover:bg-violet-800 hover:text-white`}
         
            >
              {genre?.name}
            </button>
          </div>
        ))}
      </div>
      <div className="dark:text-white mx-50 my-5">
        <p className=" text-violet-800/70 dark:text-zinc-300 font-bold  text-sm italic text-[14px] ">
          Showing Page: {`${page} of ${allMovies.totalPages}`}
        </p>
      </div>

      {/* Movies rendering */}
      <div className="flex justify-center flex-wrap md:ml-20 mx-10">
        {allMovies.movies.map((movie) => (
          <Link
            to={`/movies/${movie.id}`}
            key={`${movie.id}`}
            className="cursor-pointer mx-auto md:mx-4 group relative flex w-34 max-w-[min(92vw,22rem)] flex-col items-center md:max-w-none md:block md:w-auto md:shrink-0 md:my-4 my-3"
          >
            <div className="group/image mb-3 relative w-full shrink-0 md:w-full md:shrink">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt=""
                className="aspect-2/3 w-full object-cover rounded-xl transition-all duration-200 hover:scale-104 border border-zinc-400/10 md:w-60 relative"
              />

              {/* heart icon */}
              <div className="absolute top-2 right-2 z-20 rounded-xl flex justify-end md:top-auto md:right-auto md:p-3 md:-mt-84 md:left-40 group/heart">
                <i className="bx bx-heart text-2xl bg-gray-800/30 transition-colors duration-200 h-10 rounded-full w-auto px-2 py-2 align-middle text-white font-thin backdrop-blur-2xl group-hover/heart:bg-gray-800" />
              </div>

              <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 h-30 top-60 blur-xl" />
            </div>

            <h2 className="dark:text-white font-semibold text-lg group-hover:text-violet-500 transition-colors duration-200">
              {movie.title}
            </h2>

            <div className="flex justify-between my-1">
              <span className="dark:text-zinc-400 font-medium text-sm">
                {movie.release_date}
              </span>
              <span className="text-violet-500 text-sm">
                {" "}
                <i className="bxf bx-star relative top-0.5 mx-1 text-sm" />
                {movie.vote_average.toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* see more logic needs to be implemented here or exported*/}
      <div className="flex items-center justify-center my-20">
        <button
          onClick={pageIncrement}
          className="capitalize dark:bg-violet-500 bg-violet-400 text-white/90 px-3 py-2 rounded-sm font-medium  dark:text-white md:text-[14px] cursor-pointer dark:hover:bg-violet-600 duration-300 transition-colors hover:bg-violet-300 italic"
        >
          see more
        </button>
      </div>
    </section>
  );
}
export default Movies;
