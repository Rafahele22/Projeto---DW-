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

  const viewModeSection = secondBar?.querySelector("section");

  const filtersPanel = document.getElementById("filters");
  const gridEl = document.querySelector(".grid.grid_view");
  const noResultsEl = document.getElementById("no_results");

  if (!nav || !collectionsBtn || !discoverBtn || !mainEl || !myCollectionsBar || !gridEl) return;

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

  let discoverGridHTML = null;
  let discoverNoResultsDisplay = null;

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

    if (discoverGridHTML !== null) gridEl.innerHTML = discoverGridHTML;
    if (noResultsEl && discoverNoResultsDisplay !== null) {
      noResultsEl.style.display = discoverNoResultsDisplay;
    }
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

  function getDiscoverFontFamilies(max = 3) {
    const candidates = Array.from(
      document.querySelectorAll(".grid.grid_view article h1.title_gridview")
    )
      .map((h1) => (h1.style && h1.style.fontFamily ? h1.style.fontFamily : ""))
      .filter(Boolean);

    const unique = [];
    for (const ff of candidates) {
      if (!unique.includes(ff)) unique.push(ff);
      if (unique.length >= max) break;
    }

    while (unique.length < max) unique.push("inherit");
    return unique;
  }

  function renderCollectionsMain() {
    if (discoverGridHTML === null) discoverGridHTML = gridEl.innerHTML;
    if (noResultsEl && discoverNoResultsDisplay === null) {
      discoverNoResultsDisplay = noResultsEl.style.display;
    }

    const [ff1, ff2, ff3] = getDiscoverFontFamilies(3);
    const sampleLetter = "Aa";

    hideMainCompletely();

    gridEl.style.display = "grid";
    if (noResultsEl) noResultsEl.style.display = "none";

    gridEl.innerHTML = `
      <div class="album">
          <article class="exemples_album">
          <h1 style="font-family:${ff1}">${sampleLetter}</h1>
          <section>
            <h1 style="font-family:${ff2}">${sampleLetter}</h1>
            <h1 style="font-family:${ff3}">${sampleLetter}</h1>
          </section>
        </article>

        <section>
          <div>
            <img src="../assets/imgs/fav_selected.svg" class="check-icon" alt="check icon">
            <h2>Favourites</h2>
          </div>
          <h3>10 fonts</h3>
        </section>
      </div>

      <div class="album">
          <article class="exemples_album">
          <h1 style="font-family:${ff1}">${sampleLetter}</h1>
          <section>
            <h1 style="font-family:${ff2}">${sampleLetter}</h1>
            <h1 style="font-family:${ff3}">${sampleLetter}</h1>
          </section>
        </article>

        <section>
          <h2>For web :)</h2>
          <h3>56 fonts</h3>
        </section>
      </div>
    `;
  }

  function enterCollections() {
    setSelected(collectionsBtn);

    if (filtersPanel) filtersPanel.style.display = "none";
    gridEl?.classList.remove("shifted");
    filtersBtn?.classList.remove("selected");

    document.body.classList.remove("single-font-open");

    showOnlyCollectionsSecondBar();
    renderCollectionsMain();

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