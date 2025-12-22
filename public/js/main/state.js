let globalSampleText = "The quick brown fox jumps over the lazy dog.";
let allFonts = [];
let favoriteFontIds = new Set();
let actualMode = "grid"; 

export function getGlobalSampleText() {
  return globalSampleText;
}

export function setGlobalSampleText(value) {
  globalSampleText = String(value ?? "");
}

export function getAllFonts() {
  return allFonts;
}

export function setAllFonts(fonts) {
  allFonts = Array.isArray(fonts) ? fonts : [];
}

export function getFavoriteFontIds() {
  return favoriteFontIds;
}

export function setFavoriteFontIds(ids) {
  favoriteFontIds = new Set(Array.isArray(ids) ? ids.map(String) : []);
}

export function isFavorite(fontId) {
  return favoriteFontIds.has(String(fontId));
}

export function addFavorite(fontId) {
  favoriteFontIds.add(String(fontId));
}

export function removeFavorite(fontId) {
  favoriteFontIds.delete(String(fontId));
}

export function clearAllFavorites() {
  favoriteFontIds.clear();
}

export async function toggleFavorite(fontId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user._id) return false;

  try {
    const res = await fetch("http://web-dev-grupo05.dei.uc.pt/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, fontId: String(fontId) }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.added) {
      addFavorite(fontId);
    } else {
      removeFavorite(fontId);
    }

    import("./collections.js").then(({ refreshUserCollections, getUserCollections }) => {
      refreshUserCollections(user._id).then((newCollections) => {
        if (newCollections) {
          const collectionsNav = window.__collectionsNav;
          if (collectionsNav?.refreshCollections) {
            collectionsNav.refreshCollections();
          }
        }
      });
    });

    return data.added;
  } catch (e) {
    console.error("Failed to toggle favorite:", e);
    return false;
  }
}

export function getActualMode() {
  return actualMode;
}

export function setActualMode(mode) {
  if (mode === "grid" || mode === "list") {
    actualMode = mode;
  }
}

window.__appState = {
  isFavorite,
  toggleFavorite,
  getGlobalSampleText,
  setGlobalSampleText,
};
