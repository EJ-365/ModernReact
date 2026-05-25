import { useState } from "react";
import {
  isLibraryItemSaved,
  removeLibraryItem,
  saveLibraryItem,
} from "../utils/libraryStorage";

export default function LibraryHeartButton({ item }) {
  const [isSaved, setIsSaved] = useState(() =>
    isLibraryItemSaved(item.id, item.mediaType),
  );

  function toggleLibraryItem(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isSaved) {
      removeLibraryItem(item.id, item.mediaType);
      setIsSaved(false);
      return;
    }

    saveLibraryItem(item);
    setIsSaved(true);
  }

  return (
    <button
      type="button"
      onClick={toggleLibraryItem}
      aria-label={isSaved ? "Remove from library" : "Add to library"}
      className="absolute top-2 right-2 z-20 rounded-xl flex justify-end md:top-auto md:right-auto md:p-3 md:-mt-84 md:left-40 group/heart"
    >
      <i
        className={`${isSaved ? "bxf text-white" : "bx text-white"} bx-heart text-2xl bg-gray-800/30 transition-colors duration-200 h-10 rounded-full w-auto px-2 py-2 align-middle font-thin backdrop-blur-2xl group-hover/heart:bg-gray-800`}
      />
    </button>
  );
}
