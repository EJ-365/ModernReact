export default function Region() {
  return (
    <div className="border py-6 mt-20 border-gray-900">
      {/* heading */}
      <div className="flex items-center justify-evenly">
        <div>
          <h3 className="text-xl font-semibold">Regular by region</h3>
          <small className="text-gray-400">
            Simple cards instead of a chart
          </small>
        </div>

        <small className="text-gray-400 text-sm">
          U.S. sample:{" "}
          <span className="font-semibold text-gray-200 mx-1"> $3.43</span>
        </small>
      </div>

      {/*individual cards */}

      <div className="base mt-6 grid grid-cols-5 items-center">
        <div className="border-r p-4 w-64 border-gray-900">
          <small className="text-gray-400 font-medium block mb-3">East Coast</small>
          <p className="text-2xl font-medium">$3.34</p>
          <input
            type="range"
            className="w-30 h-1.5 bg-orange-400 rounded-lg appearance-none cursor-default
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-0
    [&::-webkit-slider-thumb]:h-0
    [&::-moz-range-thumb]:w-0
    [&::-moz-range-thumb]:h-0"
          />
          <small className="block text-gray-300">-$0.08 vs U.S</small>
        </div>



         <div className="border-r p-4 w-64 border-gray-900">
          <small className="text-gray-400 font-medium block mb-3">East Coast</small>
          <p className="text-2xl font-medium">$3.34</p>
          <input
            type="range"
            className="w-30 h-1.5 bg-orange-400 rounded-lg appearance-none cursor-default
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-0
    [&::-webkit-slider-thumb]:h-0
    [&::-moz-range-thumb]:w-0
    [&::-moz-range-thumb]:h-0"
          />
          <small className="block text-gray-300">-$0.08 vs U.S</small>
        </div>


         <div className="border-r p-4 w-64 border-gray-900">
          <small className="text-gray-400 font-medium block mb-3">East Coast</small>
          <p className="text-2xl font-medium">$3.34</p>
          <input
            type="range"
            className="w-30 h-1.5 bg-orange-400 rounded-lg appearance-none cursor-default
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-0
    [&::-webkit-slider-thumb]:h-0
    [&::-moz-range-thumb]:w-0
    [&::-moz-range-thumb]:h-0"
          />
          <small className="block text-gray-300">-$0.08 vs U.S</small>
        </div>


         <div className="border-r p-4 w-64 border-gray-900">
          <small className="text-gray-400 font-medium block mb-3">East Coast</small>
          <p className="text-2xl font-medium">$3.34</p>
          <input
            type="range"
            className="w-30 h-1.5 bg-orange-400 rounded-lg appearance-none cursor-default
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-0
    [&::-webkit-slider-thumb]:h-0
    [&::-moz-range-thumb]:w-0
    [&::-moz-range-thumb]:h-0"
          />
          <small className="block text-gray-300">-$0.08 vs U.S</small>
        </div>


         <div className="border-r p-4 w-64 border-gray-900">
          <small className="text-gray-400 font-medium block mb-3">East Coast</small>
          <p className="text-2xl font-medium">$3.34</p>
          <input
            type="range"
            className="w-30 h-1.5 bg-orange-400 rounded-lg appearance-none cursor-default
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-0
    [&::-webkit-slider-thumb]:h-0
    [&::-moz-range-thumb]:w-0
    [&::-moz-range-thumb]:h-0"
          />
          <small className="block text-gray-300">-$0.08 vs U.S</small>
        </div>
      </div>
    </div>
  );
}
