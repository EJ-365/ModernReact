import { useContext, useEffect, useState } from "react";
import QuickSummary from "./QuickSummary";
import Region from "./Region";
import SinglePriceCardDisplay from "./SinglePriceCardDisplay";
import StatePrice from "./StatePrice";
import { getNationalPrices, getRegional } from "../api/gasService";
import { FuelContext } from "../context/FuelContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const { fuelType } = useContext(FuelContext);
  const [usPrice, setUsPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usTrend, setUsTrend] = useState(null);
  const [usLow, setUsLow] = useState(null);
  const [usHigh, setUsHigh] = useState(null);
  const [currentWeekPrice, setCurrentWeekPrice] = useState(null);
  const [lastWeek, setLastWeek] = useState(null);
  const [lowRegion, setLowRegion] = useState({
    price: "0.00",
    coast: "---",
    regions: [],
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      const usData = await getNationalPrices(fuelType);
      const regionalData = await getRegional(fuelType);

      if (usData?.response?.data?.length > 0) {
        const pricesArray = usData.response.data.map((item) => Number(item.value));
        setUsLow(Math.min(...pricesArray));
        setUsHigh(Math.max(...pricesArray));

        const currentPrice = pricesArray[0];
        setUsPrice(currentPrice);
        setCurrentWeekPrice(currentPrice);

        if (pricesArray.length > 1) {
          const previousPrice = pricesArray[1];
          setUsTrend(currentPrice - previousPrice);
          setLastWeek(previousPrice);
        }

        if (regionalData?.response?.data?.length > 0) {
          const lowestRegion = regionalData.response.data.reduce((prev, curr) => {
            return Number(prev.value) < Number(curr.value) ? prev : curr;
          });

          const regions = regionalData.response.data.slice(0, 5).map((item) => ({
            name: item[`series-description`].split(" ").slice(0, 2).join(" "),
            price: Number(item.value),
            currentPrice: currentPrice,
          }));

          setLowRegion({
            price: Number(lowestRegion.value),
            coast: lowestRegion[`series-description`].split(" ").slice(0, 2).join(" "),
            regions,
          });
        }
      }
      setLoading(false);
    };

    loadDashboardData();
  }, [fuelType]);

  return (
    <main className="my-8">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inset-0 text-orange-600 text-center my-80 font-medium italic text-xs"
          >
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="my-4 flex xl:flex-row flex-col items-center container mx-auto ">
              <SinglePriceCardDisplay
                usPrice={usPrice}
                usTrend={usTrend}
                usLow={usLow}
              />
              <QuickSummary
                usHigh={usHigh}
                currentWeekPrice={currentWeekPrice}
                lastWeek={lastWeek}
                lowRegion={lowRegion}
              />
            </div>
            <Region lowRegion={lowRegion} usPrice={usPrice} />
            <StatePrice />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Dashboard;