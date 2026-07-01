import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, "..", "public", "api");
const base = "https://wheniskickoff.com/data/v1";

await mkdir(apiDir, { recursive: true });

for (const file of ["matches.json", "teams.json"]) {
  const res = await fetch(`${base}/${file}`);
  if (!res.ok) throw new Error(`Failed to fetch ${file}: ${res.status}`);
  await writeFile(path.join(apiDir, file), await res.text());
  console.log(`Fetched ${file}`);
}
