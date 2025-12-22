import { ensureFontFace } from "../../shared/fontUtils.js";
import { getGlobalSampleText } from "../../state.js";
import { renderFontTags, renderControlsBar, renderPairBox } from "./templates.js";

const API_BASE = "http://web-dev-grupo05.dei.uc.pt/api";

export function createPairControlsBox(pairFont, signal, headingFont = null) {
  const hasAllCaps = pairFont.tags?.includes("All Caps");
  const globalText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
  const displayText = hasAllCaps ? globalText.toUpperCase() : globalText;

  ensureFontFace(pairFont);

  const pairBoxWrapper = document.createElement("div");
  pairBoxWrapper.id = "pair-box-wrapper";
  pairBoxWrapper.className = "pair-box-wrapper";
  if (headingFont) pairBoxWrapper.dataset.headingFontId = headingFont._id;
  pairBoxWrapper.dataset.bodyFontId = pairFont._id;

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "bar_individual_font pair-controls force-visible-controls";
  controlsDiv.innerHTML = renderControlsBar({ isPair: true });

  const listDiv = document.createElement("div");
  listDiv.className = "list_individual pair-list";
  listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

  const tagsHTML = renderFontTags(pairFont);
  listDiv.innerHTML = renderPairBox(pairFont, displayText, tagsHTML);

  setupPairButtonEvents(listDiv, signal, headingFont, pairFont);

  pairBoxWrapper.appendChild(controlsDiv);
  pairBoxWrapper.appendChild(listDiv);

  setupPairBoxEvents(controlsDiv, listDiv, pairFont, signal);

  return pairBoxWrapper;
}

async function savePairToCollection(headingFontId, bodyFontId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user._id) return { success: false, message: "Not logged in" };

  try {
    const res = await fetch(`${API_BASE}/pairs/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        headingFontId: String(headingFontId),
        bodyFontId: String(bodyFontId),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, added: data.added };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

async function removePairFromCollection(headingFontId, bodyFontId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user._id) return { success: false };

  try {
    const res = await fetch(`${API_BASE}/pairs/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        headingFontId: String(headingFontId),
        bodyFontId: String(bodyFontId),
      }),
    });
    if (res.ok) {
      return { success: true };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

function setupPairButtonEvents(listDiv, signal, headingFont, bodyFont) {
  const savePairBtn = listDiv.querySelector(".save-pair-btn");
  const removePairBtn = listDiv.querySelector(".remove-pair-btn");

  const savePairImg = savePairBtn?.querySelector("img");
  const removePairImg = removePairBtn?.querySelector("img");

  const SAVE_DEFAULT = "../assets/imgs/fav.svg";
  const SAVE_HOVER_SELECTED = "../assets/imgs/fav_pairs_selected.svg";
  const REMOVE_DEFAULT = "../assets/imgs/trash.svg";
  const REMOVE_HOVER = "../assets/imgs/trash_selected.svg";

  const syncSavePairIcon = () => {
    if (!savePairImg) return;
    const isSelected = savePairBtn?.classList.contains("selected-option");
    savePairImg.src = isSelected ? SAVE_HOVER_SELECTED : SAVE_DEFAULT;
  };

  removePairBtn?.addEventListener("mouseenter", () => {
    if (removePairImg) removePairImg.src = REMOVE_HOVER;
  }, { signal });

  removePairBtn?.addEventListener("mouseleave", () => {
    if (removePairImg) removePairImg.src = REMOVE_DEFAULT;
  }, { signal });

  savePairBtn?.addEventListener("mouseenter", () => {
    if (savePairImg) savePairImg.src = SAVE_HOVER_SELECTED;
  }, { signal });

  savePairBtn?.addEventListener("mouseleave", () => {
    syncSavePairIcon();
  }, { signal });

  savePairBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!headingFont) {
      const singleFontView = document.getElementById("singleFontView");
      const mainListDiv = singleFontView?.querySelector(".list_individual:not(.pair-list)");
      const mainFontFamily = mainListDiv?.querySelector("h1.sampleText")?.style.fontFamily;
      const headingId = mainFontFamily?.replace(/['-]/g, "").replace("font", "") || null;
      if (headingId && bodyFont) {
        const isSelected = savePairBtn.classList.contains("selected-option");
        if (isSelected) {
          await removePairFromCollection(headingId, bodyFont._id);
        } else {
          await savePairToCollection(headingId, bodyFont._id);
        }
        savePairBtn.classList.toggle("selected-option");
        syncSavePairIcon();
      }
    } else {
      const isSelected = savePairBtn.classList.contains("selected-option");
      if (isSelected) {
        await removePairFromCollection(headingFont._id, bodyFont._id);
      } else {
        await savePairToCollection(headingFont._id, bodyFont._id);
      }
      savePairBtn.classList.toggle("selected-option");
      syncSavePairIcon();
    }
  }, { signal });

  syncSavePairIcon();
}

// ================
// PAIR BOX EVENTS 
// ================
function setupPairBoxEvents(controlsContainer, displayContainer, font, signal) {
  const h1 = displayContainer.querySelector("h1");
  const fontSize = controlsContainer.querySelector("#pairFontSize");
  const letterSpacing = controlsContainer.querySelector("#pairLetterSpacing");
  const lineHeight = controlsContainer.querySelector("#pairLineHeight");

  const fontSizeValue = controlsContainer.querySelector("#pairFontSizeValue");
  const letterSpacingValue = controlsContainer.querySelector("#pairLetterSpacingValue");
  const lineHeightValue = controlsContainer.querySelector("#pairLineHeightValue");

  if (lineHeightValue && lineHeight) lineHeightValue.textContent = lineHeight.value + "%";
  if (h1 && lineHeight) h1.style.lineHeight = lineHeight.value + "%";

  fontSize?.addEventListener("input", function () {
    if (fontSizeValue) fontSizeValue.textContent = this.value + "pt";
    if (h1) h1.style.fontSize = this.value + "pt";
  }, { signal });

  letterSpacing?.addEventListener("input", function () {
    if (letterSpacingValue) letterSpacingValue.textContent = this.value + "pt";
    if (h1) h1.style.letterSpacing = this.value + "pt";
  }, { signal });

  lineHeight?.addEventListener("input", function () {
    if (lineHeightValue) lineHeightValue.textContent = this.value + "%";
    if (h1) h1.style.lineHeight = this.value + "%";
  }, { signal });

  setupPairStylesMenu(controlsContainer, displayContainer, font, signal);
}


function applyPairWeight(styleEl, fontFamily, weight, h1El) {
  styleEl.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('../assets/fonts/${weight.file}');
    }
  `;
  if (h1El) h1El.style.fontFamily = `'${fontFamily}'`;
}

function buildPairStylesMenuOptions(menuScroll, font, fontFamily, styleEl, h1El, signal) {
  if (!menuScroll) return;
  menuScroll.innerHTML = "";

  const defaultWeight = font.weights.find((w) => w.default) || font.weights[0];

  font.weights.forEach((w) => {
    const optionLink = document.createElement("a");
    optionLink.href = "#";
    optionLink.className = "option style-option";

    const optionSelected = document.createElement("div");
    optionSelected.className = "option_selected";
    if (w === defaultWeight) optionSelected.classList.add("selected");

    const optionText = document.createElement("h5");
    optionText.textContent = w.style;

    optionLink.appendChild(optionSelected);
    optionLink.appendChild(optionText);
    menuScroll.appendChild(optionLink);

    optionLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menuScroll?.querySelectorAll(".option_selected").forEach((sel) => sel.classList.remove("selected"));
      optionSelected.classList.add("selected");
      applyPairWeight(styleEl, fontFamily, w, h1El);
    }, { signal });
  });

  applyPairWeight(styleEl, fontFamily, defaultWeight, h1El);
}

function setupPairStylesMenu(controlsContainer, displayContainer, font, signal) {
  const chooseBtn = controlsContainer.querySelector(".choose_style_btn");
  const menu = controlsContainer.querySelector("#pair_styles_menu");
  const menuScroll = menu?.querySelector(".styles_menu_scroll");
  const h1 = displayContainer.querySelector("h1");

  const pairFamily = `${font._id}-font-pair-single`;

  let pairFace = document.getElementById("pair-font-face");
  if (!pairFace) {
    pairFace = document.createElement("style");
    pairFace.id = "pair-font-face";
    document.head.appendChild(pairFace);
  } else {
    pairFace.textContent = "";
  }

  buildPairStylesMenuOptions(menuScroll, font, pairFamily, pairFace, h1, signal);

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!menu) return;

    const isOpening = menu.style.display === "none";
    menu.style.display = isOpening ? "block" : "none";
    chooseBtn.classList.toggle("selected", isOpening);
    displayContainer.classList.toggle("shifted", isOpening);
  };

  const closeOnOutsideClick = (e) => {
    if (menu && chooseBtn && !menu.contains(e.target) && !chooseBtn.contains(e.target)) {
      menu.style.display = "none";
      chooseBtn.classList.remove("selected");
      displayContainer.classList.remove("shifted");
    }
  };

  chooseBtn?.addEventListener("click", toggleMenu, { signal });
  document.addEventListener("click", closeOnOutsideClick, { signal });
}