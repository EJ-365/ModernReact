import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  loadDarkModePreference,
  saveDarkModePreference,
} from "./themeStorage.js";

describe("loadDarkModePreference", () => {
  it("returns true for stored dark theme", () => {
    assert.equal(
      loadDarkModePreference(() => "dark", () => false),
      true,
    );
  });

  it("returns false for stored light theme", () => {
    assert.equal(
      loadDarkModePreference(() => "light", () => true),
      false,
    );
  });

  it("falls back to prefers-color-scheme when unset", () => {
    assert.equal(
      loadDarkModePreference(() => null, () => true),
      true,
    );
  });

  it("does not throw when storage access throws (boot crash regression)", () => {
    assert.equal(
      loadDarkModePreference(
        () => {
          throw new Error("SecurityError");
        },
        () => false,
      ),
      false,
    );
  });

  it("does not throw when matchMedia throws after storage failure", () => {
    assert.equal(
      loadDarkModePreference(
        () => {
          throw new Error("SecurityError");
        },
        () => {
          throw new Error("matchMedia unavailable");
        },
      ),
      false,
    );
  });
});

describe("saveDarkModePreference", () => {
  it("writes dark/light values", () => {
    const writes = [];
    saveDarkModePreference(true, (key, value) => writes.push([key, value]));
    saveDarkModePreference(false, (key, value) => writes.push([key, value]));
    assert.deepEqual(writes, [
      ["theme", "dark"],
      ["theme", "light"],
    ]);
  });

  it("does not throw when storage setItem throws", () => {
    assert.doesNotThrow(() =>
      saveDarkModePreference(true, () => {
        throw new Error("QuotaExceededError");
      }),
    );
  });
});
