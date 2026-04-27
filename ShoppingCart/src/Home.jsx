import { useReducer } from "react";
import productsData from "./products";
import Cards from "./Cards";
import SideBar from "./Cart";
import Navbar from "./Navbar";

// product reducer
const productReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM":
      return [...state, action.product];
    case "DELETE_ITEM":
      return state.filter((product) => product.id !== action.id);
    default:
      return state;
  }
};
function Home() {
  const [products, dispatch] = useReducer(productReducer, []);
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
        <SideBar products={products} dispatch={dispatch} />
      </section>
    </main>
  );
}

export default Home;
