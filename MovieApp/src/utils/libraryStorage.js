const LIBRARY_KEY = "movieAppLibrary";

export function getLibraryItems() {
  const savedItems = localStorage.getItem(LIBRARY_KEY);

  if (!savedItems) return [];

  try {
    return JSON.parse(savedItems);
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
