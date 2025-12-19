document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("header nav");
  const collectionsBtn = document.getElementById("abaCollections");

  const discoverBtn = nav?.querySelector('a.button:not(#abaCollections)');

  const mainEl = document.querySelector("main");

  const secondBar = document.getElementById("second_bar");
  const myCollectionsBar = document.getElementById("my_collections_second_bar");

  const filtersBtn = document.getElementById("filters_btn");
  const searchBar = document.getElementById("search_bar");
  const backToCollection = document.getElementById("backToCollection");

  const viewModeSection = secondBar?.querySelector(
    "section:not(#my_collections_second_bar)"
  );

  const filtersPanel = document.getElementById("filters");
  const gridEl = document.querySelector(".grid");

  if (!nav || !collectionsBtn || !discoverBtn || !mainEl || !myCollectionsBar) return;

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

  const secondBarDefaults = new Map();
  [myCollectionsBar, filtersBtn, searchBar, backToCollection, viewModeSection].forEach((el) => {
    if (el) secondBarDefaults.set(el, el.style.display);
  });

  const mainChildren = Array.from(mainEl.children);
  const mainDefaults = new Map(mainChildren.map((el) => [el, el.style.display]));

  function setSelected(activeBtn) {
    nav.querySelectorAll("a.button").forEach((a) => a.classList.remove("selected"));
    activeBtn.classList.add("selected");
    updateNavIcons();
  }

  function hideMainCompletely() {
    Array.from(mainEl.children).forEach((child) => {
      child.style.display = "none";
    });
  }

  function restoreMain() {
    Array.from(mainEl.children).forEach((child) => {
      child.style.display = mainDefaults.get(child) ?? "";
    });
  }

  function showOnlyCollectionsSecondBar() {
    myCollectionsBar.style.display = "flex";

    if (filtersBtn) filtersBtn.style.display = "none";
    if (searchBar) searchBar.style.display = "none";
    if (backToCollection) backToCollection.style.display = "none";
    if (viewModeSection) viewModeSection.style.display = "none";
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

  function enterCollections() {
    setSelected(collectionsBtn);

    if (filtersPanel) filtersPanel.style.display = "none";
    gridEl?.classList.remove("shifted");
    filtersBtn?.classList.remove("selected");

    document.body.classList.remove("single-font-open");

    hideMainCompletely();
    showOnlyCollectionsSecondBar();

    window.scrollTo(0, 0);
  }

  function enterDiscover() {
    setSelected(discoverBtn);
    restoreMain();
    restoreDiscoverSecondBar();
  }

  collectionsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    enterCollections();
  });

  discoverBtn.addEventListener("click", (e) => {
    e.preventDefault();
    enterDiscover();
  });

  updateNavIcons();
});