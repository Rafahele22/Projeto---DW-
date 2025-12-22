import { fetchFonts } from "./fontsApi.js";
import { filterFonts } from "./filtering.js";
import {
  setAllFonts,
  getAllFonts,
  getGlobalSampleText,
  setGlobalSampleText,
  setFavoriteFontIds,
} from "./state.js";
import { setupViewModeToggle } from "./viewMode.js";
import { generateGridArticles } from "./views/gridView.js";
import { generateListItems } from "./views/listView.js";
import { createSingleFontView } from "./views/singleFontView/index.js";

import {
  setupCollectionsNav,
  setUserCollections,
  setAllFontsReference,
} from "./collections.js";
import { equalizeGridCardHeights } from "./shared/gridUtils.js";
import { hide, show, showFlex } from "./shared/displayUtils.js";
import { initializeApp } from "./htmlGenerator.js";

if (navigator.userAgent.toLowerCase().includes("electron")) {
  document.body.classList.add("is-electron");

  if (navigator.userAgent.toLowerCase().includes("mac")) {
    document.body.classList.add("is-mac");
  } else {
    document.body.classList.add("is-windows");
  }
}

async function main() {
  initializeApp();
  
  await Promise.all([
    new Promise((resolve) => {
      const script1 = document.createElement('script');
      script1.src = 'js/auth.js';
      script1.onload = resolve;
      document.head.appendChild(script1);
    }),
    new Promise((resolve) => {
      const script2 = document.createElement('script');
      script2.src = 'js/interactions.js';
      script2.onload = resolve;
      document.head.appendChild(script2);
    })
  ]);
  
  if (window.AuthManager) {
    window.AuthManager.init();
  }
  if (window.initInteractions) {
    window.initInteractions();
  }
  
  const loadingScreen = document.getElementById("loading-screen");

  function hideLoadingScreen() {
    if (!loadingScreen) return;

    loadingScreen.classList.add("is-hidden");
    setTimeout(() => loadingScreen.remove(), 300);
  }

  try {
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

    const discoverUniverse = document.getElementById("discover-universe");
    const collectionsUniverse = document.getElementById("collections-universe");
    const gridUniverse = document.getElementById("grid-universe");
    const listUniverse = document.getElementById("list-universe");
    const filtersBtn = document.querySelector("#filters_btn");
    const filtersPanel = document.querySelector("#filters");
    const closeFiltersBtn = document.querySelector("#close_filters");
    const removeAllFiltersBtn = document.querySelector("#remove_all_filters");
    const searchMountEl = document.querySelector("#search_bar");
    const filtersMountEl = document.querySelector("#filters_react_root");
    const filtersCountBubble = document.querySelector("#filters_count");

    let lastFilterParams = {
      selectedTags: [],
      selectedFoundries: [],
      selectedFamilySizes: [],
      selectedVariables: [],
    };

    function computeActiveFiltersCount(p) {
      const tagsCount = Array.isArray(p.selectedTags) ? p.selectedTags.length : 0;
      const foundryCount = (p.selectedFoundries?.length ?? 0) > 0 ? 1 : 0;
      const familyCount = (p.selectedFamilySizes?.length ?? 0) > 0 ? 1 : 0;
      const variableCount = (p.selectedVariables?.length ?? 0) > 0 ? 1 : 0;
      return tagsCount + foundryCount + familyCount + variableCount;
    }

    function isFiltersPanelOpen() {
      if (!filtersPanel) return false;
      return getComputedStyle(filtersPanel).display !== "none";
    }

    function updateFiltersCounter() {
      if (!filtersCountBubble) return;

      const count = computeActiveFiltersCount(lastFilterParams);

      if (count > 0 && !isFiltersPanelOpen()) {
        filtersCountBubble.style.display = "flex";
        filtersCountBubble.textContent = String(count);
      } else {
        filtersCountBubble.style.display = "none";
        filtersCountBubble.textContent = "";
      }
    }

    if (filtersCountBubble) {
      filtersCountBubble.style.display = "none";
      filtersCountBubble.textContent = "";
    }

    const singleFont = createSingleFontView({
      gridEl: gridUniverse,
      listEl: listUniverse,
      discoverUniverseEl: discoverUniverse,
      filtersPanelEl: filtersPanel,
      filtersBtnEl: filtersBtn,
      getAllFonts,
    });

    const openFontFromDiscover = (font) => {
      singleFont.setOnClose(null);
      singleFont.showSingleFont(font);
    };

    hide(filtersPanel);

    const closeFiltersPanel = () => {
      hide(filtersPanel);
      gridUniverse?.classList.remove("shifted");
      listUniverse?.classList.remove("shifted");
      filtersBtn?.classList.remove("selected");

      updateFiltersCounter();
    };

    filtersBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = filtersPanel?.style?.display === "flex";
      if (isOpen) {
        closeFiltersPanel();
      } else {
        showFlex(filtersPanel);
        gridUniverse?.classList.add("shifted");
        listUniverse?.classList.add("shifted");
        filtersBtn.classList.add("selected");

        if (filtersCountBubble) {
          filtersCountBubble.style.display = "none";
          filtersCountBubble.textContent = "";
        }
      }
    });

    closeFiltersBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      closeFiltersPanel();
    });

    document.addEventListener("click", (e) => {
      if (!filtersPanel || !filtersBtn) return;
      if (filtersPanel.contains(e.target) || filtersBtn.contains(e.target)) return;
      closeFiltersPanel();
    });

    let collectionsNav = null;

    try {
      const fonts = await fetchFonts();
      setAllFonts(fonts);
      setAllFontsReference(fonts);

      try {
        const userId = user?._id ?? user?.userId ?? user?.id;
        if (userId) {
          const collectionsUrl = `http://web-dev-grupo05.dei.uc.pt/api/collections?userId=${encodeURIComponent(
            userId
          )}`;
          const collectionsRes = await fetch(collectionsUrl);
          const collectionsData = await collectionsRes.json().catch(() => []);
          if (collectionsRes.ok) {
            setUserCollections(collectionsData);

            const favCollection = collectionsData.find(
              (c) => c.name === "Favourites" && c.type === "fonts"
            );
            if (favCollection && Array.isArray(favCollection.items)) {
              const favIds = favCollection.items
                .map((item) => String(item.fontId))
                .filter(Boolean);
              setFavoriteFontIds(favIds);
            }
          }
        } else {
          setFavoriteFontIds([]);
        }
      } catch (_) {
        setFavoriteFontIds([]);
      }

      collectionsNav = setupCollectionsNav({
        onOpenFont: singleFont.showSingleFont,
        singleFontController: singleFont,
      });

      window.__collectionsNav = collectionsNav;

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

      if (gridUniverse && listUniverse) {
        generateListItems({
          gridEl: listUniverse,
          fonts,
          onOpenFont: openFontFromDiscover,
          getGlobalSampleText,
          setGlobalSampleText,
        });

        generateGridArticles({
          gridEl: gridUniverse,
          fonts,
          onOpenFont: openFontFromDiscover,
        });

        const gridViewBtn = document.querySelector("#view_mode_selected");
        const listViewBtn = document.querySelector(
          "#second_bar section a:last-of-type"
        );

        let currentFilterParams = {};

        const doEqualizeHeights = () =>
          equalizeGridCardHeights(gridUniverse, viewMode.getIsGridView());

        const doFilterFonts = (params = {}) => {
          currentFilterParams = { ...currentFilterParams, ...params };
          const isGrid = viewMode.getIsGridView();
          filterFonts({
            gridEl: isGrid ? gridUniverse : listUniverse,
            fonts,
            isGridView: isGrid,
            filterParams: currentFilterParams,
          });
        };

        const viewMode = setupViewModeToggle({
          gridViewBtn,
          listViewBtn,
          gridUniverse,
          listUniverse,
          filtersPanel,
          onToggle: () => {
            doFilterFonts();
            doEqualizeHeights();
          },
        });

        singleFont.setOnClose(() => {
          doEqualizeHeights();
          updateFiltersCounter();
        });

        collectionsNav?.setOnEnterDiscover?.(() => {
          viewMode.syncFromActualMode();
          doEqualizeHeights();
        });

        doEqualizeHeights();
        window.addEventListener("resize", doEqualizeHeights);

        const logoLink = document.getElementById("logo")?.closest("a");
        logoLink?.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          singleFont.closeSingleFontView();
          collectionsNav?.resetToHome?.();
          closeFiltersPanel();
          viewMode.setGridView();

          doEqualizeHeights();
          window.scrollTo(0, 0);
        });

        const mount = window.mountFiltersAndSearch;
        if (typeof mount !== "function") {
          throw new Error(
            "React JSX mount function not found (window.mountFiltersAndSearch)"
          );
        }

        const reactApi = mount({
          searchMountEl,
          filtersMountEl,
          allTags,
          foundries: foundriesList,
          onChange: (params) => {
            lastFilterParams = params;

            doFilterFonts(params);
            doEqualizeHeights();

            updateFiltersCounter();
          },
        });

        removeAllFiltersBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          reactApi.clearAll();
          doEqualizeHeights();

          lastFilterParams = {
            selectedTags: [],
            selectedFoundries: [],
            selectedFamilySizes: [],
            selectedVariables: [],
          };
          updateFiltersCounter();
        });

        updateFiltersCounter();
      }
    } catch (err) {
      console.error("Error loading JSON:", err);
    }
  } finally {
    requestAnimationFrame(() => hideLoadingScreen());
  }
}

main();