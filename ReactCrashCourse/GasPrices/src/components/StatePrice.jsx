import { useContext, useEffect, useState } from "react";
import { getStatePrices } from "../api/gasService";
import { FuelContext } from "../context/FuelContext";

// state list
const statesList = [
  { name: "Texas", region: "Gulf Coast", code: "TX" },
  { name: "California", region: "West Coast", code: "CA" },
  { name: "Florida", region: "East Coast", code: "FL" },
  { name: "Ohio ", region: "Midwest", code: "OH" },
  { name: "Colorado", region: "Rocky Mountain", code: "CO" },
  { name: "New York", region: "East Coast", code: "NY" },
];

function StatePrice() {
  const { fuelType } = useContext(FuelContext);
  const [prices, setPrices] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // for state filtering loadDashboardData

  const filteredStates = statesList.filter((state) => {
    return state.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const fetchAllPrices = async () => {
      const pricePromises = statesList.map((state) =>
        getStatePrices(state.code, fuelType),
      );
      const results = await Promise.all(pricePromises);

      const newPrices = {};
      results.forEach((res, index) => {
        if (res?.success && res.data?.prices?.length > 0) {
          newPrices[statesList[index].code] = res.data.prices[0].price;
        }
      });

      setPrices(newPrices);
    };

    fetchAllPrices();
  }, [fuelType]);

  return (
    <main className="mt-10">
      <div className="flex xl:flex-row flex-col justify-evenly items-center">
        <div>
          <h1 className="xl:text-[32px] text-lg font-medium">
            Explore fuel prices by state.
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
            className="border px-8 py-2 rounded-lg border-gray-700 active:border-none focus:ring-2 focus:outline-none outline-none focus:ring-orange-400 transition-colors duration-300  my-2 xl:my-0"
            placeholder="Search States"
          />
        </form>
      </div>

      {/* states */}
      <div className="base flex justify-center flex-wrap items-center container mx-auto mt-16">
        {filteredStates.map((state) => (
          <div
            key={state.code}
            className="border flex items-center justify-between w-100 mb-3 p-4 rounded-xl border-gray-700 bg-gray-900/80 mx-1"
          >
            <div>
              <h4 className="xl:text-[20px] text-lg  font-medium">
                {state.name}
              </h4>
              <small className="block capitalize text-gray-400 font-medium">
                {state.region}
              </small>
            </div>
            <p className="xl:text-[20px] text-lg font-medium tracking-widest">
              {prices[state.code] == null ||
              !Number.isFinite(Number(prices[state.code]))
                ? "--"
                : ` $${Number(prices[state.code]).toFixed(2)}`}
            </p>
          </div>
        ))}
      </div>


    </main>
  );
}
export default StatePrice;
