import { useContext } from "react";
// import featuredMovieImage from "../assets/featuredMovieSample.jpg";
import { FeaturedMovieContext } from "../Contexts/featuredMovieContext";
function FeaturedMovie() {
  const { featuredMovie, movieGenres } = useContext(FeaturedMovieContext);

  if (!featuredMovie)
    return <div className="h-[500px] bg-gray-900 animate-pulse rounded-3xl" />;
    // featured movie genre id's 
  const featuredMovieGenresId = featuredMovie.genre_ids.map(featuredMovieGenreId => featuredMovieGenreId); 

const matchedGenres = (movieGenres ?? []).filter(genre => featuredMovieGenresId.includes(genre.id));
  const backgroundUrl = `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`;

  return (
    <section className="container mx-auto text-left md:w-3/4 my-8 relative w-100 bg-[#483784] rounded-3xl  outline-none shadow-2xl   ">
      <div
        style={{ backgroundImage: `url(${backgroundUrl})` }}
        className="bg-cover bg-center h-auto md:w-auto w-full flex flex-col items-left justify-normal align-bottom pt-70 px-15 py-8  inset-0 object-cover relative rounded-3xl shadow-3xl  "
      >
        <div className="bg-linear-to-r from-[#08070f] border-none via-black/70 to-black/40 absolute inset-0 rounded-3xl" />
        {/* genre tags */}
        <div className="md:space-x-2 space-x-4 text-center md:m-0 mx-auto flex z-10 flex-wrap space-y-2">
        {
          matchedGenres.map(genre => (
            <span key={genre.id} className="border border-[#483784] md:px-4 px-3 py-1 bg-violet-950/30 rounded-2xl text-violet-200/80 text-xs font-medium">
            {genre.name}
          </span>
          ))
        }
        </div>

        {/* feature title */}
        <div className="z-10">
          <h2 className="font-bold md:text-[43px] text-3xl text-white ">
            {featuredMovie.title}
          </h2>
        </div>
        {/* featured movie; description */}
        <div className="flex flex-col flex-wrap text-wrap break-all z-10">
          <p className="text-zinc-100/90 my-3 line-clamp-3 overflow-hidden text-wrap flex flex-col">
            {featuredMovie.overview}
          </p>
        </div>

        {/* buttons */}
        <div className="space-x-3 my-5 z-10 text-center md:text-left">
          <button className="border py-2.5 bg-[#8b5cf6] text-white font-semibold rounded-xl px-8 border-none capitalize cursor-pointer hover:scale-104 hover:shadow-lg shadow-purple-400/70 duration-200 transition-all hover:bg-[#734dce] mb-6 md:mb-0">
            <i className="bxf bx-play text-2xl align-middle text-white" />
            Watch now
          </button>
          <button className="border border-gray-200/10 py-2.5 bg-[#1a1a20] text-white/90 font-semibold rounded-xl px-6  capitalize cursor-pointer hover:scale-104 hover:shadow-lg shadow-gray-800 duration-200 transition-all hover:bg-[#131316]">
            <i className=" mr-2 bx bx-alert-octagon text-2xl align-middle" />
            More info
          </button>
        </div>
      </div>
    </section>
  );
}
export default FeaturedMovie;
