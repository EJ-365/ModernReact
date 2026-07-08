import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, "..", "public", "api");
const base = "https://wheniskickoff.com/data/v1";
const files = ["matches.json", "teams.json", "venues.json"];

function validatePayload(text, file) {
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Invalid ${file}: response was not valid JSON`);
  }

  if (!payload || !Array.isArray(payload.data)) {
    throw new Error(`Invalid ${file}: expected a JSON object with a data array`);
  }
}

async function hasValidSnapshot(filePath, file) {
  try {
    validatePayload(await readFile(filePath, "utf8"), file);
    return true;
  } catch {
    return false;
  }
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function fetchApi({
  apiDir: targetDir = apiDir,
  baseUrl = base,
  fetchImpl = fetch,
  logger = console,
  fileNames = files,
} = {}) {
  await mkdir(targetDir, { recursive: true });

  for (const file of fileNames) {
    const filePath = path.join(targetDir, file);

    try {
      const res = await fetchImpl(`${baseUrl}/${file}`);
      if (!res.ok) throw new Error(`Failed to fetch ${file}: ${res.status}`);

      const text = await res.text();
      validatePayload(text, file);
      await writeFile(filePath, text);
      logger.log(`Fetched ${file}`);
    } catch (error) {
      if (await hasValidSnapshot(filePath, file)) {
        logger.warn(
          `Using existing ${file}; refresh failed: ${errorMessage(error)}`,
        );
        continue;
      }

      throw error;
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await fetchApi();
}
