import { ensureFontFace } from "../../shared/fontUtils.js";
import { getGlobalSampleText } from "../../state.js";
import { renderFontTags, renderControlsBar, renderListIndividual, renderPairWrapper } from "./templates.js";
import { createPairControlsBox } from "./pairBox.js";
import { populatePairCollections, populateSaveCollections } from "./collections.js";
import { buildSimilarSection } from "./similarSection.js";
import { setupSingleViewEvents } from "./events.js";

// =========================
// CREATE SINGLE FONT VIEW
// =========================
export function createSingleFontView({
  gridEl,
  listEl,
  discoverUniverseEl,
  filtersPanelEl,
  filtersBtnEl,
  getAllFonts,
}) {
  let singleFontView = document.getElementById("singleFontView");
  if (!singleFontView) {
    singleFontView = document.createElement("div");
    singleFontView.id = "singleFontView";
    singleFontView.style.display = "none";

    const mainEl = document.querySelector("main");
    mainEl.appendChild(singleFontView);
  }

  let lastScrollY = 0;
  let teardownController = null;
  let onCloseCallback = null;

  const uiStash = {
    filtersPanelDisplay: null,
    filtersBtnDisplay: null,
    headerBackDisplay: null,
    myCollectionsBarDisplay: null,
    searchBarDisplay: null,
    viewModeSectionDisplay: null,
    discoverUniverseDisplay: null,
    gridDisplay: null,
    listDisplay: null,
  };

  const headerBackBtn = document.getElementById("backToCollection");
  const myCollectionsBarEl = document.getElementById("my_collections_second_bar");
  const searchBarEl = document.getElementById("search_bar");
  const viewModeSectionEl = document.querySelector("#second_bar section");

  // =========================
  // OPEN VIEW
  // =========================
  function openSingleFontView() {
    lastScrollY = window.scrollY || 0;

    uiStash.filtersPanelDisplay = filtersPanelEl ? filtersPanelEl.style.display : null;
    uiStash.filtersBtnDisplay = filtersBtnEl ? filtersBtnEl.style.display : null;
    uiStash.headerBackDisplay = headerBackBtn ? headerBackBtn.style.display : null;
    uiStash.myCollectionsBarDisplay = myCollectionsBarEl ? myCollectionsBarEl.style.display : null;
    uiStash.searchBarDisplay = searchBarEl ? searchBarEl.style.display : null;
    uiStash.viewModeSectionDisplay = viewModeSectionEl ? viewModeSectionEl.style.display : null;
    uiStash.discoverUniverseDisplay = discoverUniverseEl ? discoverUniverseEl.style.display : null;
    uiStash.gridDisplay = gridEl ? gridEl.style.display : null;
    uiStash.listDisplay = listEl ? listEl.style.display : null;

    document.body.classList.add("single-font-open");

    if (discoverUniverseEl) discoverUniverseEl.style.display = "none";
    singleFontView.style.display = "block";

    if (filtersPanelEl) filtersPanelEl.style.display = "none";
    if (filtersBtnEl) filtersBtnEl.style.display = "none";
    if (headerBackBtn) headerBackBtn.style.display = "flex";
    if (myCollectionsBarEl) myCollectionsBarEl.style.display = "none";
    if (searchBarEl) searchBarEl.style.display = "none";
    if (viewModeSectionEl) viewModeSectionEl.style.display = "none";

    filtersBtnEl?.classList.remove("selected");

    teardownController?.abort();
    teardownController = new AbortController();
  }

  // =========================
  // CLOSE VIEW
  // =========================
  function closeSingleFontView() {
    teardownController?.abort();
    teardownController = null;

    singleFontView.innerHTML = "";
    singleFontView.style.display = "none";

    document.body.classList.remove("single-font-open");

    if (discoverUniverseEl) discoverUniverseEl.style.display = uiStash.discoverUniverseDisplay ?? "";
    if (filtersPanelEl) filtersPanelEl.style.display = uiStash.filtersPanelDisplay ?? "";
    if (filtersBtnEl) filtersBtnEl.style.display = uiStash.filtersBtnDisplay ?? "";
    if (headerBackBtn) headerBackBtn.style.display = uiStash.headerBackDisplay ?? "none";
    if (myCollectionsBarEl) myCollectionsBarEl.style.display = uiStash.myCollectionsBarDisplay ?? "";
    if (searchBarEl) searchBarEl.style.display = uiStash.searchBarDisplay ?? "";
    if (viewModeSectionEl) viewModeSectionEl.style.display = uiStash.viewModeSectionDisplay ?? "";
    if (gridEl) gridEl.style.display = uiStash.gridDisplay ?? "";
    if (listEl) listEl.style.display = uiStash.listDisplay ?? "none";

    window.scrollTo(0, lastScrollY);

    if (onCloseCallback) {
      onCloseCallback();
    }
  }

  // =========================
  // SETUP BACK BUTTON
  // =========================
  function setupBackButton(signal) {
    if (headerBackBtn && signal) {
      headerBackBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const existingPairBox = singleFontView.querySelector("#pair-box-wrapper");
        if (existingPairBox) existingPairBox.remove();

        const pairFace = document.getElementById("pair-font-face");
        if (pairFace) pairFace.textContent = "";

        closeSingleFontView();
      }, { signal });
    }
  }

  // =========================
  // SHOW SINGLE FONT
  // =========================
  async function showSingleFont(font) {
    const isAlreadyOpen = singleFontView.style.display === "block";
    if (!isAlreadyOpen) openSingleFontView();

    const hasAllCaps = font.tags?.includes("All Caps");
    const globalText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
    const displayText = hasAllCaps ? globalText.toUpperCase() : globalText;

    const allFonts = getAllFonts();

    const controlsDiv = document.createElement("div");
    controlsDiv.className = "bar_individual_font force-visible-controls";
    controlsDiv.innerHTML = renderControlsBar({ isPair: false });

    const listDiv = document.createElement("div");
    listDiv.className = "list_individual";
    listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

    const tagsHTML = renderFontTags(font);
    listDiv.innerHTML = renderListIndividual(font, displayText, tagsHTML);

    const pairDiv = document.createElement("div");
    pairDiv.className = "pair-wrapper";
    pairDiv.innerHTML = renderPairWrapper();

    await populatePairCollections(pairDiv, font, allFonts);

    const similarSection = await buildSimilarSection({
      currentFont: font,
      fontsAll: allFonts,
      onOpenFont: showSingleFont,
      onOpenPairSuggestion: (headingFont, bodyFont) => {
        showSingleFontWithPair(headingFont, bodyFont);
      },
    });

    teardownController?.abort();
    teardownController = new AbortController();

    singleFontView.innerHTML = "";
    singleFontView.appendChild(controlsDiv);
    singleFontView.appendChild(listDiv);

    const singleSaveMenu = listDiv.querySelector(".save_list");
    populateSaveCollections(singleSaveMenu, font._id);

    singleFontView.appendChild(pairDiv);
    singleFontView.appendChild(similarSection);

    setupSingleViewEvents({
      controlsContainer: controlsDiv,
      displayContainer: listDiv,
      pairContainer: pairDiv,
      font,
      signal: teardownController.signal,
      singleFontView,
      getAllFonts,
      filtersPanelEl,
      filtersBtnEl,
      gridEl,
      listEl,
      closeSingleFontView
    });

    setupBackButton(teardownController.signal);
  }

  // =========================
  // SHOW SINGLE FONT WITH PAIR
  // =========================
  async function showSingleFontWithPair(headingFont, bodyFont) {
    const isAlreadyOpen = singleFontView.style.display === "block";
    if (!isAlreadyOpen) openSingleFontView();

    ensureFontFace(headingFont);
    ensureFontFace(bodyFont);

    const hasAllCaps = headingFont.tags?.includes("All Caps");
    const globalText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
    const displayText = hasAllCaps ? globalText.toUpperCase() : globalText;

    const allFonts = getAllFonts();

    const controlsDiv = document.createElement("div");
    controlsDiv.className = "bar_individual_font force-visible-controls";
    controlsDiv.innerHTML = renderControlsBar({ isPair: false });

    const listDiv = document.createElement("div");
    listDiv.className = "list_individual";
    listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

    const tagsHTML = renderFontTags(headingFont);
    listDiv.innerHTML = renderListIndividual(headingFont, displayText, tagsHTML);

    teardownController?.abort();
    teardownController = new AbortController();
    const signal = teardownController.signal;

    const pairBox = createPairControlsBox(bodyFont, signal);

    const pairDiv = document.createElement("div");
    pairDiv.className = "pair-wrapper";
    pairDiv.innerHTML = renderPairWrapper();

    await populatePairCollections(pairDiv, headingFont, allFonts);

    const similarSection = await buildSimilarSection({
      currentFont: headingFont,
      fontsAll: allFonts,
      onOpenFont: showSingleFont,
      onOpenPairSuggestion: (newHeadingFont, newBodyFont) => {
        showSingleFontWithPair(newHeadingFont, newBodyFont);
      },
    });

    singleFontView.innerHTML = "";
    singleFontView.appendChild(controlsDiv);
    singleFontView.appendChild(listDiv);

    const pairSaveMenu = listDiv.querySelector(".save_list");
    populateSaveCollections(pairSaveMenu, headingFont._id);

    singleFontView.appendChild(pairBox);
    singleFontView.appendChild(pairDiv);
    singleFontView.appendChild(similarSection);

    setupSingleViewEvents({
      controlsContainer: controlsDiv,
      displayContainer: listDiv,
      pairContainer: pairDiv,
      font: headingFont,
      signal,
      singleFontView,
      getAllFonts,
      filtersPanelEl,
      filtersBtnEl,
      gridEl,
      listEl,
      closeSingleFontView
    });

    const removePairBtn = pairBox.querySelector(".remove-pair-btn");
    removePairBtn?.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      pairBox.remove();
      const pairFace = document.getElementById("pair-font-face");
      if (pairFace) pairFace.textContent = "";
    }, { signal });

    setupBackButton(signal);
  }

  return {
    showSingleFont,
    closeSingleFontView,
    setOnClose: (fn) => {
      onCloseCallback = fn;
    },
  };
}
