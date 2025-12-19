let userCollections = [];
let allFontsRef = [];

export function setUserCollections(collections) {
  userCollections = Array.isArray(collections) ? collections : [];
}

export function setAllFontsReference(fonts) {
  allFontsRef = Array.isArray(fonts) ? fonts : [];
}

export function setupCollectionsNav() {
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

  const discoverStashEl = document.createElement("div");

function stashDiscoverGridNodes() {
  if (!gridEl || gridEl.childNodes.length === 0) return;

  discoverStashEl.replaceChildren(...gridEl.childNodes);
}

function restoreDiscoverGridNodes() {
  if (!discoverStashEl || discoverStashEl.childNodes.length === 0) return;

  gridEl.replaceChildren(...discoverStashEl.childNodes);
}


  function getFontFamilyById(fontId) {
    const font = allFontsRef.find((f) => f._id === fontId || f.id === fontId);
    return font?.family || font?.name || null;
  }

  function getFontFamiliesForCollection(collection, max = 3) {
    const items = Array.isArray(collection.items) ? collection.items : [];
    const families = [];

    for (const item of items) {
      if (families.length >= max) break;
      const ff = getFontFamilyById(item.fontId);
      if (ff) families.push(ff);
    }

    return families;
  }

  function buildAlbumHTML(collection) {
    const families = getFontFamiliesForCollection(collection, 3);
    const count = families.length;
    const itemsCount = Array.isArray(collection.items) ? collection.items.length : 0;
    const sampleLetter = "Aa";

    const isFavourites = collection.name === "Favourites";
    const iconHTML = isFavourites
      ? `<img src="../assets/imgs/fav_selected.svg" class="check-icon" alt="favourite icon">`
      : "";

    let articleContent = "";

    if (count === 0) {
      articleContent = `
        <h1 style="font-family:inherit">${sampleLetter}</h1>
        <section>
          <h1 style="font-family:inherit">${sampleLetter}</h1>
          <h1 style="font-family:inherit">${sampleLetter}</h1>
        </section>
      `;
    } else if (count === 1) {
      articleContent = `
        <h1 style="font-family:${families[0]}">${sampleLetter}</h1>
        <section>
          <h1 style="font-family:${families[0]}">${sampleLetter}</h1>
          <h1 style="font-family:${families[0]}">${sampleLetter}</h1>
        </section>
      `;
    } else if (count === 2) {
      articleContent = `
        <h1 style="font-family:${families[0]}">${sampleLetter}</h1>
        <section>
          <h1 style="font-family:${families[1]}">${sampleLetter}</h1>
          <h1 style="font-family:${families[0]}">${sampleLetter}</h1>
        </section>
      `;
    } else {
      articleContent = `
        <h1 style="font-family:${families[0]}">${sampleLetter}</h1>
        <section>
          <h1 style="font-family:${families[1]}">${sampleLetter}</h1>
          <h1 style="font-family:${families[2]}">${sampleLetter}</h1>
        </section>
      `;
    }

    return `
      <div class="album">
        <article class="exemples_album">
          ${articleContent}
        </article>
        <section>
          <div>
            ${iconHTML}
            <h2>${collection.name}</h2>
          </div>
          <h3>${itemsCount} font${itemsCount !== 1 ? "s" : ""}</h3>
        </section>
      </div>
    `;
  }

  function renderAlbumsMain() {
    hideMainCompletely();
    gridEl.style.display = "grid";
    if (noResultsEl) noResultsEl.style.display = "none";

    const fontsCollections = userCollections.filter((c) => c.type === "fonts");

    if (fontsCollections.length === 0) {
      gridEl.innerHTML = `<p style="font-family: 'roboto regular'; color: var(--darker-grey);">No collections yet.</p>`;
      return;
    }

    gridEl.innerHTML = fontsCollections.map(buildAlbumHTML).join("");
  }

  function renderPairsMain() {
    hideMainCompletely();
    gridEl.style.display = "grid";
    if (noResultsEl) noResultsEl.style.display = "none";

    const pairsCollections = userCollections.filter((c) => c.type === "pairs");

    if (pairsCollections.length === 0) {
      gridEl.innerHTML = `<p style="font-family: 'roboto regular'; color: var(--darker-grey);">No pairs yet.</p>`;
      return;
    }

    gridEl.innerHTML = pairsCollections.map(buildAlbumHTML).join("");
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

    showOnlyCollectionsSecondBar();

    setCollectionsTabSelected(albumsTab || myCollectionsBar);
    renderAlbumsMain();

    window.scrollTo(0, 0);
  }

  function enterDiscover() {
    setSelected(discoverBtn);

    restoreMainBaseVisibility();
    restoreDiscoverGridNodes();
    restoreDiscoverSecondBar();

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
    setCollectionsTabSelected(albumsTab);
    renderAlbumsMain();
  });

  pairsTab?.addEventListener("click", (e) => {
    e.preventDefault();
    setCollectionsTabSelected(pairsTab);
    renderPairsMain();
  });

  updateNavIcons();
  setCollectionsTabSelected(albumsTab || myCollectionsBar);

  return {
    resetToHome: () => {
      enterDiscover();
    },
  };
}