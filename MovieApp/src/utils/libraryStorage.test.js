import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  getLibraryItems,
  isLibraryItemSaved,
  removeLibraryItem,
  saveLibraryItem,
} from "./libraryStorage.js";

class MemoryStorage {
  #items = new Map();

  getItem(key) {
    return this.#items.has(key) ? this.#items.get(key) : null;
  }

  setItem(key, value) {
    this.#items.set(key, String(value));
  }
}

const LIBRARY_KEY = "movieAppLibrary";

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
});

describe("libraryStorage", () => {
  it("returns an empty library for malformed stored JSON", () => {
    localStorage.setItem(LIBRARY_KEY, "{");

    assert.deepEqual(getLibraryItems(), []);
  });

  it("returns an empty library for non-array stored JSON", () => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify({ id: 1 }));

    assert.deepEqual(getLibraryItems(), []);
  });

  it("normalizes stored library entries before callers render them", () => {
    localStorage.setItem(
      LIBRARY_KEY,
      JSON.stringify([
        null,
        { id: 1, mediaType: "movie", title: "Dune", voteAverage: "8.3" },
        { id: 2, mediaType: "show", title: "Andor", voteAverage: 8.4 },
        { id: 3, mediaType: "album", title: "Wrong type" },
      ]),
    );

    assert.deepEqual(getLibraryItems(), [
      {
        id: 1,
        mediaType: "movie",
        title: "Dune",
        poster_path: "",
        voteAverage: undefined,
        releaseDate: "",
      },
      {
        id: 2,
        mediaType: "show",
        title: "Andor",
        poster_path: "",
        voteAverage: 8.4,
        releaseDate: "",
      },
    ]);
    assert.equal(isLibraryItemSaved(1, "movie"), true);
  });

  it("deduplicates saves and removes items from the normalized library", () => {
    const movie = {
      id: 1,
      mediaType: "movie",
      title: "Dune",
      poster_path: "/poster.jpg",
      voteAverage: 8.3,
      releaseDate: "2021-10-22",
    };

    saveLibraryItem(movie);
    saveLibraryItem(movie);

    assert.deepEqual(getLibraryItems(), [movie]);
    assert.deepEqual(removeLibraryItem(1, "movie"), []);
  });
});
