import { useReducer } from "react";
import productsData from "./products";
import Cards from "./Cards";
import SideBar from "./Cart";
import Navbar from "./Navbar";

// product reducer
const productReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      const exists = state.find(p => p.id === action.product.id);
      if (exists) {
        return state.map(p =>
          p.id === action.product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...state, { ...action.product, quantity: 1 }];
    case "DELETE_ITEM":
      return state.filter((product) => product.id !== action.id);
      case "INCREMENT_PRICE": 
      return state.map((product) => 
        product.id === action.id ? { ...product, quantity: (product.quantity || 1) + 1 } : product
      )

      case "DECREMENT_PRICE": 
      return state.map((product) => 
        product.id === action.id ? { ...product, quantity: Math.max(1, (product.quantity || 1) - 1) } : product
      )
    default:
      return state;
  }
};
function Home() {
  const [products, dispatch] = useReducer(productReducer, []);
  
  // getting the total price
  const getTotal = () => {
   const totalPrice = products.reduce((total, product) => total + product.price * (product.quantity || 1), 0);
   return totalPrice;
  }
  return (
    <main>
      <Navbar />
      <section className="flex-1 flex justify-center p-10">
        <div>
          <h1 className="uppercase mb-4 ml-4 font-bold">products</h1>

          <div className="max-w-xl   mx-4 flex flex-wrap justify-evenly items-center gap-6 md:grid md:grid-cols-2 mr-10 p-4">
            {/* individual cards component goes here */}
            <Cards productsData={productsData} dispatch={dispatch} />
          </div>
        </div>
        <SideBar products={products} dispatch={dispatch} getTotal={getTotal} />
      </section>
    </main>
  );
}

export default Home;
