export function isMovieDetailResponse(data) {
  return (
    data != null &&
    typeof data.id === "number" &&
    typeof data.title === "string" &&
    typeof data.vote_average === "number" &&
    Array.isArray(data.genres)
  );
}

export function isShowDetailResponse(data) {
  return (
    data != null &&
    typeof data.id === "number" &&
    typeof data.name === "string" &&
    typeof data.vote_average === "number" &&
    Array.isArray(data.genres)
  );
}
