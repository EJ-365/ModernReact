import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { fetchApi } from "../scripts/fetch-api.mjs";

const validSnapshot = JSON.stringify({ data: [{ id: 1 }] });
const replacementPayload = JSON.stringify({ data: [{ id: 2 }] });

async function withTempDir(test) {
  const dir = await mkdtemp(path.join(tmpdir(), "fwc26-api-"));

  try {
    await test(dir);
  } finally {
    await rm(dir, { force: true, recursive: true });
  }
}

function createLogger() {
  return {
    logs: [],
    warnings: [],
    log(message) {
      this.logs.push(message);
    },
    warn(message) {
      this.warnings.push(message);
    },
  };
}

await withTempDir(async (apiDir) => {
  const logger = createLogger();
  const filePath = path.join(apiDir, "matches.json");
  await writeFile(filePath, validSnapshot);

  await fetchApi({
    apiDir,
    fileNames: ["matches.json"],
    logger,
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });

  assert.equal(await readFile(filePath, "utf8"), validSnapshot);
  assert.deepEqual(logger.logs, []);
  assert.equal(logger.warnings.length, 1);
  assert.match(logger.warnings[0], /Using existing matches\.json/);
});

await withTempDir(async (apiDir) => {
  await assert.rejects(
    fetchApi({
      apiDir,
      fileNames: ["matches.json"],
      fetchImpl: async () => ({ ok: false, status: 503 }),
      logger: createLogger(),
    }),
    /Failed to fetch matches\.json: 503/,
  );
});

await withTempDir(async (apiDir) => {
  const logger = createLogger();
  const filePath = path.join(apiDir, "matches.json");

  await fetchApi({
    apiDir,
    fileNames: ["matches.json"],
    logger,
    fetchImpl: async () => ({
      ok: true,
      text: async () => replacementPayload,
    }),
  });

  assert.equal(await readFile(filePath, "utf8"), replacementPayload);
  assert.deepEqual(logger.logs, ["Fetched matches.json"]);
  assert.deepEqual(logger.warnings, []);
});

await withTempDir(async (apiDir) => {
  const logger = createLogger();
  const filePath = path.join(apiDir, "matches.json");
  await writeFile(filePath, validSnapshot);

  await fetchApi({
    apiDir,
    fileNames: ["matches.json"],
    logger,
    fetchImpl: async () => ({
      ok: true,
      text: async () => JSON.stringify({ error: "temporarily unavailable" }),
    }),
  });

  assert.equal(await readFile(filePath, "utf8"), validSnapshot);
  assert.equal(logger.warnings.length, 1);
  assert.match(logger.warnings[0], /expected a JSON object with a data array/);
});

console.log("fetch-api fallback tests passed");
