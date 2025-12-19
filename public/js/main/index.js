import { fetchFonts } from "./fontsApi.js";
import { filterArticles, filterListItems } from "./filtering.js";
import {
  setAllFonts,
  getAllFonts,
  getGlobalSampleText,
  setGlobalSampleText,
} from "./state.js";
import { setupViewModeToggle } from "./viewMode.js";
import { generateGridArticles } from "./views/gridView.js";
import { generateListItems } from "./views/listView.js";
import { createSingleFontView } from "./views/singleFontView.js";
import {
  setupCollectionsNav,
  setUserCollections,
  setAllFontsReference,
} from "./collections.js";

if (navigator.userAgent.toLowerCase().includes('electron')) {
  document.body.classList.add('is-electron');
  
  if (navigator.userAgent.toLowerCase().includes('mac')) {
    document.body.classList.add('is-mac');
  } else {
    document.body.classList.add('is-windows');
  }
}

async function main() {
  const abaCollections = document.getElementById("abaCollections");
  const userLoggedIn = localStorage.getItem("user") !== null;

  let user = null;
  try {
    const raw = localStorage.getItem("user");
    user = raw ? JSON.parse(raw) : null;
  } catch (_) {
    user = null;
  }

  if (abaCollections) {
    abaCollections.style.display = userLoggedIn ? "" : "none";
  }

  const gridEl = document.querySelector(".grid.grid_view");
  const filtersBtn = document.querySelector("#filters_btn");
  const filtersPanel = document.querySelector("#filters");
  const closeFiltersBtn = document.querySelector("#close_filters");
  const removeAllFiltersBtn = document.querySelector("#remove_all_filters");
  const searchMountEl = document.querySelector("#search_bar");
  const filtersMountEl = document.querySelector("#filters_react_root");

  const singleFont = createSingleFontView({
    gridEl,
    filtersPanelEl: filtersPanel,
    filtersBtnEl: filtersBtn,
    getAllFonts,
  });

  // =========================
  // FILTERS PANEL OPEN/CLOSE
  // =========================
  if (filtersPanel) {
    filtersPanel.style.display = "none";
  }

  filtersBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyOpen = filtersPanel?.style?.display === "flex";
    const newStateOpen = !isCurrentlyOpen;

    if (filtersPanel) filtersPanel.style.display = newStateOpen ? "flex" : "none";
    gridEl?.classList.toggle("shifted", newStateOpen);
    filtersBtn.classList.toggle("selected", newStateOpen);
  });

  closeFiltersBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (filtersPanel) filtersPanel.style.display = "none";
    gridEl?.classList.remove("shifted");
    filtersBtn?.classList.remove("selected");
  });

  document.addEventListener("click", (e) => {
    if (!filtersPanel || !filtersBtn) return;
    if (filtersPanel.contains(e.target) || filtersBtn.contains(e.target)) return;

    filtersPanel.style.display = "none";
    gridEl?.classList.remove("shifted");
    filtersBtn.classList.remove("selected");
  });

  // =========================
  // LOAD DATA
  // =========================
  let collectionsNav = null;

  try {
    const fonts = await fetchFonts();
    setAllFonts(fonts);
    setAllFontsReference(fonts);

    try {
      const userId = user?._id ?? user?.userId ?? user?.id;
      const collectionsUrl = userId
        ? `http://localhost:4000/api/collections?userId=${encodeURIComponent(userId)}`
        : "http://localhost:4000/api/collections";
      const collectionsRes = await fetch(collectionsUrl);
      const collectionsData = await collectionsRes.json().catch(() => []);
      if (collectionsRes.ok) {
        setUserCollections(collectionsData);
      }
    } catch (_) {}

    collectionsNav = setupCollectionsNav();

    // =========================
    // BUILD TAGS / FOUNDRIES LIST
    // =========================
    const allTags = [];
    const foundriesMap = {};

    for (const font of fonts) {
      if (font.tags && Array.isArray(font.tags)) {
        for (const tag of font.tags) {
          if (!allTags.includes(tag)) allTags.push(tag);
        }
      }

      if (font.foundry && font.foundry !== "Unknown") {
        foundriesMap[font.foundry] = (foundriesMap[font.foundry] || 0) + 1;
      }
    }

    const foundriesList = Object.entries(foundriesMap)
      .filter(([_, count]) => count >= 2)
      .map(([foundry]) => foundry)
      .sort();

    allTags.sort();

    // =========================
    // BUILD UI
    // =========================
    if (gridEl) {
      generateListItems({
        gridEl,
        fonts,
        onOpenFont: singleFont.showSingleFont,
        getGlobalSampleText,
        setGlobalSampleText,
      });

      generateGridArticles({
        gridEl,
        fonts,
        onOpenFont: singleFont.showSingleFont,
      });

      const gridViewBtn = document.querySelector("#view_mode_selected");
      const listViewBtn = document.querySelector("#second_bar section a:last-of-type");
      const mainGrid = document.querySelector(".grid");

      let getIsGridView = () => true;

      function equalizeGridCardHeights() {
        if (!getIsGridView()) return;

        const cards = Array.from(gridEl.querySelectorAll("article"));
        if (!cards.length) return;

        if (!cards.some((c) => c.offsetHeight > 0)) return;

        cards.forEach((c) => (c.style.height = "auto"));

        requestAnimationFrame(() => {
          let max = 0;
          for (const c of cards) {
            const h = c.offsetHeight;
            if (h > max) max = h;
          }
          if (max > 0) cards.forEach((c) => (c.style.height = max + "px"));
        });
      }

      function filterFonts({
        searchQuery = "",
        selectedTags = [],
        selectedFoundries = [],
        selectedFamilySizes = [],
        selectedVariables = [],
      } = {}) {
        let visibleCount = 0;

        if (getIsGridView()) {
          visibleCount = filterArticles({
            selectedTags,
            selectedFoundries,
            selectedFamilySizes,
            selectedVariables,
            searchQuery,
            fonts,
          });

          document.querySelectorAll(".list").forEach((listItem) => {
            listItem.style.display = "none";
          });
        } else {
          visibleCount = filterListItems({
            selectedTags,
            selectedFoundries,
            selectedFamilySizes,
            selectedVariables,
            searchQuery,
            fonts,
          });

          document.querySelectorAll("article").forEach((article) => {
            article.style.display = "none";
          });
        }

        const noResults = document.getElementById("no_results");
        if (noResults) {
          noResults.style.display = visibleCount === 0 ? "block" : "none";
        }
      }

      const viewMode = setupViewModeToggle({
        gridViewBtn,
        listViewBtn,
        mainGrid,
        filtersPanel,
        onToggle: () => {
          filterFonts();
          equalizeGridCardHeights();
        },
      });
      getIsGridView = viewMode.getIsGridView;

      document.querySelectorAll(".list").forEach((listItem) => {
        listItem.style.display = "none";
      });
      document.querySelectorAll("article").forEach((article) => {
        article.style.display = "block";
      });

      equalizeGridCardHeights();
      window.addEventListener("resize", () => {
        equalizeGridCardHeights();
      });

      // =========================
      // LOGO
      // =========================
      const logoLink = document.getElementById("logo")?.closest("a");
      logoLink?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        singleFont.closeSingleFontView();
        collectionsNav?.resetToHome?.();

        if (filtersPanel) filtersPanel.style.display = "none";
        gridEl?.classList.remove("shifted");
        filtersBtn?.classList.remove("selected");

        viewMode.setGridView();

        document.querySelectorAll(".list").forEach((li) => (li.style.display = "none"));
        document.querySelectorAll("article").forEach((a) => (a.style.display = "block"));

        equalizeGridCardHeights();
        window.scrollTo(0, 0);
      });

      // =========================
      // FILTERS + SEARCH
      // =========================
      const mount = window.mountFiltersAndSearch;
      if (typeof mount !== "function") {
        throw new Error("React JSX mount function not found (window.mountFiltersAndSearch)");
      }

      const reactApi = mount({
        searchMountEl,
        filtersMountEl,
        allTags,
        foundries: foundriesList,
        onChange: ({
          searchQuery,
          selectedTags,
          selectedFoundries,
          selectedFamilySizes,
          selectedVariables,
        }) => {
          filterFonts({
            searchQuery,
            selectedTags,
            selectedFoundries,
            selectedFamilySizes,
            selectedVariables,
          });
          equalizeGridCardHeights();
        },
      });

      removeAllFiltersBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        reactApi.clearAll();
        equalizeGridCardHeights();
      });
    }
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

main();