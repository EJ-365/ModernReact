import assert from "node:assert/strict";
import test from "node:test";
import { regionLabel, regionalSeriesIds } from "../src/api/fuelSeries.js";

test("regional series ids follow the selected fuel", () => {
  assert.deepEqual(regionalSeriesIds("regular"), [
    "EMM_EPMR_PTE_R10_DPG",
    "EMM_EPMR_PTE_R20_DPG",
    "EMM_EPMR_PTE_R30_DPG",
    "EMM_EPMR_PTE_R40_DPG",
    "EMM_EPMR_PTE_R50_DPG",
  ]);

  assert.deepEqual(regionalSeriesIds("midgrade"), [
    "EMM_EPMM_PTE_R10_DPG",
    "EMM_EPMM_PTE_R20_DPG",
    "EMM_EPMM_PTE_R30_DPG",
    "EMM_EPMM_PTE_R40_DPG",
    "EMM_EPMM_PTE_R50_DPG",
  ]);

  assert.deepEqual(regionalSeriesIds("diesel"), [
    "EMD_EPD2D_PTE_R10_DPG",
    "EMD_EPD2D_PTE_R20_DPG",
    "EMD_EPD2D_PTE_R30_DPG",
    "EMD_EPD2D_PTE_R40_DPG",
    "EMD_EPD2D_PTE_R50_DPG",
  ]);
});

test("unknown fuels do not fall back to regular series", () => {
  assert.deepEqual(regionalSeriesIds("unknown"), []);
});

test("region labels stop before the fuel product name", () => {
  assert.equal(
    regionLabel(
      "Midwest No 2 Diesel Retail Prices (Dollars per Gallon)",
    ),
    "Midwest",
  );
  assert.equal(
    regionLabel(
      "East Coast Regular All Formulations Retail Gasoline Prices (Dollars per Gallon)",
    ),
    "East Coast",
  );
  assert.equal(
    regionLabel(
      "Rocky Mountain Midgrade All Formulations Retail Gasoline Prices (Dollars per Gallon)",
    ),
    "Rocky Mountain",
  );
});
