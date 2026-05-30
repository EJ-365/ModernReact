export function isValidMovieDetail(movie) {
  return (
    movie &&
    typeof movie.id === "number" &&
    typeof movie.vote_average === "number" &&
    Array.isArray(movie.genres)
  );
}

export function isValidShowDetail(show) {
  return (
    show &&
    typeof show.id === "number" &&
    typeof show.vote_average === "number" &&
    Array.isArray(show.genres)
  );
}

export function getMovieDetailGenres(movie, movieGenres = []) {
  if (Array.isArray(movie?.genres)) return movie.genres;
  if (!Array.isArray(movie?.genre_ids)) return [];

  return movieGenres.filter((genre) => movie.genre_ids.includes(genre.id));
}
