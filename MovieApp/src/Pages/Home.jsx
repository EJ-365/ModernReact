import FeaturedMovie from "../Components/FeaturedMovie";
import TrendingMovies from "../Components/TrendingMovies";
import PopularMovies from "../Components/PopularMovies";
import TrendingShows from "../Components/TrendingShows";

export default function Home() {
  return (
    <main>
      <FeaturedMovie />
      <TrendingMovies />
      <PopularMovies />
      <TrendingShows />
    </main>
  );
}