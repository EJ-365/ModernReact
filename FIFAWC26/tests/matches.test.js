import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getMatchesFromResponse,
  hasInvalidMatchData,
} from "../src/utils/matches.js";

describe("match payload helpers", () => {
  it("returns the API data array when present", () => {
    const matches = [{ num: 1 }, { num: 2 }];

    assert.equal(getMatchesFromResponse({ data: matches }), matches);
    assert.equal(hasInvalidMatchData({ data: matches }), false);
  });

  it("treats missing data before a response as an empty valid list", () => {
    assert.deepEqual(getMatchesFromResponse(null), []);
    assert.equal(hasInvalidMatchData(null), false);
  });

  it("flags non-array data payloads so components do not call map on them", () => {
    const payload = { data: { error: "upstream failure" } };

    assert.deepEqual(getMatchesFromResponse(payload), []);
    assert.equal(hasInvalidMatchData(payload), true);
  });
});
