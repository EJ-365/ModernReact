import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (/\.(js|jsx)$/.test(entry.name)) return [full];
    return [];
  });
}

function exactJoin(dir, segment) {
  const match = fs.readdirSync(dir).find((name) => name === segment);
  return match ? path.join(dir, match) : null;
}

function resolveExact(fromFile, spec) {
  const parts = spec.split("/");
  let current = path.dirname(fromFile);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "" || part === ".") continue;
    if (part === "..") {
      current = path.dirname(current);
      continue;
    }

    const isLast = i === parts.length - 1;
    if (!isLast) {
      const next = exactJoin(current, part);
      if (!next) return null;
      current = next;
      continue;
    }

    const candidates = path.extname(part)
      ? [part]
      : [
          part,
          `${part}.js`,
          `${part}.jsx`,
          `${part}.css`,
          path.join(part, "index.js"),
          path.join(part, "index.jsx"),
        ];

    for (const candidate of candidates) {
      const segments = candidate.split(/[/\\]/);
      let cursor = current;
      let ok = true;
      for (const segment of segments) {
        const next = exactJoin(cursor, segment);
        if (!next) {
          ok = false;
          break;
        }
        cursor = next;
      }
      if (ok && fs.statSync(cursor).isFile()) return cursor;
    }
    return null;
  }

  return null;
}

test("source imports resolve with exact filesystem case", () => {
  const importRe = /from\s+["']([^"']+)["']/g;
  const misses = [];

  for (const file of walk(srcDir)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(importRe)) {
      const spec = match[1];
      const relativeFile = path.relative(root, file);

      if (spec.startsWith("@/")) {
        const resolved = resolveExact(
          path.join(srcDir, "_alias.js"),
          `./${spec.slice(2)}`,
        );
        if (!resolved) misses.push(`${relativeFile} -> ${spec}`);
        continue;
      }

      if (!spec.startsWith(".")) continue;
      if (!resolveExact(file, spec)) misses.push(`${relativeFile} -> ${spec}`);
    }
  }

  assert.deepEqual(misses, []);
});
