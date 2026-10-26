import assert from "node:assert/strict";
import test from "node:test";

import { getPayloadArray } from "../src/data/apiPayload.js";

test("getPayloadArray returns the data array from API payloads", () => {
  const rows = [{ id: 1 }, { id: 2 }];

  assert.equal(getPayloadArray({ data: rows }), rows);
});

test("getPayloadArray returns an empty array for malformed payloads", () => {
  assert.deepEqual(getPayloadArray(null), []);
  assert.deepEqual(getPayloadArray(undefined), []);
  assert.deepEqual(getPayloadArray({}), []);
  assert.deepEqual(getPayloadArray({ data: null }), []);
  assert.deepEqual(getPayloadArray({ data: { id: 1 } }), []);
});
