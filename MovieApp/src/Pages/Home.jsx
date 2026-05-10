import FeaturedMovie from "../Components/FeaturedMovie";
import TrendingMovies from "../Components/TrendingMovies";

export default function Home() {
  return (
    <main>
      <FeaturedMovie />
      <TrendingMovies/>
    </main>
  );
}