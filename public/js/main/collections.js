import { getGlobalSampleText, setGlobalSampleText } from "./state.js";
import { hide, show, showFlex } from "./shared/displayUtils.js";

let userCollections = [];
let allFontsRef = [];

export function setUserCollections(collections) {
  userCollections = Array.isArray(collections) ? collections : [];
}

export function setAllFontsReference(fonts) {
  allFontsRef = Array.isArray(fonts) ? fonts : [];
}

const ICONS = {
  discover: { normal: "../assets/imgs/search.svg", selected: "../assets/imgs/search_selected.svg" },
  collections: { normal: "../assets/imgs/collections.svg", selected: "../assets/imgs/collections_selected.svg" },
  grid: { normal: "../assets/imgs/grid.svg", selected: "../assets/imgs/grid_selected.svg" },
  list: { normal: "../assets/imgs/list.svg", selected: "../assets/imgs/list_selected.svg" },
};

function updateIcon(imgEl, iconKey, isSelected) {
  if (!imgEl) return;
  imgEl.src = isSelected ? ICONS[iconKey].selected : ICONS[iconKey].normal;
}

export function setupCollectionsNav(options = {}) {
  const onOpenFont = typeof options.onOpenFont === "function" ? options.onOpenFont : null;
  let onEnterDiscover = typeof options.onEnterDiscover === "function" ? options.onEnterDiscover : null;

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
  const [gridModeBtn, listModeBtn] = viewModeBtns;
  const filtersPanel = document.getElementById("filters");
  const gridEl = document.querySelector(".grid.grid_view");
  const noResultsEl = document.getElementById("no_results");

  if (!nav || !collectionsBtn || !discoverBtn || !mainEl || !myCollectionsBar || !gridEl) return;

  function updateNavIcons() {
    updateIcon(discoverBtn?.querySelector("img"), "discover", discoverBtn.classList.contains("selected"));
    updateIcon(collectionsBtn?.querySelector("img"), "collections", collectionsBtn.classList.contains("selected"));
  }

  function setSelected(activeBtn) {
    nav.querySelectorAll("a.button").forEach((a) => a.classList.remove("selected"));
    activeBtn.classList.add("selected");
    updateNavIcons();
  }

  const collectionsTabs = Array.from(myCollectionsBar.querySelectorAll("a.button"));
  const [albumsTab, pairsTab] = collectionsTabs;

  function setCollectionsTabSelected(activeTab) {
    if (!albumsTab || !pairsTab) return;
    [albumsTab, pairsTab].forEach((btn) => btn.classList.remove("selected"));
    activeTab.classList.add("selected");
    updateIcon(albumsTab.querySelector("img"), "collections", albumsTab.classList.contains("selected"));
    updateIcon(pairsTab.querySelector("img"), "collections", pairsTab.classList.contains("selected"));
  }

  const secondBarDefaults = new Map();
  [myCollectionsBar, filtersBtn, searchBar, backToCollection, viewModeSection].forEach((el) => {
    if (el) secondBarDefaults.set(el, el.style.display);
  });

  const mainDefaults = new Map(Array.from(mainEl.children).map((el) => [el, el.style.display]));

  function hideMainCompletely() {
    Array.from(mainEl.children).forEach((child) => hide(child));
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
    if (backToCollection) backToCollection.style.display = secondBarDefaults.get(backToCollection) ?? "none";
    if (viewModeSection) viewModeSection.style.display = secondBarDefaults.get(viewModeSection) ?? "";
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
        
        setCollectionsViewMode("grid"); 

        collectionsReact?.update?.({
          view: "collection",
          openedCollectionId,
          collectionViewMode: "grid", 
        });
        window.scrollTo(0, 0);
      },
      onOpenFont: (font) => onOpenFont?.(font),
      onSetViewMode: (mode) => setCollectionsViewMode(mode)
    });

    return collectionsReact;
  }

  function stashDiscoverGridNodes() {
    if (!gridEl || gridEl.childNodes.length === 0) return;
    discoverWasGridView = gridEl.classList.contains("grid_view") && !gridEl.classList.contains("list_view");
    discoverStashEl.replaceChildren(...gridEl.childNodes);
  }

  function restoreDiscoverGridNodes() {
    if (!discoverStashEl || discoverStashEl.childNodes.length === 0) return;
    collectionsReact?.unmount?.();
    collectionsReact = null;
    gridEl.replaceChildren(...discoverStashEl.childNodes);
    gridEl.classList.toggle("grid_view", discoverWasGridView);
    gridEl.classList.toggle("list_view", !discoverWasGridView);
  }

  function setGridLayout(isGrid) {
    gridEl.classList.toggle("grid_view", isGrid);
    gridEl.classList.toggle("list_view", !isGrid);
    gridEl.style.display = isGrid ? "grid" : "";
  }

  function setCollectionsViewMode(mode) {
    const isGrid = mode === "grid";
    setGridLayout(isGrid);

    if (gridModeBtn) gridModeBtn.id = isGrid ? "view_mode_selected" : "";
    if (listModeBtn) listModeBtn.id = isGrid ? "" : "view_mode_selected";
    updateIcon(gridModeBtn?.querySelector("img"), "grid", isGrid);
    updateIcon(listModeBtn?.querySelector("img"), "list", !isGrid);

    collectionsReact?.update?.({ collectionViewMode: mode });
  }

  function attachCollectionsViewModeInterceptors() {
    if (!gridModeBtn || !listModeBtn) return;
    if (gridModeBtn.__collectionsBound) return;

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
    hide(myCollectionsBar);   
    hide(filtersBtn);      
    hide(searchBar);
    hide(viewModeSection);   
    
    show(backToCollection); 
  }

  function showCollectionsTabsBar() {
    showFlex(myCollectionsBar);
    hide(backToCollection, filtersBtn, searchBar, viewModeSection);
  }

  function renderCollectionsHome(tab) {
    const safeTab = tab === "pairs" ? "pairs" : "albums";
    hideMainCompletely();
    showCollectionsTabsBar();
    setGridLayout(true);
    if (noResultsEl) hide(noResultsEl);

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

  function getActiveTab() {
    return activeCollectionsTab === "pairs" ? pairsTab : albumsTab;
  }

  function enterCollections() {
    setSelected(collectionsBtn);
    hide(filtersPanel);
    gridEl.classList.remove("shifted");
    filtersBtn?.classList.remove("selected");
    document.body.classList.remove("single-font-open");
    stashDiscoverGridNodes();
    attachCollectionsViewModeInterceptors();
    setCollectionsTabSelected(getActiveTab() || myCollectionsBar);
    renderCollectionsHome(activeCollectionsTab);
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
    onEnterDiscover?.();
    window.scrollTo(0, 0);
  }

  function handleTabClick(tab) {
    return (e) => {
      e.preventDefault();
      activeCollectionsTab = tab;
      openedCollectionId = null;
      isInCollectionsDetail = false;
      setCollectionsTabSelected(tab === "pairs" ? pairsTab : albumsTab);
      renderCollectionsHome(tab);
    };
  }

  collectionsBtn.addEventListener("click", (e) => { e.preventDefault(); enterCollections(); });
  discoverBtn.addEventListener("click", (e) => { e.preventDefault(); enterDiscover(); });
  albumsTab?.addEventListener("click", handleTabClick("albums"));
  pairsTab?.addEventListener("click", handleTabClick("pairs"));

  backToCollection?.addEventListener("click", (e) => {
    e.preventDefault();
    openedCollectionId = null;
    isInCollectionsDetail = false;
    setCollectionsTabSelected(getActiveTab() || myCollectionsBar);
    renderCollectionsHome(activeCollectionsTab);
  });

  updateNavIcons();
  setCollectionsTabSelected(albumsTab || myCollectionsBar);

  return { 
    resetToHome: enterDiscover,
    setOnEnterDiscover(fn) {
      onEnterDiscover = typeof fn === "function" ? fn : null;
    },
  };
}