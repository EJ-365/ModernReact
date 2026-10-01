function QuickSummary({usHigh, currentWeekPrice, lastWeek, lowRegion}) {
  return (
    <div className="border border-gray-900/60 rounded-xl xl:ml-10 xl:py-6 px-6 w-full">
      <h3 className="text-xl text-gray-200 font-semibold">Quick summary</h3>
      <small className="text-gray-400 text-[14px]  ">
        The main details without a chart
      </small>
      <div className="xl:grid xl:grid-cols-2 flex flex-col xl:gap-0  xl:mt-6 mt-4  max-w-full w-full ">
        <div className="border border-gray-900/40 p-4 rounded-lg  w-full">
          <small className="text-gray-400 font-bold">This week</small>
          <p className=" xl:text-3xl font-mono my-2">${currentWeekPrice? currentWeekPrice.toFixed(2): "-.--"}</p>
          <p className="text-gray-400 text-sm">National sample average</p>
        </div>

        <div className="border border-gray-900/40 p-4 rounded-lg xl:ml-2 w-full xl:my-1.5 my-1">
          <small className="text-gray-400 font-bold">Last week</small>
          <p className=" xl:text-3xl font-mono my-2">${lastWeek ? lastWeek.toFixed(2) : "-.--"}</p>
          <p className="text-gray-400 text-sm">Previous sample value</p>
        </div>

        <div className="border border-gray-900/40 p-4 rounded-lg  w-full xl:mr-2 xl:my-1.5 my-1">
          <small className="text-gray-400 font-bold">30-day high</small>
          <p className=" xl:text-3xl font-mono my-2">${usHigh ? usHigh.toFixed(2) : "-.--"}</p>
          <p className="text-gray-400 text-sm">Highest sample value</p>
        </div>

        <div className="border border-gray-900/40 p-4 rounded-lg xl:ml-2 w-full ">
          <small className="text-gray-400 font-bold">Lowest region</small>
          <p className=" xl:text-3xl font-mono my-2">${`${lowRegion ? Number(lowRegion.price).toFixed(2) : "-.--"}`}</p>
          <p className="text-gray-400 text-sm">{lowRegion ? lowRegion.coast : "-.--"}</p>
        </div>
      </div>
    </div>
  );
}

export default QuickSummary;
