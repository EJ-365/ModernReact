const THEME_KEY = "theme";

/**
 * Read persisted theme preference. Storage may throw when cookies/site data
 * are blocked (e.g. Firefox "Block cookies and site data") — never let that
 * prevent the app from mounting.
 * @param {() => string|null|undefined} [getItem]
 * @param {() => boolean} [prefersDark]
 * @returns {boolean} whether dark mode should be enabled
 */
export function loadDarkModePreference(
  getItem = (key) => localStorage.getItem(key),
  prefersDark = () =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false,
) {
  try {
    const storedTheme = getItem(THEME_KEY);
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
  } catch {
    /* storage blocked / unavailable */
  }
  try {
    return prefersDark();
  } catch {
    return false;
  }
}

/**
 * Persist theme preference. Failures are ignored so toggling theme never
 * crashes the tree when storage is full or blocked.
 * @param {boolean} darkMode
 * @param {(key: string, value: string) => void} [setItem]
 */
export function saveDarkModePreference(
  darkMode,
  setItem = (key, value) => localStorage.setItem(key, value),
) {
  try {
    setItem(THEME_KEY, darkMode ? "dark" : "light");
  } catch {
    /* storage blocked / unavailable */
  }
}
