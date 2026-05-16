import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FeaturedMovieContext } from "../Contexts/featuredMovieContext";
import { API_KEY } from "../api/tmdb";
function CardDetails() {
  const { topFiveTrending, topFivePopular } = useContext(FeaturedMovieContext);
  const { cardId } = useParams();
  const navigate = useNavigate();
  const currentMovie =
    topFiveTrending?.find((movie) => movie.id === Number(cardId)) ||
    topFivePopular?.find((movie) => movie.id === Number(cardId));
  const [runtime, setRuntime] = useState();
  const [movieCredit, setMovieCredit] = useState(null);

  useEffect(() => {
    if (!currentMovie?.id) return;
    fetch(
      `https://api.themoviedb.org/3/movie/${currentMovie.id}?api_key=${API_KEY}`,
    )
      .then((res) => res.json())
      .then((data) => setRuntime(data.runtime))
      .catch((err) => console.log("Error while fetching the data", err));
  }, [currentMovie?.id]);

  // useEffect for the movie credits

  useEffect(() => {
    if (!currentMovie?.id) return;
    fetch(
      `https://api.themoviedb.org/3/movie/${currentMovie.id}/credits?api_key=${API_KEY}`,
    )
      .then((res) => res.json())
      .then((data) => setMovieCredit(data))
      .catch((err) => console.log("Error while fetching the data", err));
  }, [currentMovie?.id]);

  if (!currentMovie) return <p>Loading...</p>;

  // redirecting to home chevron icon
  const redirectToHome = () => {
    navigate("/home");
  };

  const getReleaseYear = (releaseYear) => {
    const date = new Date(releaseYear);
    return date.getFullYear();
  };

  // runtime conversion to hours

  const getRuntime = (runtime) => {
    const toHours = Math.floor(runtime / 60);
    const toMins = runtime % 60;

    const formattedMins = toMins <= 9 ? `0${toMins}` : toMins;

    return `${toHours}h ${formattedMins}m`;
  };

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
              {`${currentMovie.vote_average.toFixed(2)}`}
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
            <span className="dark:bg-[#19192d] bg-gray-200/60 px-4 py-2 text-zinc-500 rounded-3xl font-medium capitalize dark:text-zinc-300 hover:text-white hover:bg-[#0f0f1d] transition-all duration-300">
              action
            </span>
            <span className="dark:bg-[#19192d] bg-gray-200/60 px-4 py-2 text-zinc-500 rounded-3xl font-medium capitalize dark:text-zinc-300 hover:text-white hover:bg-[#0f0f1d] transition-all duration-300">
              crime
            </span>
            <span className="dark:bg-[#19192d] bg-gray-200/60 px-4 py-2 text-zinc-500 rounded-3xl font-medium capitalize dark:text-zinc-300 hover:text-white hover:bg-[#0f0f1d] transition-all duration-300">
              comedy
            </span>
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
      <div className="dark:text-white flex flex-wrap space-x-4 px-20">
        {movieCredit?.cast?.length > 0 ? (
          movieCredit.cast.map((actor) => (
            <div key={actor.id} className="mx-6 text-center my-2" >
              <div>
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                      : "https://via.placeholder.com/200x300?text=No+Image"
                  }
                  alt={actor.name}
                  className="md:w-30 w-20 rounded-full hover:border hover:border-violet-500 cursor-pointer duration-300 transition-colors"
                />
              </div>
              <div>
              <p className="text-center font-medium my-2">{actor.name}</p>
              <p className="italic font-normal text-zinc-400 text-[16px]">{actor.character}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No cast information available.</p>
        )}
      </div>
    </section>
  );
}
export default CardDetails;
