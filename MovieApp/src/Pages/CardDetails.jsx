import { useContext } from "react";
import { useParams } from "react-router-dom";
import { FeaturedMovieContext } from "../Contexts/featuredMovieContext";

function CardDetails() {
  const { topFiveTrending = [] } = useContext(FeaturedMovieContext) ?? {};
  const { cardId } = useParams();
  const currentTopFiveTrending = topFiveTrending.find(
    (movie) => movie.id === Number(cardId),
  );

  if (!currentTopFiveTrending) {
    const message = topFiveTrending.length
      ? "Movie not found."
      : "Loading movie details...";

    return (
      <section className="container mx-auto text-center dark:text-white">
        <p className="my-20 text-lg font-medium">{message}</p>
      </section>
    );
  }

  // UI START HERE
  return (
    <section>
      <div
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${currentTopFiveTrending.backdrop_path})`,
        }}
        className="bg-cover bg-center h-auto md:w-auto w-full flex flex-col items-left justify-normal align-bottom pt-70 px-15 py-8  inset-0 object-cover relative rounded-3xl shadow-3xl  "
      ></div>
      <div className="bg-linear-to-r from-[#08070f] border-none via-black/70 to-black/40 absolute inset-0 rounded-3xl" />
    </section>
  );
}
export default CardDetails;
