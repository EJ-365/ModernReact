import { fuelSeries, regionalSeriesIds } from "./fuelSeries.js";

const EIA_DATA_URL = "https://api.eia.gov/v2/petroleum/pri/gnd/data/";

function eiaUrl(seriesIds, length) {
  const EIA_KEY = import.meta.env.VITE_EIA_API_KEY;
  const params = new URLSearchParams();
  if (EIA_KEY) params.set("api_key", EIA_KEY);
  params.set("frequency", "weekly");
  params.append("data[0]", "value");
  for (const id of seriesIds) params.append("facets[series][]", id);
  params.set("sort[0][column]", "period");
  params.set("sort[0][direction]", "desc");
  params.set("length", String(length));
  return `${EIA_DATA_URL}?${params}`;
}

async function fetchEia(seriesIds, length) {
  if (!seriesIds.length) return null;
  try {
    const response = await fetch(eiaUrl(seriesIds, length));
    return await response.json();
  } catch (error) {
    console.error("Error fetching EIA fuel prices:", error);
    return null;
  }
}

export const getStatePrices = async (seriesId) => {
  if (!seriesId) return null;
  return fetchEia([seriesId], 1);
};

export const getNationalPrices = async (fuelType) => {
  const series = fuelSeries[fuelType];
  if (!series) return null;
  return fetchEia([series], 2);
};

export async function getRegional(fuelType) {
  const series = regionalSeriesIds(fuelType);
  return fetchEia(series, series.length);
}
