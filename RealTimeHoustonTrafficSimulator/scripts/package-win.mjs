#!/usr/bin/env node
/**
 * Packages the Vite production build into downloads/HoustonTrafficSimulator-Setup-win-x64.zip
 * Created for Houston Traffic Simulator by Ejay Gabriel.
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const outDir = join(root, "downloads");
const stage = join(outDir, "_stage-win");
const zipName = "HoustonTrafficSimulator-Setup-win-x64.zip";
const zipPath = join(outDir, zipName);

if (!existsSync(dist)) {
  console.log("Building production bundle…");
  execSync("npm run build", { cwd: root, stdio: "inherit" });
}

rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync(dist, join(stage, "app"), { recursive: true });

writeFileSync(
  join(stage, "README-DESKTOP.txt"),
  `Houston Traffic Simulator — Windows package
Created by Ejay Gabriel

CONTENTS
  app/     Production static site (marketing + simulator)

QUICK START (no install)
  1. Install Node.js 20+ from https://nodejs.org
  2. Open a terminal in this folder
  3. Run:  npx --yes serve app -p 5176
  4. Open http://localhost:5176/ for the website
     or http://localhost:5176/app.html for the 3D simulator

WEB APP INSTALL
  In Chrome/Edge on the running site, use Install app / Install Houston Traffic Simulator.

LIVE DATA NOTE
  Static "serve" does not include Vite API proxies. For TranStar / FlightAware / TomTom
  while developing, run the project with: npm run dev  (from the full repo).

SUPPORT
  See docs/ inside the website or the Git repository developer documentation.
`,
  "utf8",
);

writeFileSync(
  join(stage, "Open-Simulator.url"),
  `[InternetShortcut]
URL=http://localhost:5176/app.html
`,
  "utf8",
);

mkdirSync(outDir, { recursive: true });
rmSync(zipPath, { force: true });

try {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${stage}\\*' -DestinationPath '${zipPath}' -Force"`,
    { stdio: "inherit" },
  );
} catch {
  /* fallback: leave staged folder */
  console.warn("Zip failed — staged folder left at downloads/_stage-win");
}

if (existsSync(zipPath)) {
  const kb = Math.round(readFileSync(zipPath).length / 1024);
  console.log(`Wrote ${zipName} (${kb} KB)`);
  rmSync(stage, { recursive: true, force: true });
} else {
  console.log("Staged at downloads/_stage-win — zip manually if needed.");
}
