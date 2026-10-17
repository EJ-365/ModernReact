import { useContext, useEffect, useState } from "react";
import { getStatePrices } from "../api/gasService";
import { readLatestPrice, stateSeriesId } from "../api/fuelSeries.js";
import { FuelContext } from "../context/FuelContext";

const statesList = [
  { name: "Texas", region: "Gulf Coast", code: "TX" },
  { name: "California", region: "West Coast", code: "CA" },
  { name: "Florida", region: "East Coast", code: "FL" },
  { name: "Ohio", region: "Midwest", code: "OH" },
  { name: "Colorado", region: "Rocky Mountain", code: "CO" },
  { name: "New York", region: "East Coast", code: "NY" },
];

function StatePrice() {
  const { fuelType } = useContext(FuelContext);
  const [prices, setPrices] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStates = statesList.filter((state) => {
    return state.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    let cancelled = false;

    const fetchAllPrices = async () => {
      setPrices({});
      const pricePromises = statesList.map((state) =>
        getStatePrices(stateSeriesId(fuelType, state.code)),
      );
      const results = await Promise.all(pricePromises);
      if (cancelled) return;

      const newPrices = {};
      results.forEach((res, index) => {
        const price = readLatestPrice(res);
        if (price == null) return;
        newPrices[statesList[index].code] = price;
      });

      setPrices(newPrices);
    };

    fetchAllPrices();
    return () => {
      cancelled = true;
    };
  }, [fuelType]);

  return (
    <main className="mt-10">
      <div className="flex xl:flex-row flex-col justify-evenly items-center">
        <div>
          <h1 className="xl:text-[32px] text-lg font-medium capitalize">
            Explore {fuelType} prices by state.
          </h1>
          <small className="block text-gray-400 text-sm font-medium">
            Search by state or region
          </small>
        </div>

        <form className="relative max-w-full ">
          <i className="bx bx-search text-gray-300 absolute xl:left-3 xl:top-3.5 xl:mr-4 top-5.5 align-middle left-3 text-sm xl:text-base" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            className="border px-8 py-2 rounded-lg border-gray-700 active:border-none focus:ring-2 focus:outline-none outline-none focus:ring-orange-400 transition-colors duration-300 my-2 xl:my-0 text-white bg-transparent"
            placeholder="Search States"
          />
        </form>
      </div>

      <div className="base flex justify-center flex-wrap items-center container mx-auto mt-16">
        {filteredStates.map((state) => {
          const price = prices[state.code];
          return (
            <div
              key={state.code}
              className="border flex items-center justify-between w-100 mb-3 p-4 rounded-xl border-gray-700 bg-gray-900/80 mx-1"
            >
              <div>
                <h4 className="xl:text-[20px] text-lg font-medium text-white">
                  {state.name}
                </h4>
                <small className="block capitalize text-gray-400 font-medium">
                  {state.region}
                </small>
              </div>
              <p className="xl:text-[20px] text-lg font-medium tracking-widest text-white">
                {price == null ? "--" : `USD ${price.toFixed(2)}`}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default StatePrice;
