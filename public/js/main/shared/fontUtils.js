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

export function setupSaveOptions(container) {
  container.querySelectorAll(".save-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      option.classList.toggle("selected-option");
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
