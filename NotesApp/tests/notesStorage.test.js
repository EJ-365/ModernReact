import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_NOTES,
  loadNotesFromStorage,
  parseStoredNotes,
  saveNotesToStorage,
} from "../src/notesStorage.js";

test("parseStoredNotes returns defaults for empty / missing", () => {
  assert.equal(parseStoredNotes(null), DEFAULT_NOTES);
  assert.equal(parseStoredNotes(undefined), DEFAULT_NOTES);
  assert.equal(parseStoredNotes(""), DEFAULT_NOTES);
});

test("parseStoredNotes keeps a valid note array", () => {
  const notes = [{ id: "a", title: "ok", done: false }];
  assert.deepEqual(parseStoredNotes(JSON.stringify(notes)), notes);
});

test("parseStoredNotes recovers from malformed JSON (live crash trigger)", () => {
  assert.equal(parseStoredNotes("{bad"), DEFAULT_NOTES);
  assert.equal(parseStoredNotes("not-json"), DEFAULT_NOTES);
});

test("parseStoredNotes recovers from non-array JSON (live crash trigger)", () => {
  assert.equal(parseStoredNotes("{}"), DEFAULT_NOTES);
  assert.equal(parseStoredNotes("null"), DEFAULT_NOTES);
  assert.equal(parseStoredNotes('"x"'), DEFAULT_NOTES);
  assert.equal(parseStoredNotes("123"), DEFAULT_NOTES);
});

test("loadNotesFromStorage tolerates getItem throwing", () => {
  assert.equal(
    loadNotesFromStorage(() => {
      throw new Error("blocked");
    }),
    DEFAULT_NOTES,
  );
});

test("saveNotesToStorage returns false when setItem throws", () => {
  assert.equal(
    saveNotesToStorage([{ id: 1 }], () => {
      throw new Error("quota");
    }),
    false,
  );
  const store = {};
  assert.equal(
    saveNotesToStorage([{ id: 2 }], (k, v) => {
      store[k] = v;
    }),
    true,
  );
  assert.equal(store.MyNote, JSON.stringify([{ id: 2 }]));
});
