import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bodySrc = readFileSync(join(root, "src/Body.jsx"), "utf8");

test("Body fetches advice with a mount-only effect (no allAdvice dependency loop)", () => {
  assert.match(
    bodySrc,
    /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*fetchAdvice\(\);[\s\S]*\}, \[\]\)/,
    "mount effect must use an empty dependency array",
  );
  assert.doesNotMatch(
    bodySrc,
    /useEffect\([\s\S]*\[handleAdvice\]\)/,
    "effect must not depend on handleAdvice (that retriggered after every fetch)",
  );
  assert.doesNotMatch(
    bodySrc,
    /\ballAdvice\b/,
    "allAdvice state must be removed; it forced handleAdvice to change after every fetch",
  );
});

test("Get advice button triggers a network fetch, not a stale local copy", () => {
  assert.match(bodySrc, /onClick=\{fetchAdvice\}/);
  assert.match(bodySrc, /setAdvice\(\{\s*id:\s*slip\.id,\s*text:\s*slip\.advice\s*\}\)/);
});
