export const fuelSeries = {
  regular: "EMM_EPMR_PTE_NUS_DPG",
  midgrade: "EMM_EPMM_PTE_NUS_DPG",
  premium: "EMM_EPMP_PTE_NUS_DPG",
  diesel: "EMD_EPD2D_PTE_NUS_DPG",
};

const REGION_CODES = ["R10", "R20", "R30", "R40", "R50"];

function nationalSeries(fuelType) {
  const national = fuelSeries[fuelType];
  if (!national || !national.includes("_NUS_")) return null;
  return national;
}

export function regionalSeriesIds(fuelType) {
  const national = nationalSeries(fuelType);
  if (!national) return [];
  return REGION_CODES.map((code) => national.replace("_NUS_", `_${code}_`));
}

export function stateSeriesId(fuelType, stateCode) {
  const national = nationalSeries(fuelType);
  if (!national || !stateCode) return null;
  return national.replace("_NUS_", `_S${stateCode}_`);
}

const REGION_LABEL_STOP_WORDS = new Set([
  "Regular",
  "Midgrade",
  "Premium",
  "No",
  "All",
]);

export function regionLabel(description) {
  const words = String(description ?? "")
    .split(/\s+/)
    .filter(Boolean);
  const kept = [];
  for (const word of words) {
    if (REGION_LABEL_STOP_WORDS.has(word)) break;
    kept.push(word);
  }
  return kept.join(" ");
}

export function finitePrice(raw) {
  if (raw == null || raw === "") return null;
  const price = Number(raw);
  return Number.isFinite(price) ? price : null;
}

export function readLatestPrice(payload) {
  const rows = payload?.response?.data;
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return finitePrice(rows[0].value);
}
