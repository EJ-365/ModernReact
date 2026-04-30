import assert from "node:assert/strict";
import test from "node:test";

import { productReducer } from "./cartReducer.js";

const toteBag = {
  id: "tote-bag",
  title: "Canvas Tote Bag",
  price: 24,
  quantity: 1,
};

test("adding the same product increments quantity instead of duplicating rows", () => {
  const withOneItem = productReducer([], {
    type: "ADD_ITEM",
    product: toteBag,
  });

  const withTwoItems = productReducer(withOneItem, {
    type: "ADD_ITEM",
    product: toteBag,
  });

  assert.equal(withTwoItems.length, 1);
  assert.equal(withTwoItems[0].quantity, 2);
});

test("quantity actions update only the matching cart item", () => {
  const watch = {
    id: "watch",
    title: "Minimalist Watch",
    price: 120,
    quantity: 1,
  };
  const cart = [toteBag, watch];

  const incremented = productReducer(cart, {
    type: "INCREMENT_PRICE",
    id: "tote-bag",
  });

  assert.deepEqual(
    incremented.map(({ id, quantity }) => ({ id, quantity })),
    [
      { id: "tote-bag", quantity: 2 },
      { id: "watch", quantity: 1 },
    ]
  );

  const decremented = productReducer(incremented, {
    type: "DECREMENT_PRICE",
    id: "tote-bag",
  });

  assert.equal(decremented[0].quantity, 1);
  assert.equal(decremented[1].quantity, 1);
});
