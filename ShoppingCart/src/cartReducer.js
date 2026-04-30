export function productReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingProduct = state.find(
        (product) => product.id === action.product.id
      );

      if (existingProduct) {
        return state.map((product) =>
          product.id === action.product.id
            ? { ...product, quantity: (product.quantity || 1) + 1 }
            : product
        );
      }

      return [...state, { ...action.product, quantity: 1 }];
    }
    case "DELETE_ITEM":
      return state.filter((product) => product.id !== action.id);
    case "INCREMENT_PRICE":
      return state.map((product) =>
        product.id === action.id
          ? { ...product, quantity: (product.quantity || 1) + 1 }
          : product
      );
    case "DECREMENT_PRICE":
      return state.map((product) =>
        product.id === action.id
          ? { ...product, quantity: Math.max(1, (product.quantity || 1) - 1) }
          : product
      );
    default:
      return state;
  }
}
