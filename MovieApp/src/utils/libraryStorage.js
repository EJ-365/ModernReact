const LIBRARY_KEY = "movieAppLibrary";

function isValidLibraryItem(item) {
  return (
    item &&
    typeof item === "object" &&
    (item.mediaType === "movie" || item.mediaType === "show") &&
    (typeof item.id === "number" || typeof item.id === "string") &&
    typeof item.title === "string" &&
    (typeof item.voteAverage === "number" || item.voteAverage == null)
  );
}

export function getLibraryItems() {
  try {
    const savedItems = localStorage.getItem(LIBRARY_KEY);

    if (!savedItems) return [];

    const parsedItems = JSON.parse(savedItems);
    return Array.isArray(parsedItems)
      ? parsedItems.filter(isValidLibraryItem)
      : [];
  } catch {
    return [];
  }
}

export function saveLibraryItem(item) {
  const currentItems = getLibraryItems();

  if (!isValidLibraryItem(item)) return currentItems;

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
