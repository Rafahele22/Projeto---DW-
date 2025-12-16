import { fetchFonts } from "./fontsApi.js";
import { filterArticles, filterListItems } from "./filtering.js";
import { initFiltersUI } from "./filtersUi.js";
import { setAllFonts, getAllFonts, getGlobalSampleText, setGlobalSampleText } from "./state.js";
import { setupViewModeToggle } from "./viewMode.js";
import { generateGridArticles } from "./views/gridView.js";
import { generateListItems } from "./views/listView.js";
import { createSingleFontView } from "./views/singleFontView.js";

async function main() {
  const abaCollections = document.getElementById("abaCollections");
  const userLoggedIn = localStorage.getItem("user") !== null;

  if (abaCollections) {
    abaCollections.style.display = userLoggedIn ? "" : "none";
  }

  const gridEl = document.querySelector(".grid.grid_view");
  const filtersBtn = document.querySelector("#filters_btn");
  const filtersPanel = document.querySelector("#filters");
  const closeFiltersBtn = document.querySelector("#close_filters");
  const removeAllFiltersBtn = document.querySelector("#remove_all_filters");
  const tagsContainer = document.querySelector("#tags");

  const singleFont = createSingleFontView({
    gridEl,
    filtersPanelEl: filtersPanel,
    filtersBtnEl: filtersBtn,
    getAllFonts,
  });

  const filtersUI = initFiltersUI({
    gridEl,
    filtersBtn,
    filtersPanel,
    closeFiltersBtn,
    removeAllFiltersBtn,
  });

  // =========================
  // LOAD JSON AND BUILD UI
  // =========================
  try {
    const fonts = await fetchFonts();
    setAllFonts(fonts);

    // precompute tags + foundries (same logic as before)
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

    // Build list + grid
    if (gridEl) {
      generateListItems({
        gridEl,
        fonts,
        onOpenFont: singleFont.showSingleFont,
        getGlobalSampleText,
        setGlobalSampleText,
      });

      const articles = generateGridArticles({
        gridEl,
        fonts,
        onOpenFont: singleFont.showSingleFont,
      });

      // View mode buttons
      const gridViewBtn = document.querySelector("#view_mode_selected");
      const listViewBtn = document.querySelector("#second_bar section a:last-of-type");
      const mainGrid = document.querySelector(".grid.grid_view");

      // Filtering function (needs isGridView)
      let getIsGridView = () => true;

      function filterFonts() {
        const { selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables } = filtersUI.getSelections();

        let visibleCount = 0;
        if (getIsGridView()) {
          visibleCount = filterArticles({
            selectedTags,
            selectedFoundries,
            selectedFamilySizes,
            selectedVariables,
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
        onToggle: () => filterFonts(),
      });
      getIsGridView = viewMode.getIsGridView;

      // Wire filters UI
      filtersUI.populateTags({ tagsContainer, allTags, onChange: filterFonts });
      filtersUI.populateFoundries({ foundries: foundriesList, onChange: filterFonts });
      filtersUI.wireSingleSelectSections({ onChange: filterFonts });

      filtersUI.setupPanelOpenClose({
        onClose: () => {},
        onOpen: () => {},
      });

      filtersUI.wireRemoveAll({ onRemoveAll: filterFonts });

      // Initial state: list items hidden, articles shown
      document.querySelectorAll(".list").forEach((listItem) => {
        listItem.style.display = "none";
      });

      document.querySelectorAll("article").forEach((article) => {
        article.style.display = "block";
      });

      // Set initial card heights (keep same behavior)
      function setInitialCardHeights() {
        if (!articles.length) return;

        for (const c of articles) c.style.height = "auto";

        let initialMaxHeight = 0;
        for (const c of articles) {
          const height = c.offsetHeight;
          if (height > initialMaxHeight) initialMaxHeight = height;
        }

        for (const c of articles) c.style.height = initialMaxHeight + "px";
      }

      setTimeout(() => {
        setInitialCardHeights();
        filtersUI.updateCounter();
      }, 100);

      window.addEventListener("resize", () => {
        for (const c of articles) c.style.height = "auto";

        let newMax = 0;
        for (const c of articles) {
          const height = c.offsetHeight;
          if (height > newMax) newMax = height;
        }

        for (const c of articles) c.style.height = newMax + "px";
      });
    }
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

main();
