const fuelSeries = {
  regular: "EMM_EPMR_PTE_NUS_DPG",
  midgrade: "EMM_EPMM_PTE_NUS_DPG",
  premium: "EMM_EPMP_PTE_NUS_DPG",
  diesel: "EMD_EPD2D_PTE_NUS_DPG",
};

export const getStatePrices = async (seriesId) => {
  const EIA_KEY = import.meta.env.VITE_EIA_API_KEY;
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&facets[series][]=${seriesId}&sort[0][column]=period&sort[0][direction]=desc&length=1`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching state prices from EIA:", error);
    return null;
  }
};

export const getNationalPrices = async (fuelType) => {
  const EIA_KEY = import.meta.env.VITE_EIA_API_KEY;
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&facets[series][]=${fuelSeries[fuelType]}&sort[0][column]=period&sort[0][direction]=desc&length=2`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("EIA National Fetch Error:", error);
    return null;
  }
};

export async function getRegional(fuelType) {
  const EIA_KEY = import.meta.env.VITE_EIA_API_KEY;
  const prefix = fuelType === "diesel" ? "EMD" : "EMM";
  const seriesType = fuelType === "diesel" ? "EPD2D" : "EPMR";

  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&facets[series][]=${prefix}_${seriesType}_PTE_R10_DPG&facets[series][]=${prefix}_${seriesType}_PTE_R20_DPG&facets[series][]=${prefix}_${seriesType}_PTE_R30_DPG&facets[series][]=${prefix}_${seriesType}_PTE_R40_DPG&facets[series][]=${prefix}_${seriesType}_PTE_R50_DPG&sort[0][column]=period&sort[0][direction]=desc&length=5`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching regional api", error);
    return null;
  }
}
