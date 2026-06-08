import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  getLibraryItems,
  isLibraryItemSaved,
  removeLibraryItem,
  saveLibraryItem,
} from "./libraryStorage.js";

const LIBRARY_KEY = "movieAppLibrary";

function mockLocalStorage(initialValue = null) {
  const store = new Map();

  if (initialValue !== null) {
    store.set(LIBRARY_KEY, initialValue);
  }

  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

describe("libraryStorage", () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  it("returns saved library arrays", () => {
    const items = [{ id: 1, mediaType: "movie", title: "Saved Movie" }];
    mockLocalStorage(JSON.stringify(items));

    assert.deepEqual(getLibraryItems(), items);
  });

  it("treats invalid or wrong-shaped persisted data as an empty library", () => {
    for (const savedValue of ["not json", "{}", '"movie"', "12", "null"]) {
      mockLocalStorage(savedValue);

      assert.deepEqual(getLibraryItems(), []);
      assert.equal(isLibraryItemSaved(1, "movie"), false);
    }
  });

  it("can save and remove items after wrong-shaped persisted data", () => {
    mockLocalStorage("{}");

    const item = { id: 1, mediaType: "movie", title: "Saved Movie" };
    assert.deepEqual(saveLibraryItem(item), [item]);
    assert.equal(isLibraryItemSaved(1, "movie"), true);
    assert.deepEqual(removeLibraryItem(1, "movie"), []);
  });
});
