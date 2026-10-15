import assert from "node:assert/strict";
import test from "node:test";

import { getDataArray, getErrorMessage } from "./apiResponse.js";

test("getDataArray returns array payloads", () => {
  const payload = [{ id: 1 }];

  assert.equal(getDataArray({ data: payload }), payload);
});

test("getDataArray safely rejects malformed payloads", () => {
  assert.deepEqual(getDataArray(null), []);
  assert.deepEqual(getDataArray({}), []);
  assert.deepEqual(getDataArray({ data: { error: "not found" } }), []);
});

test("getErrorMessage renders thrown errors safely", () => {
  assert.equal(getErrorMessage(new Error("boom")), "boom");
  assert.equal(getErrorMessage("plain failure"), "plain failure");
});
