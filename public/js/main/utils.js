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

export function ensureFontFace(font) {
  const defaultWeight = font?.weights?.find((w) => w.default) || font?.weights?.[0];
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

export const FAV_ICON = "../assets/imgs/fav.svg";
export const FAV_SELECTED_ICON = "../assets/imgs/fav_selected.svg";

export function toggleFavIcon(imgEl) {
  if (!imgEl) return;

  const isSelected = imgEl.src.endsWith("fav_selected.svg");
  imgEl.src = isSelected ? FAV_ICON : FAV_SELECTED_ICON;
}