import { useContext } from "react";
import { CartContext } from "./CartContext";
function SideBar() {
  const {products, dispatch, getTotal} = useContext(CartContext);
  return (
    <aside
      className={`border border-gray-300 w-79 py-2 px-4 rounded shadow-sm bg-[#F0F1F3] ${products.length >= 4 ? "h-160" : products.length === 3 ? "h-140" : "h-109"}`}
    >
      <div className=" p-3">
        <p className="font-bold capitalize text-zinc-800">Shopping cart</p>
        <div className="w-full h-[0.5px] bg-gray-300 mt-2 rounded-sm shadow-2xl" />
      </div>

      {products.length === 0 && (
        <p className="text-center my-30">Cart is Empty</p>
      )}
      {products.map((product) => (
        <>
          {/* shopping cart items */}
          <div className="flex flex-col" key={product.id}>
            {/* shopping cart items */}{" "}
            <div className="flex items-center justify-evenly w-full mt-4">
              {" "}
              {/* item 2 */}{" "}
              <div className="">
                {" "}
                <img
                  src={product.image}
                  alt=""
                  className="w-13 rounded-lg border border-gray-200 "
                />{" "}
              </div>{" "}
              <div className="px-5">
                {" "}
                <h3 className="font-medium text-zinc-600 capitalize whitespace-nowrap">
                  {" "}
                  {product.title}
                </h3>{" "}
                <small className="text-gray-500 font-medium my-0">
                  ${(product.price * product.quantity || 1).toFixed(2)}
                </small>{" "}
              </div>{" "}
              <div>
                {" "}
                <div className="bg-gray-50 pr-2 border-gray-300 shadow-sm border rounded-sm text-center flex items-center justify-center">
                  {" "}
                  <button
                    onClick={() =>
                      dispatch({ type: "DECREMENT_PRICE", id: product.id })
                    }
                    className="bg-gray-50  px-2 py-0 text-gray-400 font-medium cursor-pointer w-4"
                  >
                    {" "}
                    -{" "}
                  </button>{" "}
                  <span className="bg-gray-50  px-2 py-0 rounded-sm text-sm ">
                    {product.quantity}
                  </span>{" "}
                  <button
                    onClick={() =>
                      dispatch({ type: "INCREMENT_PRICE", id: product.id })
                    }
                    className="bg-gray-50  px-2 py-0 text-gray-400 font-medium cursor-pointer w-4"
                  >
                    {" "}
                    +{" "}
                  </button>{" "}
                </div>{" "}
                <p
                  onClick={() =>
                    dispatch({ type: "DELETE_ITEM", id: product.id })
                  }
                  className="capitalize cursor-pointer font-medium text-red-700 text-sm my-2 whitespace-nowrap"
                >
                  {" "}
                  <i className="bx bx-trash text-red-700 align-middle mr-1" />{" "}
                  remove{" "}
                </p>{" "}
              </div>{" "}
            </div>
          </div>

          <div className="w-full h-[0.5px] bg-gray-300 mt-2 rounded-sm shadow-2xl" />
        </>
      ))}
      {products.length >= 1 && (
        <section className="my-4">
          <div className="flex items-center space-x-8 justify-between">
            <span className="font-medium text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-500">${getTotal()}</span>
          </div>

          <div className="flex items-center space-x-8 justify-between ">
            <span className="font-bold text-xl">Total</span>
            <div className="my-0 relative ">
              <span className="font-bold text-xl">${getTotal()}</span>
              <div className="w-full h-[2px] bg-black absolute top-5  mt-2 rounded-sm shadow-2xl" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <button className="border py-3 px-4 w-full rounded-md bg-black text-sm  cursor-pointer hover:scale-101 duration-300 hover:bg-black/90 transition-all text-zinc-300">
              Proceed to Checkout
            </button>
            <p className="text-sm text-zinc-500 my-2 font-medium">
              Free shipping on orders over $100
            </p>
          </div>
        </section>
      )}
    </aside>
  );
}
export default SideBar;
