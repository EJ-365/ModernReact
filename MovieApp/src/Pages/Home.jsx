import FeaturedMovie from "../Components/FeaturedMovie";
import TrendingMovies from "../Components/TrendingMovies";
import PopularMovies from "../Components/PopularMovies";

export default function Home() {
  return (
    <main>
      <FeaturedMovie />
      <TrendingMovies />
      <PopularMovies />
    </main>
  );
}