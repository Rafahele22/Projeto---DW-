let userCollections = [];
let allFontsRef = [];

import { getGlobalSampleText, setGlobalSampleText } from "./state.js";

export function setUserCollections(collections) {
  userCollections = Array.isArray(collections) ? collections : [];
}

export function setAllFontsReference(fonts) {
  allFontsRef = Array.isArray(fonts) ? fonts : [];
}

export function setupCollectionsNav(options = {}) {
  const onOpenFont = typeof options.onOpenFont === "function" ? options.onOpenFont : null;

  const nav = document.querySelector("header nav");
  const collectionsBtn = document.getElementById("abaCollections");
  const discoverBtn = nav?.querySelector('a.button:not(#abaCollections)');

  const mainEl = document.querySelector("main");

  const secondBar = document.getElementById("second_bar");
  const myCollectionsBar = document.getElementById("my_collections_second_bar");

  const filtersBtn = document.getElementById("filters_btn");
  const searchBar = document.getElementById("search_bar");
  const backToCollection = document.getElementById("backToCollection");

  const viewModeSection = secondBar?.querySelector("section");
  const viewModeBtns = viewModeSection ? Array.from(viewModeSection.querySelectorAll("a")) : [];
  const gridModeBtn = viewModeBtns[0] || null;
  const listModeBtn = viewModeBtns[1] || null;

  const filtersPanel = document.getElementById("filters");
  const gridEl = document.querySelector(".grid.grid_view");
  const noResultsEl = document.getElementById("no_results");

  if (!nav || !collectionsBtn || !discoverBtn || !mainEl || !myCollectionsBar || !gridEl) return;

  // =========================
  // NAV ICONS 
  // =========================
  const ICONS = {
    discover: {
      normal: "../assets/imgs/search.svg",
      selected: "../assets/imgs/search_selected.svg",
    },
    collections: {
      normal: "../assets/imgs/collections.svg",
      selected: "../assets/imgs/collections_selected.svg",
    },
  };

  function updateNavIcons() {
    const discoverImg = discoverBtn?.querySelector("img");
    const collectionsImg = collectionsBtn?.querySelector("img");

    if (discoverImg) {
      discoverImg.setAttribute(
        "src",
        discoverBtn.classList.contains("selected")
          ? ICONS.discover.selected
          : ICONS.discover.normal
      );
    }

    if (collectionsImg) {
      collectionsImg.setAttribute(
        "src",
        collectionsBtn.classList.contains("selected")
          ? ICONS.collections.selected
          : ICONS.collections.normal
      );
    }
  }

  function setSelected(activeBtn) {
    nav.querySelectorAll("a.button").forEach((a) => a.classList.remove("selected"));
    activeBtn.classList.add("selected");
    updateNavIcons();
  }

  // =========================
  // SECOND BAR
  // =========================
  const collectionsTabs = Array.from(myCollectionsBar.querySelectorAll("a.button"));
  const albumsTab = collectionsTabs[0] || null;
  const pairsTab = collectionsTabs[1] || null;

  const COLLECTIONS_TAB_ICONS = {
    normal: "../assets/imgs/collections.svg",
    selected: "../assets/imgs/collections_selected.svg",
  };

  function setCollectionsTabSelected(activeTab) {
    if (!albumsTab || !pairsTab) return;

    [albumsTab, pairsTab].forEach((btn) => btn.classList.remove("selected"));
    activeTab.classList.add("selected");

    const albumsImg = albumsTab.querySelector("img");
    const pairsImg = pairsTab.querySelector("img");

    if (albumsImg) {
      albumsImg.setAttribute(
        "src",
        albumsTab.classList.contains("selected")
          ? COLLECTIONS_TAB_ICONS.selected
          : COLLECTIONS_TAB_ICONS.normal
      );
    }

    if (pairsImg) {
      pairsImg.setAttribute(
        "src",
        pairsTab.classList.contains("selected")
          ? COLLECTIONS_TAB_ICONS.selected
          : COLLECTIONS_TAB_ICONS.normal
      );
    }
  }

  const secondBarDefaults = new Map();
  [myCollectionsBar, filtersBtn, searchBar, backToCollection, viewModeSection].forEach((el) => {
    if (el) secondBarDefaults.set(el, el.style.display);
  });

  const mainChildren = Array.from(mainEl.children);
  const mainDefaults = new Map(mainChildren.map((el) => [el, el.style.display]));

  function hideMainCompletely() {
    Array.from(mainEl.children).forEach((child) => {
      child.style.display = "none";
    });
  }

  function restoreMainBaseVisibility() {
    Array.from(mainEl.children).forEach((child) => {
      child.style.display = mainDefaults.get(child) ?? "";
    });
  }

  function restoreDiscoverSecondBar() {
    myCollectionsBar.style.display = secondBarDefaults.get(myCollectionsBar) ?? "none";

    if (filtersBtn) filtersBtn.style.display = secondBarDefaults.get(filtersBtn) ?? "";
    if (searchBar) searchBar.style.display = secondBarDefaults.get(searchBar) ?? "";
    if (backToCollection)
      backToCollection.style.display = secondBarDefaults.get(backToCollection) ?? "none";
    if (viewModeSection)
      viewModeSection.style.display = secondBarDefaults.get(viewModeSection) ?? "";
  }

  const discoverStashEl = document.createElement("div");

  let discoverWasGridView = true;
  let activeCollectionsTab = "albums";
  let openedCollectionId = null;
  let collectionsReact = null;
  let isInCollectionsDetail = false;

  function ensureCollectionsReactMounted() {
    if (collectionsReact) return collectionsReact;
    const mount = window.mountCollections;
    if (typeof mount !== "function") {
      throw new Error("Collections JSX mount function not found (window.mountCollections)");
    }

    collectionsReact = mount({
      mountEl: gridEl,
      getGlobalSampleText,
      setGlobalSampleText,
      onSelectCollection: (id) => {
        openedCollectionId = String(id);
        isInCollectionsDetail = true;
        showCollectionsListBar();
        attachCollectionsViewModeInterceptors();
        setCollectionsViewMode("list");
        collectionsReact?.update?.({
          view: "collection",
          openedCollectionId,
          collectionViewMode: "list",
        });
        window.scrollTo(0, 0);
      },
      onOpenFont: (font) => onOpenFont?.(font),
    });

    return collectionsReact;
  }

  function stashDiscoverGridNodes() {
    if (!gridEl || gridEl.childNodes.length === 0) return;

    discoverWasGridView =
      gridEl.classList.contains("grid_view") && !gridEl.classList.contains("list_view");

    discoverStashEl.replaceChildren(...gridEl.childNodes);
  }

  function restoreDiscoverGridNodes() {
    if (!discoverStashEl || discoverStashEl.childNodes.length === 0) return;

    collectionsReact?.unmount?.();
    collectionsReact = null;

    gridEl.replaceChildren(...discoverStashEl.childNodes);

    if (discoverWasGridView) {
      gridEl.classList.add("grid_view");
      gridEl.classList.remove("list_view");
    } else {
      gridEl.classList.add("list_view");
      gridEl.classList.remove("grid_view");
    }
  }

  function setGridAsAlbumsLayout() {
    gridEl.classList.add("grid_view");
    gridEl.classList.remove("list_view");
    gridEl.style.display = "grid";
  }

  function setGridAsListLayout() {
    gridEl.classList.add("list_view");
    gridEl.classList.remove("grid_view");
    gridEl.style.display = "";
  }

  function setCollectionsViewMode(mode) {
    const isGrid = mode === "grid";

    if (isGrid) {
      setGridAsAlbumsLayout();
      if (gridModeBtn) gridModeBtn.id = "view_mode_selected";
      if (listModeBtn) listModeBtn.id = "";
      const gridImg = gridModeBtn?.querySelector("img");
      const listImg = listModeBtn?.querySelector("img");
      if (gridImg) gridImg.src = "../assets/imgs/grid_selected.svg";
      if (listImg) listImg.src = "../assets/imgs/list.svg";
    } else {
      setGridAsListLayout();
      if (gridModeBtn) gridModeBtn.id = "";
      if (listModeBtn) listModeBtn.id = "view_mode_selected";
      const gridImg = gridModeBtn?.querySelector("img");
      const listImg = listModeBtn?.querySelector("img");
      if (gridImg) gridImg.src = "../assets/imgs/grid.svg";
      if (listImg) listImg.src = "../assets/imgs/list_selected.svg";
    }

    collectionsReact?.update?.({
      collectionViewMode: isGrid ? "grid" : "list",
    });
  }

  function attachCollectionsViewModeInterceptors() {
    if (!gridModeBtn || !listModeBtn) return;
    if (gridModeBtn.__collectionsBound || listModeBtn.__collectionsBound) return;

    const handler = (mode) => (e) => {
      if (!isInCollectionsDetail) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setCollectionsViewMode(mode);
    };

    gridModeBtn.addEventListener("click", handler("grid"), true);
    listModeBtn.addEventListener("click", handler("list"), true);

    gridModeBtn.__collectionsBound = true;
    listModeBtn.__collectionsBound = true;
  }

  function showCollectionsListBar() {
    if (myCollectionsBar) myCollectionsBar.style.display = "none";
    if (backToCollection) backToCollection.style.display = "";
    if (filtersBtn) filtersBtn.style.display = "none";
    if (searchBar) searchBar.style.display = "none";
    if (viewModeSection) viewModeSection.style.display = "";
  }

  function showCollectionsTabsBar() {
    if (myCollectionsBar) myCollectionsBar.style.display = "flex";
    if (backToCollection) backToCollection.style.display = "none";
    if (filtersBtn) filtersBtn.style.display = "none";
    if (searchBar) searchBar.style.display = "none";
    if (viewModeSection) viewModeSection.style.display = "none";
  }

  function renderCollectionsHome(tab) {
    const safeTab = tab === "pairs" ? "pairs" : "albums";

    hideMainCompletely();
    showCollectionsTabsBar();
    setGridAsAlbumsLayout();
    if (noResultsEl) noResultsEl.style.display = "none";

    openedCollectionId = null;
    isInCollectionsDetail = false;
    ensureCollectionsReactMounted().update({
      view: safeTab,
      activeTab: safeTab,
      openedCollectionId: null,
      collectionViewMode: "list",
      collections: userCollections,
      fonts: allFontsRef,
    });
  }

  // =========================
  // ROUTES
  // =========================
  function enterCollections() {
    setSelected(collectionsBtn);

    if (filtersPanel) filtersPanel.style.display = "none";
    gridEl.classList.remove("shifted");
    filtersBtn?.classList.remove("selected");

    document.body.classList.remove("single-font-open");

    stashDiscoverGridNodes();

    attachCollectionsViewModeInterceptors();

    const tab = activeCollectionsTab === "pairs" ? "pairs" : "albums";
    setCollectionsTabSelected(tab === "pairs" ? pairsTab || myCollectionsBar : albumsTab || myCollectionsBar);
    renderCollectionsHome(tab);

    isInCollectionsDetail = false;

    window.scrollTo(0, 0);
  }

  function enterDiscover() {
    setSelected(discoverBtn);

    collectionsReact?.unmount?.();
    collectionsReact = null;

    restoreMainBaseVisibility();
    restoreDiscoverGridNodes();
    restoreDiscoverSecondBar();

    isInCollectionsDetail = false;

    window.scrollTo(0, 0);
  }

  collectionsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    enterCollections();
  });

  discoverBtn.addEventListener("click", (e) => {
    e.preventDefault();
    enterDiscover();
  });

  albumsTab?.addEventListener("click", (e) => {
    e.preventDefault();
    activeCollectionsTab = "albums";
    openedCollectionId = null;
    isInCollectionsDetail = false;
    setCollectionsTabSelected(albumsTab);
    renderCollectionsHome("albums");
  });

  pairsTab?.addEventListener("click", (e) => {
    e.preventDefault();
    activeCollectionsTab = "pairs";
    openedCollectionId = null;
    isInCollectionsDetail = false;
    setCollectionsTabSelected(pairsTab);
    renderCollectionsHome("pairs");
  });

  backToCollection?.addEventListener("click", (e) => {
    e.preventDefault();
    openedCollectionId = null;
    isInCollectionsDetail = false;

    const tab = activeCollectionsTab === "pairs" ? "pairs" : "albums";
    setCollectionsTabSelected(tab === "pairs" ? pairsTab || myCollectionsBar : albumsTab || myCollectionsBar);
    renderCollectionsHome(tab);
  });

  updateNavIcons();
  setCollectionsTabSelected(albumsTab || myCollectionsBar);

  return {
    resetToHome: () => {
      enterDiscover();
    },
  };
}