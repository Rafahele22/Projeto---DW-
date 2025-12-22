import { createPairControlsBox } from "./pairBox.js";

// =========================
// SETUP SINGLE VIEW EVENTS
// =========================
export function setupSingleViewEvents({
  controlsContainer,
  displayContainer,
  pairContainer,
  font,
  signal,
  singleFontView,
  getAllFonts,
  filtersPanelEl,
  filtersBtnEl,
  gridEl,
  listEl,
  closeSingleFontView
}) {
  setupAddPairEvents(pairContainer, font, signal, singleFontView, getAllFonts);
  setupFavouriteEvent(displayContainer, signal);
  setupSaveMenuEvent(displayContainer, signal);
  setupSlidersEvents(controlsContainer, displayContainer, signal);
  setupTagsEvents(displayContainer, signal, closeSingleFontView, filtersPanelEl, filtersBtnEl, gridEl, listEl);
  setupStylesMenu(controlsContainer, displayContainer, font, signal);
  setupGlobalClickHandlers(controlsContainer, displayContainer, pairContainer, signal);
}

// =========================
// ADD PAIR EVENTS
// =========================
function setupAddPairEvents(pairContainer, font, signal, singleFontView, getAllFonts) {
  const addPairBtn = pairContainer?.querySelector("#add_pair_btn");
  const pairMenu = pairContainer?.querySelector("#pair_menu");

  if (pairMenu) pairMenu.style.display = "none";

  addPairBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isLoggedIn = document.body.classList.contains("is-logged-in");

    if (!isLoggedIn) {
      showLoginPrompt();
      if (pairMenu) pairMenu.style.display = "none";
      addPairBtn.classList.remove("selected");
      return;
    }

    if (!pairMenu) return;
    const isOpening = pairMenu.style.display === "none";
    pairMenu.style.display = isOpening ? "block" : "none";
    addPairBtn.classList.toggle("selected", isOpening);
  }, { signal });

  // Pair Category Click
  pairContainer?.addEventListener("click", (e) => {
    const cat = e.target.closest(".pair-category");
    if (!cat) return;

    e.preventDefault();
    e.stopPropagation();

    const collectionId = cat.dataset.collectionId;
    const options = pairContainer.querySelector(`.pair-options[data-collection-id="${collectionId}"]`);
    if (!options) return;

    const isOpening = options.style.display === "none";

    pairContainer.querySelectorAll(".pair-options").forEach((sec) => (sec.style.display = "none"));
    pairContainer.querySelectorAll(".pair-category").forEach((c) => c.classList.remove("selected-option"));

    options.style.display = isOpening ? "block" : "none";
    cat.classList.toggle("selected-option", isOpening);
  }, { signal });

  // Pair Option Click
  pairContainer?.addEventListener("click", (e) => {
    const btn = e.target.closest(".pair-option-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const fontId = btn.dataset.fontId;
    if (!fontId) return;

    const allFonts = getAllFonts();
    const pairFont = allFonts.find((f) => String(f._id) === String(fontId));
    if (!pairFont) return;

    removePairBox(singleFontView, pairContainer, addPairBtn);

    const pairBox = createPairControlsBox(pairFont, signal);

    const firstListIndividual = singleFontView.querySelector(".list_individual:not(.pair-list)");
    if (firstListIndividual && firstListIndividual.nextSibling) {
      singleFontView.insertBefore(pairBox, firstListIndividual.nextSibling);
    } else {
      singleFontView.appendChild(pairBox);
    }

    const addPairLabel = addPairBtn?.querySelector("h4");
    if (addPairLabel) addPairLabel.textContent = "Change Pair";

    const removePairBtn = pairBox.querySelector(".remove-pair-btn");
    removePairBtn?.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      removePairBox(singleFontView, pairContainer, addPairBtn);
    }, { signal });

    pairMenu.style.display = "none";
    addPairBtn?.classList.remove("selected");
    pairContainer?.querySelectorAll(".pair-options").forEach((sec) => (sec.style.display = "none"));
    pairContainer?.querySelectorAll(".pair-category").forEach((c) => c.classList.remove("selected-option"));

    btn.classList.add("selected-option");
  }, { signal });
}

// =========================
// HELPER: Remove Pair Box
// =========================
function removePairBox(singleFontView, pairContainer, addPairBtn) {
  const existingPairBox = singleFontView.querySelector("#pair-box-wrapper");
  if (existingPairBox) existingPairBox.remove();

  const pairFace = document.getElementById("pair-font-face");
  if (pairFace) pairFace.textContent = "";

  pairContainer?.querySelectorAll(".pair-option-btn").forEach((b) => b.classList.remove("selected-option"));

  const addPairLabel = addPairBtn?.querySelector("h4");
  if (addPairLabel) addPairLabel.textContent = "Add Pair";
}

// =========================
// HELPER: Show Login Prompt
// =========================
function showLoginPrompt() {
  const loginBox = document.querySelector(".loginContentor");
  const loginForm = document.getElementById("login");
  const registerForm = document.getElementById("register");

  if (loginBox) loginBox.style.display = "block";
  if (loginForm) loginForm.style.display = "block";
  if (registerForm) registerForm.style.display = "none";
}

// =========================
// FAVOURITE EVENT
// =========================
function setupFavouriteEvent(displayContainer, signal) {
  const favBtn = displayContainer.querySelector(".fav-btn img");
  favBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavIcon(favBtn);
  }, { signal });
}

function toggleFavIcon(img) {
  if (!img) return;
  const isFav = img.src.includes("fav_selected");
  img.src = isFav ? "../assets/imgs/fav.svg" : "../assets/imgs/fav_selected.svg";
}

// =========================
// SAVE MENU EVENT
// =========================
function setupSaveMenuEvent(displayContainer, signal) {
  const saveMenu = displayContainer.querySelector(".save_list");
  const saveBtn = displayContainer.querySelector(".save-btn");
  if (saveMenu) saveMenu.style.display = "none";

  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!saveMenu) return;

    const isOpening = saveMenu.style.display === "none";
    saveMenu.style.display = isOpening ? "block" : "none";
    saveBtn.classList.toggle("selected", isOpening);
  }, { signal });
}

// =========================
// SLIDERS EVENTS
// =========================
function setupSlidersEvents(controlsContainer, displayContainer, signal) {
  const h1 = displayContainer.querySelector("h1");
  const fontSize = controlsContainer.querySelector("#fontSize");
  const letterSpacing = controlsContainer.querySelector("#letterSpacing");
  const lineHeight = controlsContainer.querySelector("#lineHeight");

  const fontSizeValue = controlsContainer.querySelector("#fontSizeValue");
  const letterSpacingValue = controlsContainer.querySelector("#letterSpacingValue");
  const lineHeightValue = controlsContainer.querySelector("#lineHeightValue");

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
}

// =========================
// TAGS EVENTS
// =========================
function setupTagsEvents(displayContainer, signal, closeSingleFontView, filtersPanelEl, filtersBtnEl, gridEl, listEl) {
  const tagLinks = displayContainer.querySelectorAll(".font-tags a.tag-btn");

  tagLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const tag = link.textContent.trim();

      closeSingleFontView();

      if (filtersPanelEl) filtersPanelEl.style.display = "block";
      if (gridEl) gridEl.classList.add("shifted");
      if (listEl) listEl.classList.add("shifted");
      filtersBtnEl?.classList.add("selected");

      requestAnimationFrame(() => {
        const filterTagButtons = Array.from(document.querySelectorAll(".tag-btn"));
        const targetBtn = filterTagButtons.find((btn) => btn.textContent.trim() === tag);
        if (!targetBtn) return;

        targetBtn.scrollIntoView({ block: "center" });
        targetBtn.click();
      });
    }, { signal });
  });
}


function applyWeight(styleEl, fontFamily, weight, h1El) {
  styleEl.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('../assets/fonts/${weight.file}');
    }
  `;
  if (h1El) h1El.style.fontFamily = `'${fontFamily}'`;
}

// =========================
// HELPER: Build Styles Menu
// =========================
function buildStylesMenuOptions(menuScroll, font, fontFamily, styleEl, h1El, signal) {
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
      applyWeight(styleEl, fontFamily, w, h1El);
    }, { signal });
  });

  applyWeight(styleEl, fontFamily, defaultWeight, h1El);
}

// =========================
// STYLES MENU
// =========================
function setupStylesMenu(controlsContainer, displayContainer, font, signal) {
  const chooseBtn = controlsContainer.querySelector(".choose_style_btn");
  const menu = controlsContainer.querySelector("#styles_menu");
  const menuScroll = menu?.querySelector(".styles_menu_scroll");
  const h1 = displayContainer.querySelector("h1");

  const singleFamily = `${font._id}-font-single`;

  let singleFace = document.getElementById("single-font-face");
  if (!singleFace) {
    singleFace = document.createElement("style");
    singleFace.id = "single-font-face";
    document.head.appendChild(singleFace);
  }

  buildStylesMenuOptions(menuScroll, font, singleFamily, singleFace, h1, signal);

  chooseBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!menu) return;

    const isOpening = menu.style.display === "none";
    menu.style.display = isOpening ? "block" : "none";
    chooseBtn.classList.toggle("selected", isOpening);
    displayContainer.classList.toggle("shifted", isOpening);
  }, { signal });
}

// =========================
// GLOBAL CLICK HANDLERS
// =========================
function setupGlobalClickHandlers(controlsContainer, displayContainer, pairContainer, signal) {
  const menu = controlsContainer.querySelector("#styles_menu");
  const chooseBtn = controlsContainer.querySelector(".choose_style_btn");
  const saveMenu = displayContainer.querySelector(".save_list");
  const saveBtn = displayContainer.querySelector(".save-btn");
  const pairMenu = pairContainer?.querySelector("#pair_menu");
  const addPairBtn = pairContainer?.querySelector("#add_pair_btn");

  document.addEventListener("click", (e) => {
    if (menu && chooseBtn && !menu.contains(e.target) && !chooseBtn.contains(e.target)) {
      menu.style.display = "none";
      chooseBtn.classList.remove("selected");
      displayContainer.classList.remove("shifted");
    }

    if (saveMenu && saveBtn && !saveMenu.contains(e.target) && !saveBtn.contains(e.target)) {
      saveMenu.style.display = "none";
      saveBtn.classList.remove("selected");
    }

    if (pairMenu && addPairBtn && !pairMenu.contains(e.target) && !addPairBtn.contains(e.target)) {
      pairMenu.style.display = "none";
      addPairBtn.classList.remove("selected");
      pairContainer?.querySelectorAll(".pair-options").forEach((sec) => (sec.style.display = "none"));
      pairContainer?.querySelectorAll(".pair-category").forEach((c) => c.classList.remove("selected-option"));
    }
  }, { signal });
}
