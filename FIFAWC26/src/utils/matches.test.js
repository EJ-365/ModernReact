import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatMatchScore, selectUpcomingMatches } from "./matches.js";

describe("selectUpcomingMatches", () => {
  it("returns an empty list for malformed API payloads", () => {
    assert.deepEqual(selectUpcomingMatches({ error: "bad gateway" }), []);
    assert.deepEqual(selectUpcomingMatches({ data: null }), []);
  });

  it("filters finished matches and keeps the next fixtures in kickoff order", () => {
    const payload = {
      data: [
        {
          num: 1,
          datetime_utc: "2026-06-11T19:00:00Z",
          status: "FINISHED",
        },
        {
          num: 51,
          datetime_utc: "2026-06-24T22:00:00Z",
        },
        {
          num: 49,
          datetime_utc: "2026-06-24T19:00:00Z",
        },
        {
          num: 50,
          datetime_utc: "2026-06-24T19:00:00Z",
        },
      ],
    };

    assert.deepEqual(
      selectUpcomingMatches(payload, 2).map((match) => match.num),
      [49, 50],
    );
  });
});

describe("formatMatchScore", () => {
  it("uses kickoff time while upcoming matches do not have scores", () => {
    assert.equal(formatMatchScore({ time_utc: "19:00" }), "19:00 UTC");
  });

  it("keeps scores for completed matches", () => {
    assert.equal(formatMatchScore({ score_home: 2, score_away: 1 }), "2:1");
  });
});
