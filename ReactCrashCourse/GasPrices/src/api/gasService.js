import { fuelSeries, regionalSeriesIds } from "./fuelSeries.js";

const BASE_URl = "https://us-fuel-energy-prices.p.rapidapi.com/";
const headers = {
  "x-rapidapi-host": "us-fuel-energy-prices.p.rapidapi.com",
  "x-rapidapi-key": import.meta.env?.VITE_RAPIDAPI_KEY,
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
  const EIA_KEY = import.meta.env?.VITE_EIA_API_KEY;
  const series = fuelSeries[fuelType];
  if (!series) return null;
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&facets[series][]=${series}&sort[0][column]=period&sort[0][direction]=desc&length=2`;

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
  const EIA_KEY = import.meta.env?.VITE_EIA_API_KEY;
  const series = regionalSeriesIds(fuelType);
  if (series.length === 0) return null;

  const facets = series
    .map((id) => `facets[series][]=${encodeURIComponent(id)}`)
    .join("&");
  const url = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_KEY}&frequency=weekly&data[0]=value&${facets}&sort[0][column]=period&sort[0][direction]=desc&length=${series.length}`;

  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching regional api", error);
    return null;
  }
}
