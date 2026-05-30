import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getMovieDetailGenres,
  isValidMovieDetail,
  isValidShowDetail,
} from "./tmdbDetails.js";

describe("TMDB detail helpers", () => {
  it("rejects TMDB error payloads as movie details", () => {
    assert.equal(
      isValidMovieDetail({
        success: false,
        status_code: 34,
        status_message: "The resource you requested could not be found.",
      }),
      false,
    );
  });

  it("rejects TMDB error payloads as show details", () => {
    assert.equal(
      isValidShowDetail({
        success: false,
        status_code: 34,
        status_message: "The resource you requested could not be found.",
      }),
      false,
    );
  });

  it("accepts detail payloads with the fields the detail pages render", () => {
    assert.equal(
      isValidMovieDetail({ id: 550, vote_average: 8.4, genres: [] }),
      true,
    );
    assert.equal(
      isValidShowDetail({ id: 1396, vote_average: 8.9, genres: [] }),
      true,
    );
  });

  it("uses detail genres when available and maps list genres otherwise", () => {
    const genres = [
      { id: 18, name: "Drama" },
      { id: 35, name: "Comedy" },
    ];

    assert.deepEqual(
      getMovieDetailGenres({ genres: [{ id: 99, name: "Documentary" }] }),
      [{ id: 99, name: "Documentary" }],
    );
    assert.deepEqual(getMovieDetailGenres({ genre_ids: [35] }, genres), [
      { id: 35, name: "Comedy" },
    ]);
  });
});
