import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getArrayData,
  hasInvalidArrayData,
} from "../src/utils/apiPayload.js";

describe("array API payload helpers", () => {
  it("returns the data array from valid API payloads", () => {
    const items = [{ id: 1 }, { id: 2 }];

    assert.equal(getArrayData({ data: items }), items);
    assert.equal(hasInvalidArrayData({ data: items }), false);
  });

  it("treats the pre-response state as an empty valid list", () => {
    assert.deepEqual(getArrayData(null), []);
    assert.equal(hasInvalidArrayData(null), false);
  });

  it("flags non-array data payloads before components call map", () => {
    const payload = { data: { error: "upstream failure" } };

    assert.deepEqual(getArrayData(payload), []);
    assert.equal(hasInvalidArrayData(payload), true);
  });
});
