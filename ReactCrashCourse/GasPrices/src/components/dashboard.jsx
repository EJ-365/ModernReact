import { useContext, useEffect, useState } from "react";
import QuickSummary from "./quickSummary";
import Region from "./region";
import SinglePriceCardDisplay from "./singlePriceCardDisplay";
import StatePrice from "./StatePrice";
import { finitePrice, regionLabel } from "../api/fuelSeries.js";
import { getNationalPrices, getRegional } from "../api/gasService";
import { FuelContext } from "../context/FuelContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Spiral } from "@/components/spiral";
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
    price: null,
    coast: "---",
    regions: [],
  });

  useEffect(() => {
    let cancelled = false;
    const emptyRegion = { price: null, coast: "---", regions: [] };

    const loadDashboardData = async () => {
      setLoading(true);
      const usData = await getNationalPrices(fuelType);
      const regionalData = await getRegional(fuelType);
      if (cancelled) return;

      const pricesArray = Array.isArray(usData?.response?.data)
        ? usData.response.data
            .map((item) => finitePrice(item.value))
            .filter((price) => price != null)
        : [];

      if (pricesArray.length > 0) {
        setUsLow(Math.min(...pricesArray));
        setUsHigh(Math.max(...pricesArray));

        const currentPrice = pricesArray[0];
        setUsPrice(currentPrice);
        setCurrentWeekPrice(currentPrice);

        if (pricesArray.length > 1) {
          const previousPrice = pricesArray[1];
          setUsTrend(currentPrice - previousPrice);
          setLastWeek(previousPrice);
        } else {
          setUsTrend(null);
          setLastWeek(null);
        }

        const regionalRows = Array.isArray(regionalData?.response?.data)
          ? regionalData.response.data.filter(
              (item) => finitePrice(item.value) != null,
            )
          : [];

        if (regionalRows.length > 0) {
          const lowestRegion = regionalRows.reduce((prev, curr) => {
            return Number(prev.value) < Number(curr.value) ? prev : curr;
          });

          const regions = regionalRows.slice(0, 5).map((item) => ({
            name: regionLabel(item?.["series-description"]),
            price: finitePrice(item.value),
            currentPrice: currentPrice,
          }));

          setLowRegion({
            price: finitePrice(lowestRegion.value),
            coast: regionLabel(lowestRegion?.["series-description"]),
            regions,
          });
        } else {
          setLowRegion(emptyRegion);
        }
      } else {
        setUsPrice(null);
        setUsTrend(null);
        setUsLow(null);
        setUsHigh(null);
        setCurrentWeekPrice(null);
        setLastWeek(null);
        setLowRegion(emptyRegion);
      }
      setLoading(false);
    };

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [fuelType]);

  return (
    <main className="my-8 font-mono">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inset-0 text-[#f5d34f] text-center xl:my-80 my-30 font-medium italic text-xs"
          >
            <Spiral className="size-10 text-[#f5d34f]" />
            <p className="mt-10">Loading...</p>
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
                fuelType={fuelType}
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
            <Region
              fuelType={fuelType}
              lowRegion={lowRegion}
              usPrice={usPrice}
            />
            <StatePrice />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Dashboard;
