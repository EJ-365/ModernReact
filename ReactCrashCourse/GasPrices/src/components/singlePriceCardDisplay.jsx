function SinglePriceCardDisplay() {
  return (
    <div className="border max-w-180 w-120 py-8 px-8 rounded-xl border-gray-900/70 w-full ">
      <div className="mx-4">
        <p className="uppercase text-gray-300 text-sm xl:text-base">regular gasoline</p>
        <h2 className="xl:text-xl font-semibold text-lg">U.S. retail average</h2>
      </div>
      {/*display price */}
      <div className="mx-4 relative">
        <h1 className="xl:text-8xl text-3xl  xl:my-5 mt-2 mb-3 font-mono">
          <span className="font-mono xl:text-3xl text-sm text-yellow-300 absolute xl:-left-5 xl:top-4 -left-4 top-1">$</span>3.42{" "}
          <span className="text-xs font-normal mx-0 text-gray-400">/gal</span>
        </h1>
        <p className="font-mono text-green-200 font-normal xl:mb-30 mb-4 xl:text-base text-sm">
          ↓ $0.06 from last week
        </p>
      </div>

      {/* footer price */}
      <div className="border-t w-full border-slate-800">
        <p className="text-yellow-300  xl:text-2xl text-lg mb-2 mt-5 font-mono">$3.31</p>
        <p className="text-sm mb-4 text-slate-300 font-light">30-day sample low</p>
      </div>
    </div>
  );
}

export default SinglePriceCardDisplay;
