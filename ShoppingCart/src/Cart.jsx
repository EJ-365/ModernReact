function SideBar({ products, dispatch }) {
  return (
    <aside className="border border-gray-300 w-79 h-auto py-2 px-4 rounded shadow-sm bg-[#F0F1F3]">
      <div className=" p-3">
        <p className="font-bold capitalize text-zinc-800">Shopping cart</p>
        <div className="w-full h-[0.5px] bg-gray-300 mt-2 rounded-sm shadow-2xl" />
      </div>

      {products.length === 0 && (
        <p className="text-center my-30">Cart is Empty</p>
      )}
      {products.map((product, index) => (
        <>
          {/* shopping cart items */}
          <div className="flex flex-col" key={index}>
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
                  ${product.price.toFixed(2)}
                </small>{" "}
              </div>{" "}
              <div>
                {" "}
                <div className="bg-gray-50 pr-2 border-gray-300 shadow-sm border rounded-sm text-center flex items-center justify-center">
                  {" "}
                  <button className="bg-gray-50  px-2 py-0 text-gray-400 font-medium cursor-pointer w-4">
                    {" "}
                    -{" "}
                  </button>{" "}
                  <span className="bg-gray-50  px-2 py-0 rounded-sm text-sm ">
                    1
                  </span>{" "}
                  <button className="bg-gray-50  px-2 py-0 text-gray-400 font-medium cursor-pointer w-4">
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

          <div className="flex-col flex">
            <div className="flex items-center justify-between my-4">
              <div className="font-medium text-gray-500 text-sm">Subtotal</div>
              <small className="font-medium text-gray-700">$56.00</small>
            </div>

            <div className="flex items-center justify-between">
              <div className="font-black  text-zinc-800 text-sm">Total</div>
              <small className="font-black text-slate-950 underline decoration-2 text-sm">
                $56.00
              </small>
            </div>

            <div className="flex items-center justify-center mt-5 text-white ">
              <button className="border px-4 w-full rounded-md bg-black text-xs py-3 cursor-pointer hover:scale-101 duration-300 hover:bg-black/90 transition-all text-zinc-300 ">
                Proceed to Checkout
              </button>
            </div>
            <div className="text-center text-xs font-medium text-zinc-400 mt-3">
              <p>Free shipping on orders over $100</p>
            </div>
          </div>
        </>
      ))}
    </aside>
  );
}
export default SideBar;
