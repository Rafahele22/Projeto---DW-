import { getGlobalSampleText, setGlobalSampleText, getActualMode } from "./state.js";
import { hide, show, showFlex } from "./shared/displayUtils.js";

let userCollections = [];
let allFontsRef = [];

export function setUserCollections(collections) {
  userCollections = Array.isArray(collections) ? collections : [];
}

export function setAllFontsReference(fonts) {
  allFontsRef = Array.isArray(fonts) ? fonts : [];
}

export function getUserCollections() {
  return userCollections;
}

export async function refreshUserCollections(userId) {
  if (!userId) return;
  try {
    const url = `http://web-dev-grupo05.dei.uc.pt/api/collections?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setUserCollections(data);
      return data;
    }
  } catch (e) {
    console.error("Failed to refresh collections:", e);
  }
  return null;
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
  const singleFontController = options.singleFontController || null;
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
  
  const discoverUniverse = document.getElementById("discover-universe");
  const collectionsUniverse = document.getElementById("collections-universe");
  const gridUniverse = document.getElementById("grid-universe");
  const listUniverse = document.getElementById("list-universe");
  const noResultsEl = document.getElementById("no_results");

  if (!nav || !collectionsBtn || !discoverBtn || !mainEl || !myCollectionsBar || !discoverUniverse || !collectionsUniverse) return;

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

  function showDiscoverSecondBar() {
    hide(myCollectionsBar);
    hide(backToCollection);
    if (filtersBtn) filtersBtn.style.display = "";
    if (searchBar) searchBar.style.display = "";
    if (viewModeSection) viewModeSection.style.display = "";
  }

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
      mountEl: collectionsUniverse,
      getGlobalSampleText,
      setGlobalSampleText,
      onSelectCollection: (id) => {
        openedCollectionId = String(id);
        isInCollectionsDetail = true;
        
        showCollectionsListBar(); 
        
        attachCollectionsViewModeInterceptors();
        
        const mode = getActualMode();
        setCollectionsViewMode(mode); 

        collectionsReact?.update?.({
          view: "collection",
          openedCollectionId,
          collectionViewMode: mode, 
        });
        window.scrollTo(0, 0);
      },
      onOpenFont: (font) => {
        if (isInCollectionsDetail && singleFontController?.setOnClose) {
          const savedCollectionId = openedCollectionId;
          const savedTab = activeCollectionsTab;
          singleFontController.setOnClose(() => {
            hide(discoverUniverse);
            collectionsUniverse.style.display = "block";
            openedCollectionId = savedCollectionId;
            isInCollectionsDetail = true;
            activeCollectionsTab = savedTab;
            showCollectionsListBar();
            attachCollectionsViewModeInterceptors();
            const mode = getActualMode();
            setCollectionsViewMode(mode);
            collectionsReact?.update?.({
              view: "collection",
              openedCollectionId: savedCollectionId,
              collectionViewMode: mode,
            });
            window.scrollTo(0, 0);
          });
        }
        onOpenFont?.(font);
      },
      onOpenPair: (headingFont, bodyFont) => {
        if (singleFontController?.setOnClose) {
          singleFontController.setOnClose(() => {
            hide(discoverUniverse);
            collectionsUniverse.style.display = "block";
            openedCollectionId = null;
            isInCollectionsDetail = false;
            setCollectionsTabSelected(pairsTab || albumsTab);
            renderCollectionsHome("pairs");
          });
        }
        singleFontController?.showSingleFontWithPair?.(headingFont, bodyFont);
      },
      onSetViewMode: (mode) => setCollectionsViewMode(mode)
    });

    return collectionsReact;
  }

  function setCollectionsViewMode(mode) {
    const isGrid = mode === "grid";

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
  showCollectionsTabsBar();

  openedCollectionId = null;
  isInCollectionsDetail = false;
  ensureCollectionsReactMounted().update({
    view: safeTab,
    activeTab: safeTab,
    forceFavSelected: safeTab === "pairs",
    openedCollectionId: null,
    collectionViewMode: "list",
    collections: userCollections,
    fonts: allFontsRef,
  });
}


  function refreshCollectionsView() {
    if (!collectionsReact) return;
    collectionsReact.update({
      collections: userCollections,
      fonts: allFontsRef,
    });
  }

  function getActiveTab() {
    return activeCollectionsTab === "pairs" ? pairsTab : albumsTab;
  }

  function enterCollections() {
    const singleFontViewEl = document.getElementById("singleFontView");
    if (singleFontViewEl) {
      singleFontViewEl.innerHTML = "";
      singleFontViewEl.style.display = "none";
    }
    document.body.classList.remove("single-font-open");
    
    hide(discoverUniverse);
    collectionsUniverse.style.display = "block";
    
    setSelected(collectionsBtn);
    hide(filtersPanel);
    filtersBtn?.classList.remove("selected");
    
    attachCollectionsViewModeInterceptors();
    setCollectionsTabSelected(getActiveTab() || albumsTab);
    renderCollectionsHome(activeCollectionsTab);
    isInCollectionsDetail = false;
    window.scrollTo(0, 0);
  }

  function enterDiscover() {
    const singleFontViewEl = document.getElementById("singleFontView");
    if (singleFontViewEl) {
      singleFontViewEl.innerHTML = "";
      singleFontViewEl.style.display = "none";
    }
    document.body.classList.remove("single-font-open");
    
    hide(collectionsUniverse);
    discoverUniverse.style.display = "block";
    
    setSelected(discoverBtn);
    showDiscoverSecondBar();
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
    refreshCollections: refreshCollectionsView,
  };
}