const LIBRARY_KEY = "movieAppLibrary";

function isLibraryItem(item) {
  return (
    item &&
    typeof item === "object" &&
    "id" in item &&
    (item.mediaType === "movie" || item.mediaType === "show")
  );
}

export function getLibraryItems() {
  const savedItems = localStorage.getItem(LIBRARY_KEY);

  if (!savedItems) return [];

  try {
    const parsedItems = JSON.parse(savedItems);
    return Array.isArray(parsedItems) ? parsedItems.filter(isLibraryItem) : [];
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
