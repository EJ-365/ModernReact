import assert from "node:assert/strict";
import test from "node:test";
import {
  isMovieDetailResponse,
  isShowDetailResponse,
} from "./tmdbDetail.js";

test("rejects TMDB error payloads for detail responses", () => {
  const errorPayload = {
    success: false,
    status_code: 34,
    status_message: "The resource you requested could not be found.",
  };

  assert.equal(isMovieDetailResponse(errorPayload), false);
  assert.equal(isShowDetailResponse(errorPayload), false);
});

test("accepts render-safe movie detail responses", () => {
  assert.equal(
    isMovieDetailResponse({
      id: 11,
      title: "Star Wars",
      vote_average: 8.2,
      genres: [{ id: 12, name: "Adventure" }],
    }),
    true,
  );
});

test("accepts render-safe TV show detail responses", () => {
  assert.equal(
    isShowDetailResponse({
      id: 1399,
      name: "Game of Thrones",
      vote_average: 8.5,
      genres: [{ id: 18, name: "Drama" }],
    }),
    true,
  );
});

test("rejects payloads missing fields used during render", () => {
  assert.equal(
    isMovieDetailResponse({
      id: 11,
      title: "Star Wars",
      genres: [],
    }),
    false,
  );

  assert.equal(
    isShowDetailResponse({
      id: 1399,
      name: "Game of Thrones",
      vote_average: 8.5,
    }),
    false,
  );
});
