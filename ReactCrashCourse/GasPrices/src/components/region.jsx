export default function Region({ fuelType = "regular", lowRegion, usPrice }) {
  return (
    <div className="border py-6 mt-20 border-gray-900 px-10">
      {/* heading */}
      <div className="flex xl:flex-row flex-col xl:items-center xl:justify-evenly justify-start xl:mb-15 mb-8">
        <div>
          <h3 className="xl:text-xl text-lg font-semibold capitalize">
            {fuelType} by region
          </h3>
          <small className="text-gray-400">
           Compare regional prices
          </small>
        </div>

        <small className="text-gray-400 text-sm">
          National Weekly Average.:{" "}
          <span className="font-semibold text-gray-200 mx-1">
            {" "}
            ${`${usPrice ? usPrice.toFixed(2) : ".--"}`}
          </span>
        </small>
      </div>

      {/*individual cards */}

      <div className="base mt-6 grid xl:grid-cols-5 grid-cols-1 items-center">
        {lowRegion.regions.map((item, index) => (
          <div
            key={index}
            className="border-r p-4  xl:w-64 w-full border-gray-900"
          >
            <small className="text-gray-400 font-medium block mb-3">
              {item.name}
            </small>
            <p className="text-2xl font-medium">
              $
              {Number.isFinite(item.price) ? item.price.toFixed(2) : "--"}
            </p>
            <div className="h-1.5 w-full bg-gray-800 rounded-lg">
              <div
                className="h-1.5 bg-orange-400 rounded-lg my-2"
                style={{
                  width: `${Math.min(Math.abs(item.currentPrice - item.price) * 100, 100)}%`,
                }}
              />
            </div>

            <small className="block text-gray-300">
              $
              {`${item ? (item?.currentPrice - item.price).toFixed(2) : "-.--"}`}{" "}
              vs U.S
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
