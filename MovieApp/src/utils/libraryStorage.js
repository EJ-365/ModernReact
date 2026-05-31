const LIBRARY_KEY = "movieAppLibrary";

function normalizeLibraryItem(item) {
  if (!item || typeof item !== "object") return null;
  if (item.mediaType !== "movie" && item.mediaType !== "show") return null;
  if (item.id === null || item.id === undefined || item.id === "") return null;

  return {
    id: item.id,
    mediaType: item.mediaType,
    title: typeof item.title === "string" ? item.title : "Untitled",
    poster_path: typeof item.poster_path === "string" ? item.poster_path : "",
    voteAverage:
      typeof item.voteAverage === "number" ? item.voteAverage : undefined,
    releaseDate: typeof item.releaseDate === "string" ? item.releaseDate : "",
  };
}

export function normalizeLibraryItems(items) {
  if (!Array.isArray(items)) return [];

  return items.map(normalizeLibraryItem).filter(Boolean);
}

export function getLibraryItems() {
  const savedItems = localStorage.getItem(LIBRARY_KEY);

  if (!savedItems) return [];

  try {
    return normalizeLibraryItems(JSON.parse(savedItems));
  } catch {
    return [];
  }
}

export function saveLibraryItem(item) {
  const currentItems = getLibraryItems();
  const itemKey = `${item.mediaType}-${item.id}`;
  const alreadySaved = currentItems.some(
    (libraryItem) => `${libraryItem.mediaType}-${libraryItem.id}` === itemKey,
  );

  if (alreadySaved) return currentItems;

  const nextItems = [item, ...currentItems];
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(nextItems));
  return nextItems;
}

export function removeLibraryItem(id, mediaType) {
  const nextItems = getLibraryItems().filter(
    (item) => !(item.id === id && item.mediaType === mediaType),
  );

  localStorage.setItem(LIBRARY_KEY, JSON.stringify(nextItems));
  return nextItems;
}

export function isLibraryItemSaved(id, mediaType) {
  return getLibraryItems().some(
    (item) => item.id === id && item.mediaType === mediaType,
  );
}
