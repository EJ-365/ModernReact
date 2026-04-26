import productsData from "./products.js";
export default function Cards() {
  return (
    <>
      {productsData.map((product) => (
        <div className="gap-0 border border-gray-200 bg-gray-50/90 p-4 rounded-md shadow-sm">
          <div className="my-4">
            <img src={product.image} className="md:w-65 w-auto drop-shadow-sm" />
          </div>
          <h3 className="font-bold">{product.name}</h3>
          <small className="font-semibold text-gray-500">
            ${product.price.toFixed(2)}
          </small>
          <div className="flex items-center justify-center my-3 text-white">
            <button className="border px-4 w-full rounded-md bg-black text-xs py-1.5 cursor-pointer hover:scale-101 duration-300 hover:bg-black/90 transition-all text-zinc-300">
              Add to cart
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
