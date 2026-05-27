import { GridLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_KEY } from "../api/tmdb";
import {
  isLibraryItemSaved,
  removeLibraryItem,
  saveLibraryItem,
} from "../utils/libraryStorage";

function ShowDetail() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [runtime, setRuntime] = useState();
  const [showCredit, setShowCredit] = useState(null);
  const [showMoreCast, setShowMoreCast] = useState(false);
  const [currentShow, setCurrentShow] = useState(null);
  const [showError, setShowError] = useState(false);
  const [, setLibraryVersion] = useState(0);

  // show more cast function
  function showMore() {
    setShowMoreCast((prev) => !prev);
  }

  // fetches a specific TV show object
  useEffect(() => {
    const controller = new AbortController();

    setCurrentShow(null);
    setShowCredit(null);
    setRuntime(undefined);
    setShowMoreCast(false);
    setShowError(false);

    async function fetchShow() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${showId}?api_key=${API_KEY}`,
          { signal: controller.signal },
        );
        const data = await res.json();

        if (!res.ok || !data?.id) {
          throw new Error(data?.status_message || "TV show not found");
        }

        setCurrentShow(data);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.log("Error fetching data", err);
        setShowError(true);
      }
    }

    fetchShow();

    return () => controller.abort();
  }, [showId]);

  useEffect(() => {
    if (!currentShow?.id) return;
    fetch(
      `https://api.themoviedb.org/3/tv/${currentShow.id}?api_key=${API_KEY}`,
    )
      .then((res) => res.json())
      .then((data) => setRuntime(data.episode_run_time?.[0]))
      .catch((err) => console.log("Error while fetching the data", err));
  }, [currentShow?.id]);

  // useEffect for the TV show credits
  useEffect(() => {
    if (!currentShow?.id) return;
    fetch(
      `https://api.themoviedb.org/3/tv/${currentShow.id}/credits?api_key=${API_KEY}`,
    )
      .then((res) => res.json())
      .then((data) => setShowCredit(data))
      .catch((err) => console.log("Error while fetching the data", err));
  }, [currentShow?.id]);

  if (showError)
    return (
      <section className="dark:text-white text-center h-screen w-full flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold mb-4">TV show not found</h1>
        <p className="text-zinc-400 mb-8">
          We could not load details for this show.
        </p>
        <button
          onClick={redirectToShows}
          className="text-white capitalize bg-[#8b5cf6] px-6 py-3 rounded-xl font-medium hover:cursor-pointer duration-300 hover:bg-violet-600"
        >
          Back to shows
        </button>
      </section>
    );

  if (!currentShow)
    return (
      <div className="text-center dark:text-white  text-2xl font-bold h-screen w-full flex items-center justify-center">
        <GridLoader size={8} color="#ffffff" />{" "}
        <p className="mx-3">Loading...</p>
      </div>
    );

  const isSaved = isLibraryItemSaved(currentShow.id, "show");
  const showGenres = Array.isArray(currentShow.genres) ? currentShow.genres : [];
  const voteAverage =
    typeof currentShow.vote_average === "number"
      ? currentShow.vote_average.toFixed(2)
      : "N/A";

  // redirecting to shows page chevron icon
  function redirectToShows() {
    navigate("/shows");
  }

  function toggleLibraryItem() {
    if (isSaved) {
      removeLibraryItem(currentShow.id, "show");
      setLibraryVersion((prev) => prev + 1);
      return;
    }

    saveLibraryItem({
      id: currentShow.id,
      mediaType: "show",
      title: currentShow.name,
      poster_path: currentShow.poster_path,
      voteAverage: currentShow.vote_average,
      releaseDate: currentShow.first_air_date,
    });
    setLibraryVersion((prev) => prev + 1);
  }

  const getReleaseYear = (releaseYear) => {
    const date = new Date(releaseYear);
    return date.getFullYear();
  };

  // runtime conversion to hours
  const getRuntime = (runtime) => {
    if (!runtime) return "N/A";

    const toHours = Math.floor(runtime / 60);
    const toMins = runtime % 60;

    const formattedMins = toMins <= 9 ? `0${toMins}` : toMins;

    return `${toHours}h ${formattedMins}m`;
  };

  // UI START HERE
  return (
    <section className="mb-20 relative">
      <div
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${currentShow.backdrop_path})`,
        }}
        className="bg-cover bg-center h-100 md:w-auto w-full flex flex-col items-left justify-normal align-bottom pt-70 px-15 py-8  inset-0 object-cover relative z-10 overflow-hidden"
      >
        {/** overlay */}
        <div className="dark:bg-linear-to-l from-[#08070fb9] border-none via-black/70 to-black/40 absolute inset-0" />
      </div>

      {/* back chevron arrow left */}
      <span
        onClick={redirectToShows}
        role="button"
        className="bx bx-chevron-left dark:text-white/70 text-white text-4xl font-thin top-4 left-4 md:left-12 z-20 absolute hover:cursor-pointer"
      />

      {/* TV show details */}
      <div className="main dark:text-white flex mx-4 md:mx-20 items-center md:items-start space-x-0 md:space-x-4 absolute-400  rounded-b-2xl border-violet-900/30 dark:shadow-0 shadow-lg border-2   rounded-t-3xl backdrop-blur-2xl blur-2x top-10 relative mb-10  light:bg-white/30  md:flex-row flex-col p-4 md:p-10  ">
        {/* image div */}
        <div className="md:my-0 md:w-240 w-full max-w-64 md:max-w-none md:mx-0 mx-auto my-6 text-center">
          <img
            src={`https://image.tmdb.org/t/p/w500${currentShow.poster_path}`}
            alt={currentShow.name || "Poster"}
            className="w-full md:w-auto rounded-3xl h-auto md:h-128 align-middle"
          />
        </div>

        {/* content div */}
        <div className="flex flex-col mx-0 md:mx-18 justify-start items-center md:items-start w-full md:w-auto">
          <div>
            <h1 className="md:text-5xl text-center text-3xl font-bold leading-snug md:text-normal text-wrap ">
              {currentShow.name}
            </h1>
          </div>
          <div className="md:text-xl text-lg my-4 flex flex-wrap justify-center gap-x-4 gap-y-2 md:block md:space-x-8">
            <span>
              <i className="bxf bx-star align-middle text-violet-500 mx-2" />
              {voteAverage}
            </span>
            <span>
              <i className="bx bx-calendar dark:text-white mx-2 align-middle" />
              {getReleaseYear(currentShow.first_air_date)}
            </span>
            <span>
              {" "}
              <i className=" mr-2 bx bx-clock dark:text-white  align-middle" />
              {getRuntime(runtime)}
            </span>
          </div>
          <div className="mb-6 flex flex-wrap justify-center gap-2 md:block md:space-x-4">
            {showGenres.map((genre) => (
              <span
                key={genre.id}
                className="dark:bg-[#19192d] bg-gray-200/60 px-4 py-2 text-zinc-500 rounded-3xl font-medium capitalize dark:text-zinc-300 hover:text-white hover:bg-[#0f0f1d] transition-all duration-300"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* button */}
          <div className="flex flex-wrap justify-center gap-3 z-1 md:space-x-4 md:gap-0">
            <button className="text-white capitalize bg-[#8b5cf6] md:px-6 px-2 py-3 rounded-xl md:text-lg font-medium hover:cursor-pointer duration-300 hover:bg-violet-600 text-sm pr-4">
              <i className="bxf bx-play align-middle md:text-3xl mx-1" />
              play trailer
            </button>
            <button
              onClick={toggleLibraryItem}
              className="text-white capitalize bg-[#252542] md:px-6 px-2 py-3 rounded-xl md:text-lg text-sm font-medium hover:cursor-pointer pr-4 duration-200 hover:bg-slate-700 z-1"
            >
              <i className="bx bx-heart align-middle md:text-3xl mx-2 " />
              {isSaved ? "remove from library" : "add to library"}
            </button>
          </div>

          {/* overview desc */}
          <div className="flex flex-col items-center md:items-start my-10 w-full">
            <h2 className="capitalize  text-2xl md:font-bold font-semibold mb-2 ">
              overview
            </h2>
            <div className="md:w-3/4 w-full">
              <p className="md:text-[18px] text-[16px] font-normal leading-normal text-center md:text-left">
                {currentShow.overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* cast and crew */}
      <div className="dark:text-white font-bold text-3xl mt-40 mb-20 mx-4 md:mx-25 md:text-left text-center ">
        <p>Top Cast</p>
      </div>
      {showMoreCast ? (
        <div className="dark:text-white grid grid-cols-2 gap-x-4 gap-y-6 px-4 md:flex md:flex-wrap md:justify-start md:gap-0 md:space-x-3 md:px-20 md:text-left text-center mx-auto ">
          {showCredit?.cast?.length > 0 ? (
            showCredit.cast.slice(11).map((actor) => (
              <div
                key={actor.id}
                className="w-full max-w-32 mx-auto md:max-w-none md:w-auto md:mx-3 text-center my-2"
              >
                <div>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "https://via.placeholder.com/200x300?text=No+Image"
                    }
                    alt={actor.name}
                    className="md:w-20 h-auto w-20 mx-auto rounded-full hover:border hover:border-violet-500/70 cursor-pointer duration-300 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-center font-medium my-2 text-sm md:text-base wrap-break-word">
                    {actor.name}
                  </p>
                  <p className="italic font-normal text-zinc-400 text-sm md:text-[16px] wrap-break-word">
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
        <div className="dark:text-white grid grid-cols-2 gap-x-4 gap-y-6 px-4 md:flex md:flex-wrap md:justify-start md:gap-0 md:space-x-3 md:px-20 md:text-left text-center mx-auto ">
          {showCredit?.cast?.length > 0 ? (
            showCredit.cast.slice(0, 10).map((actor) => (
              <div
                key={actor.id}
                className="w-full max-w-32 mx-auto md:max-w-none md:w-auto md:mx-auto text-center my-2"
              >
                <div>
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : "https://via.placeholder.com/200x300?text=No+Image"
                    }
                    alt={actor.name}
                    className="md:w-20 h-auto w-20 mx-auto rounded-full hover:border hover:border-violet-500/70 cursor-pointer duration-300 transition-colors"
                  />
                </div>
                <div>
                  <p className="text-center font-medium my-2 text-sm md:text-base wrap-break-word">
                    {actor.name}
                  </p>
                  <p className="italic font-normal text-zinc-400 text-sm md:text-[16px] wrap-break-word">
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

export default ShowDetail;
