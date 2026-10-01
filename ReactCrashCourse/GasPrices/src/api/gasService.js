const fuelSeries = {
  regular: "EMM_EPMR_PTE_NUS_DPG",
  midgrade: "EMM_EPMM_PTE_NUS_DPG",
  premium: "EMM_EPMP_PTE_NUS_DPG",
  diesel: "EMD_EPD2D_PTE_NUS_DPG",
};

const BASE_URl = "https://us-fuel-energy-prices.p.rapidapi.com/";
const headers = {
  "x-rapidapi-host": "us-fuel-energy-prices.p.rapidapi.com",
  "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
};

export const getStatePrices = async (stateCode, fuelType) => {
  try {
    const response = await fetch(
      `${BASE_URl}gas/prices?state=${stateCode}&type=${fuelType}`,
      {
        method: "GET",
        headers: headers,
      },
    );
    return await response.json();
  } catch (error) {
    console.error("error fetching state prices:", error);
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

// fetch function for regional prices
export async function getRegional(fuelType) {
  const EIA_KEY = import.meta.env.VITE_EIA_API_KEY;
  const seriesType = fuelType === "diesel" ? "EPD2D" : "EPMR";

  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&facets[series][]=EMM_${seriesType}_PTE_R10_DPG&facets[series][]=EMM_${seriesType}_PTE_R20_DPG&facets[series][]=EMM_${seriesType}_PTE_R30_DPG&facets[series][]=EMM_${seriesType}_PTE_R40_DPG&facets[series][]=EMM_${seriesType}_PTE_R50_DPG&sort[0][column]=period&sort[0][direction]=desc&length=5`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching regional api", error);
    return null;
  }
}
