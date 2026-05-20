import { GridLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_KEY } from "../api/tmdb";

function isMovieDetails(data) {
  return Boolean(data?.id && Array.isArray(data.genres));
}

function MoviesDetail() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [runtime, setRuntime] = useState();
  const [movieCredit, setMovieCredit] = useState(null);
  const [showMoreCast, setShowMoreCast] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  // show more cast function
  function showMore() {
    setShowMoreCast((prev) => !prev);
  }

  useEffect(() => {
    setCurrentMovie(null);
    setRuntime(undefined);
    setMovieCredit(null);
    setShowMoreCast(false);
    setLoadStatus("loading");

    const controller = new AbortController();

    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMovieDetails(data)) {
          setLoadStatus("not-found");
          return;
        }

        setCurrentMovie(data);
        setRuntime(data.runtime);
        setLoadStatus("ready");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.log("Error fetching data", err);
        setLoadStatus("not-found");
      });

    return () => controller.abort();
  }, [movieId]);

  // useEffect for the movie credits

  useEffect(() => {
    if (!currentMovie?.id) return undefined;

    const controller = new AbortController();

    fetch(
      `https://api.themoviedb.org/3/movie/${currentMovie.id}/credits?api_key=${API_KEY}`,
      { signal: controller.signal },
    )
      .then((res) => res.json())
      .then((data) => setMovieCredit(Array.isArray(data?.cast) ? data : { cast: [] }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.log("Error while fetching the data", err);
        setMovieCredit({ cast: [] });
      });

    return () => controller.abort();
  }, [currentMovie?.id]);

  // redirecting to home chevron icon
  const redirectToHome = () => {
    navigate("/home");
  };

  const getReleaseYear = (releaseYear) => {
    if (!releaseYear) return "N/A";
    const date = new Date(releaseYear);
    return Number.isNaN(date.getTime()) ? "N/A" : date.getFullYear();
  };

  // runtime conversion to hours

  const getRuntime = (runtime) => {
    if (!Number.isFinite(runtime)) return "N/A";

    const toHours = Math.floor(runtime / 60);
    const toMins = runtime % 60;

    const formattedMins = toMins <= 9 ? `0${toMins}` : toMins;

    return `${toHours}h ${formattedMins}m`;
  };

  if (loadStatus === "loading")
    return (
      <div className="text-center dark:text-white  text-2xl font-bold h-screen w-full flex items-center justify-center">
        <GridLoader size={8} color="#ffffff" />{" "}
        <p className="mx-3">Loading...</p>;
      </div>
    );

  if (!currentMovie)
    return (
      <div className="text-center dark:text-white text-2xl font-bold h-screen w-full flex flex-col items-center justify-center">
        <p className="mx-3">Movie details are unavailable.</p>
        <button
          className="mt-5 text-white capitalize bg-[#8b5cf6] px-5 py-3 rounded-xl text-sm font-medium hover:cursor-pointer duration-300 hover:bg-violet-600"
          onClick={() => navigate("/movies")}
        >
          Back to movies
        </button>
      </div>
    );

  // UI START HERE
  return (
    <section className="mb-20">
      <div
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${currentMovie.backdrop_path})`,
        }}
        className="bg-cover bg-center h-180 md:w-auto w-full flex flex-col items-left justify-normal align-bottom pt-70 px-15 py-8  inset-0 object-cover relative z-10 overflow-hidden"
      >
        {/** overlay */}
        <div className="dark:bg-linear-to-l from-[#08070fb9] border-none via-black/70 to-black/40 absolute inset-0" />
      </div>

      {/* back chevron arrow left */}
      <span
        onClick={redirectToHome}
        role="button"
        class="bx bx-chevron-left dark:text-white/70 text-white text-4xl md:mx-12 mx-3 font-thin bottom-175 z-10 relative  hover:cursor-pointer"
      />

      {/* movie details */}
      <div className="main dark:text-white flex mx-10 items-start space-x-4 absolute-400  rounded-b-2xl border-violet-900/30 dark:shadow-0 shadow-lg border-2   rounded-t-3xl backdrop-blur-2xl p-2 blur-2x top-10 relative mb-10  light:bg-white/30  md:flex-row flex-col ">
        {/* image div */}
        <div className="md:my-0 md:w-90 w-auto md:mx-0 ml-5 my-10">
          <img
            src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
            alt={currentMovie.title || "Poster"}
            className="w-auto rounded-3xl h-110"
          />
        </div>

        {/* content div */}
        <div className="flex flex-col mx-4 justify-start items-start">
          <div>
            <h1 className="md:text-5xl text-center text-3xl font-bold leading-snug md:text-normal text-wrap ">
              {currentMovie.title}
            </h1>
          </div>
          <div className="md:text-xl text-lg md:space-x-8 my-4 space-x-2">
            <span>
              <i className="bxf bx-star align-middle text-violet-500 mx-2" />
              {Number.isFinite(currentMovie.vote_average)
                ? currentMovie.vote_average.toFixed(2)
                : "N/A"}
            </span>
            <span>
              <i className="bx bx-calendar dark:text-white mx-2 align-middle" />
              {getReleaseYear(currentMovie.release_date)}
            </span>
            <span>
              {" "}
              <i className=" mr-2 bx bx-clock dark:text-white  align-middle" />
              {getRuntime(runtime)}
            </span>
          </div>
          <div className="mb-6 md:space-x-4 space-x-2">
            {currentMovie.genres.map((genre) => (
              <span
                key={genre.id}
                className="dark:bg-[#19192d] bg-gray-200/60 px-4 py-2 text-zinc-500 rounded-3xl font-medium capitalize dark:text-zinc-300 hover:text-white hover:bg-[#0f0f1d] transition-all duration-300"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* button */}
          <div className="flex space-x-4 z-1">
            <button className="text-white capitalize bg-[#8b5cf6] md:px-6 px-2 py-3 rounded-xl md:text-lg font-medium hover:cursor-pointer duration-300 hover:bg-violet-600 text-sm pr-4">
              <i className="bxf bx-play align-middle md:text-3xl mx-1" />
              play trailer
            </button>
            <button className="text-white capitalize bg-[#252542] md:px-6 px-2 py-3 rounded-xl md:text-lg text-sm font-medium hover:cursor-pointer pr-4 duration-200 hover:bg-slate-700 z-1">
              <i className="bx bx-heart align-middle md:text-3xl mx-2 " />
              add to library
            </button>
          </div>

          {/* overview desc */}
          <div className="flex flex-col items-start my-10">
            <h2 className="capitalize  text-2xl md:font-bold font-semibold mb-2 ">
              overview
            </h2>
            <div className="md:w-1/2 w-auto">
              <p className="md:text-[18px] text-[16px] font-normal leading-normal">
                {currentMovie.overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* cast and crew */}

      <div className="dark:text-white font-bold text-3xl mt-40 mb-20 mx-25 md:text-left text-center ">
        <p>Top Cast</p>
      </div>
      {showMoreCast ? (
        <div className="dark:text-white flex flex-wrap space-x-3 px-20 md:text-left text-center mx-auto ">
          {movieCredit?.cast?.length > 0 ? (
            movieCredit.cast.slice(11).map((actor) => (
              <div key={actor.id} className="md:mx-3 text-center my-2 mx-4">
                <div>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "https://via.placeholder.com/200x300?text=No+Image"
                    }
                    alt={actor.name}
                    className="md:w-20 h-auto w-20 rounded-full hover:border hover:border-violet-500/70 cursor-pointer duration-300 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-center font-medium my-2">{actor.name}</p>
                  <p className="italic font-normal text-zinc-400 text-[16px]">
                    {actor.character}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="dark:">No cast information available.</p>
          )}
        </div>
      ) : (
        <div className="dark:text-white flex flex-wrap space-x-3 px-20 md:text-left text-center mx-auto ">
          {movieCredit?.cast?.length > 0 ? (
            movieCredit.cast.slice(0, 10).map((actor) => (
              <div key={actor.id} className="md:mx-auto text-center my-2 mx-4">
                <div>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "https://via.placeholder.com/200x300?text=No+Image"
                    }
                    alt={actor.name}
                    className="md:w-20 h-auto w-20 rounded-full hover:border hover:border-violet-500/70 cursor-pointer duration-300 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-center font-medium my-2">{actor.name}</p>
                  <p className="italic font-normal text-zinc-400 text-[16px]">
                    {actor.character}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center flex justify-center">
              {" "}
              <p className="dark:text-white text-center font-semibold">
                No cast information available.
              </p>
            </div>
          )}
        </div>
      )}
      <div className=" text-center mt-12 w-auto mx-auto">
        <button
          className=" dark:text-zinc-400 text-white py-2 px-5 bg-violet-700/50 rounded-lg capitalize font-semibold text-md cursor-pointer hover:bg-violet-900 hover:text-zinc-300 transition-colors"
          onClick={showMore}
        >
          {showMoreCast ? "hide" : "see more"}
        </button>
      </div>
    </section>
  );
}
export default MoviesDetail;
