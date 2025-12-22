import { isFavorite as checkIsFavorite, toggleFavorite as toggleFav } from "../state.js";

export function ensureFontFace(font) {
  const weights = Array.isArray(font?.weights) ? font.weights : [];
  const defaultWeight = weights.find((w) => w?.default) || weights[0];
  if (!defaultWeight?.file) return;

  const id = font?._id;
  if (id === null || id === undefined) return;

  const fontPath = `../assets/fonts/${defaultWeight.file}`;
  const styleId = `font-face-${id}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @font-face {
      font-family:'${id}-font';
      src:url('${fontPath}');
    }
  `;
  document.head.appendChild(style);
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

export function sameTags(tagsA, tagsB) {
  const a = Array.isArray(tagsA) ? tagsA : [];
  const b = Array.isArray(tagsB) ? tagsB : [];
  if (a.length !== b.length) return false;

  const setA = new Set(a);
  if (setA.size !== b.length) return false;
  return b.every((t) => setA.has(t));
}

export function pickRandom(arr, n) {
  const copy = Array.isArray(arr) ? [...arr] : [];
  copy.sort(() => Math.random() - 0.5);
  return copy.slice(0, n);
}

export const FAV_ICON = "../assets/imgs/fav.svg";
export const FAV_SELECTED_ICON = "../assets/imgs/fav_selected.svg";

export function setFavIconState(imgEl, isFavorite) {
  if (!imgEl) return;
  imgEl.src = isFavorite ? FAV_SELECTED_ICON : FAV_ICON;
}

export function toggleFavIcon(imgEl) {
  if (!imgEl) return;
  const isSelected = imgEl.src.endsWith("fav_selected.svg");
  setFavIconState(imgEl, !isSelected);
}

let isCapsLockOn = false;
let capsLockListenersAttached = false;

export function ensureCapsLockTracking() {
  if (capsLockListenersAttached) return;
  capsLockListenersAttached = true;

  document.addEventListener("keydown", (e) => {
    isCapsLockOn = e.getModifierState("CapsLock");
  });
  document.addEventListener("keyup", (e) => {
    isCapsLockOn = e.getModifierState("CapsLock");
  });
}

export function getIsCapsLockOn() {
  return isCapsLockOn;
}

export function closeSaveMenusExcept(exceptMenu) {
  document.querySelectorAll(".save, .save_list").forEach((menu) => {
    if (menu !== exceptMenu) {
      menu.style.display = "none";
      menu.parentElement?.querySelector(".save-btn")?.classList.remove("selected");
    }
  });
}

export function setupSaveMenuToggle(saveBtn, saveMenu) {
  if (!saveBtn || !saveMenu) return;
  saveMenu.style.display = "none";

  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    closeSaveMenusExcept(saveMenu);

    const isOpening = saveMenu.style.display === "none";
    saveMenu.style.display = isOpening ? "block" : "none";
    saveBtn.classList.toggle("selected", isOpening);
  });
}

export async function toggleFontInCollection(fontId, collectionName) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user._id) {
    console.warn("User not logged in");
    return null;
  }

  try {
    const res = await fetch("http://web-dev-grupo05.dei.uc.pt/api/collections/toggle-font", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId: user._id, 
        collectionName: collectionName,
        fontId: String(fontId) 
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    
    import("../collections.js").then(({ refreshUserCollections }) => {
      refreshUserCollections(user._id);
    });

    return data;
  } catch (e) {
    console.error("Failed to toggle font in collection:", e);
    return null;
  }
}

export async function populateGridSaveMenu(saveMenu, fontId) {
  if (!saveMenu) return;

  let userCollections = [];
  try {
    const { getUserCollections } = await import("../collections.js");
    userCollections = getUserCollections() || [];
  } catch (e) {
    console.error("Failed to get user collections:", e);
    saveMenu.innerHTML = '<h4>Save font on...</h4><p style="color: var(--darker-grey); padding: 0.5rem; font-size: 0.8rem;">Please login.</p>';
    return;
  }

  const fontsCollections = userCollections.filter(c => c.type === "fonts" && c.name !== "Favourites");

  if (fontsCollections.length === 0) {
    saveMenu.innerHTML = '<h4>Save font on...</h4><p style="color: var(--darker-grey); padding: 0.5rem; font-size: 0.8rem;">No collections.</p>';
    return;
  }

  saveMenu.innerHTML = '<h4>Save font on...</h4>';

  fontsCollections.forEach(collection => {
    const items = Array.isArray(collection.items) ? collection.items : [];
    const fontIds = items.map(item => String(item.fontId)).filter(Boolean);
    const isInCollection = fontIds.includes(String(fontId));

    const option = document.createElement("a");
    option.href = "#";
    option.className = "save-option";
    if (isInCollection) option.classList.add("selected-option");
    option.dataset.collectionName = collection.name;

    option.innerHTML = `
      <div><h4>Aa</h4><h4>${escapeHtml(collection.name)}</h4></div>
      <h5 class="add-text">add</h5>
      <img src="../assets/imgs/check.svg" class="check-icon" alt="check icon">
    `;

    option.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const result = await toggleFontInCollection(fontId, collection.name);
      option.classList.toggle("selected-option", result?.added);
    });

    saveMenu.appendChild(option);
  });
}

export function setupSaveOptions(container, fontId) {
  container.querySelectorAll(".save-option").forEach((option) => {
    option.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const collectionType = option.dataset.type;
      if (!collectionType || !fontId) {
        option.classList.toggle("selected-option");
        return;
      }

      const collectionName = collectionType.charAt(0).toUpperCase() + collectionType.slice(1);
      
      const result = await toggleFontInCollection(fontId, collectionName);
      
      if (result) {
        if (result.added) {
          option.classList.add("selected-option");
        } else {
          option.classList.remove("selected-option");
        }
      }
    });
  });
}

export function setupFavButton(favImg, fontId) {
  if (!favImg) return;
  
  setFavIconState(favImg, checkIsFavorite(fontId));
  
  if (!favImg.__favListenerAttached) {
    favImg.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newState = await toggleFav(fontId);
      setFavIconState(favImg, newState);
      updateAllFavIcons(fontId, newState);
    });
    favImg.__favListenerAttached = true;
  }
}

export function updateAllFavIcons(fontId, isFavorite) {
  const allFavButtons = document.querySelectorAll(`[data-font-id="${fontId}"] .fav-btn img`);
  allFavButtons.forEach(img => setFavIconState(img, isFavorite));
}
