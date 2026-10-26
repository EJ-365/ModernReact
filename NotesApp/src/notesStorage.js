/** Default starter note when storage is empty or unusable. */
export const DEFAULT_NOTES = [
  {
    id: 1,
    title: "Learn React JS",
    priority: "high",
    category: "personal",
    desc: "this is a sample note",
    done: false,
  },
];

/**
 * Parse notes from localStorage. Malformed JSON or non-arrays must not crash
 * the app — fall back to defaults so a corrupted MyNote key is recoverable.
 * @param {string|null|undefined} saved
 * @param {unknown[]} [fallback]
 */
export function parseStoredNotes(saved, fallback = DEFAULT_NOTES) {
  if (saved == null || saved === "") return fallback;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function loadNotesFromStorage(getItem = (k) => localStorage.getItem(k)) {
  try {
    return parseStoredNotes(getItem("MyNote"));
  } catch {
    return DEFAULT_NOTES;
  }
}

export function saveNotesToStorage(
  notes,
  setItem = (k, v) => localStorage.setItem(k, v),
) {
  try {
    setItem("MyNote", JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}
