import { useState, useEffect } from "react";
export function useMovies(url) {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch((err) => console.log("Error fetching movies:", err));
  }, [url]);
  return movies;
}
