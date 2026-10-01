export const fuelSeries = {
  regular: "EMM_EPMR_PTE_NUS_DPG",
  midgrade: "EMM_EPMM_PTE_NUS_DPG",
  premium: "EMM_EPMP_PTE_NUS_DPG",
  diesel: "EMD_EPD2D_PTE_NUS_DPG",
};

const REGION_CODES = ["R10", "R20", "R30", "R40", "R50"];

export function regionalSeriesIds(fuelType) {
  const national = fuelSeries[fuelType];
  if (!national || !national.includes("_NUS_")) return [];
  return REGION_CODES.map((code) => national.replace("_NUS_", `_${code}_`));
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
