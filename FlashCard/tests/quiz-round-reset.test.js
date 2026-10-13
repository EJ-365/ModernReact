import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appSrc = readFileSync(join(root, "src/App.jsx"), "utf8");
const listSrc = readFileSync(join(root, "src/CardList.jsx"), "utf8");

test("Generate bumps quizRound so answered card state cannot stick across rounds", () => {
  assert.match(appSrc, /const \[quizRound,\s*setQuizRound\]\s*=\s*useState\(0\)/);
  assert.match(appSrc, /setQuizRound\(\(prev\)\s*=>\s*prev\s*\+\s*1\)/);
  assert.match(appSrc, /quizRound=\{quizRound\}/);
});

test("CardList keys include quizRound so React remounts Cards after Generate", () => {
  assert.match(listSrc, /quizRound\s*=\s*0/);
  assert.match(listSrc, /key=\{`\$\{quizRound\}-\$\{index\}`\}/);
  assert.doesNotMatch(
    listSrc,
    /key=\{index\}/,
    "index-only keys reuse Cards and keep selectedAnswer after Generate",
  );
});
