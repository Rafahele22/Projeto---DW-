import { escapeHtml, ensureFontFace, pickRandom, sameTags, setFavIconState, toggleFontInCollection, setupSaveOptions } from "../shared/fontUtils.js";
import { getGlobalSampleText, isFavorite, toggleFavorite } from "../state.js";

function renderFontTags(font) {
  const tags = Array.isArray(font?.tags) ? font.tags : [];
  if (!tags.length) return "";

  return `
    <section class="list_information font-tags">
      ${tags
        .map(
          (tag) => `
            <a href="#" class="button tag-btn"><h4>${escapeHtml(tag)}</h4></a>
          `
        )
        .join("")}
    </section>
  `;
}

function createPairControlsBox(pairFont, signal) {
  const numStyles = pairFont.weights?.length || 0;
  const hasAllCaps = pairFont.tags && pairFont.tags.includes("All Caps");

  const globalText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
  const displayText = hasAllCaps ? globalText.toUpperCase() : globalText;

  ensureFontFace(pairFont);

  const pairBoxWrapper = document.createElement("div");
  pairBoxWrapper.id = "pair-box-wrapper";
  pairBoxWrapper.className = "pair-box-wrapper";

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "bar_individual_font pair-controls";
  controlsDiv.classList.add("force-visible-controls");

  controlsDiv.innerHTML = `
    <div class="sliders">
      <div>
        <div class="divLabel">
          <label class="rangeLabel" for="pairFontSize">
            <span>font size</span>
            <span class="range-value" id="pairFontSizeValue">48pt</span>
          </label>
        </div>
        <div class="range-container">
          <input type="range" id="pairFontSize" min="12" max="150" value="48" />
        </div>
      </div>

      <div>
        <div class="divLabel">
          <label class="rangeLabel" for="pairLetterSpacing">
            <span>tracking</span>
            <span class="range-value" id="pairLetterSpacingValue">0pt</span>
          </label>
        </div>
        <div class="range-container">
          <input type="range" id="pairLetterSpacing" min="-5" max="50" value="0" step="0.5" />
        </div>
      </div>

      <div>
        <div class="divLabel">
          <label class="rangeLabel" for="pairLineHeight">
            <span>leading</span>
            <span class="range-value" id="pairLineHeightValue">100</span>
          </label>
        </div>
        <div class="range-container">
          <input type="range" id="pairLineHeight" min="80" max="300" value="100" step="1" />
        </div>
      </div>
    </div>

    <div class="choose-style-wrapper">
      <a href="#" class="button choose_style_btn">
        <h4>Choose style</h4>
        <img src="../assets/imgs/arrow.svg" alt="icon arrow down" />
      </a>

      <div id="pair_styles_menu" class="styles_menu" style="display:none">
        <div class="styles_menu_scroll"></div>
      </div>
    </div>
  `;

  const listDiv = document.createElement("div");
  listDiv.className = "list_individual pair-list";
  listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

  const tagsHTML = renderFontTags(pairFont);

  const designers = Array.isArray(pairFont?.design) ? pairFont.design : [];
  const designersText = designers.length ? designers.map(escapeHtml).join(", ") : "";

  listDiv.innerHTML = `
    <div class="list_information_bar">
      <section class="list_information">
        <h3>${escapeHtml(pairFont.name)}</h3>
        ${pairFont.foundry !== "Unknown" ? `<h3>${escapeHtml(pairFont.foundry)}</h3>` : ""}
        ${designersText ? `<h3>${designersText}</h3>` : ""}
        <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
        ${pairFont.variable ? "<h3>Variable</h3>" : ""}
      </section>

      <section class="list_information">
        <a href="#" class="button save-pair-btn">
          <img src="../assets/imgs/fav.svg" alt="favourite"/>
          <h4>Save Pair</h4>
        </a>
        <a href="#" class="button remove-pair-btn">
          <img src="../assets/imgs/trash.svg" alt="trash"/>
          <h4>Remove</h4>
        </a>
      </section>
    </div>

    <h1 class="sampleText" contenteditable="true"
      style="font-family:'${pairFont._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
      ${displayText}
    </h1>

    ${tagsHTML}
  `;

  const savePairBtn = listDiv.querySelector(".save-pair-btn");
  const removePairBtn = listDiv.querySelector(".remove-pair-btn");

  const savePairImg = savePairBtn?.querySelector("img");
  const removePairImg = removePairBtn?.querySelector("img");

  const SAVE_DEFAULT = "../assets/imgs/fav.svg";
  const SAVE_HOVER_SELECTED = "../assets/imgs/fav_pairs_selected.svg";

  const REMOVE_DEFAULT = "../assets/imgs/trash.svg";
  const REMOVE_HOVER = "../assets/imgs/trash_selected.svg";

  const syncSavePairIcon = () => {
    if (!savePairImg) return;
    const isSelected = savePairBtn?.classList.contains("selected-option");
    savePairImg.src = isSelected ? SAVE_HOVER_SELECTED : SAVE_DEFAULT;
  };

  removePairBtn?.addEventListener(
    "mouseenter",
    (e) => {
      e.preventDefault();
      if (removePairImg) removePairImg.src = REMOVE_HOVER;
    },
    { signal }
  );

  removePairBtn?.addEventListener(
    "mouseleave",
    (e) => {
      e.preventDefault();
      if (removePairImg) removePairImg.src = REMOVE_DEFAULT;
    },
    { signal }
  );

  savePairBtn?.addEventListener(
    "mouseenter",
    (e) => {
      e.preventDefault();
      if (savePairImg) savePairImg.src = SAVE_HOVER_SELECTED;
    },
    { signal }
  );

  savePairBtn?.addEventListener(
    "mouseleave",
    (e) => {
      e.preventDefault();
      syncSavePairIcon();
    },
    { signal }
  );

  savePairBtn?.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      savePairBtn.classList.toggle("selected-option");
      syncSavePairIcon();
    },
    { signal }
  );

  syncSavePairIcon();

  pairBoxWrapper.appendChild(controlsDiv);
  pairBoxWrapper.appendChild(listDiv);

  setupPairBoxEvents(controlsDiv, listDiv, pairFont, signal);

  return pairBoxWrapper;
}


function setupPairBoxEvents(controlsContainer, displayContainer, font, signal) {
  const h1 = displayContainer.querySelector("h1");
  const fontSize = controlsContainer.querySelector("#pairFontSize");
  const letterSpacing = controlsContainer.querySelector("#pairLetterSpacing");
  const lineHeight = controlsContainer.querySelector("#pairLineHeight");

  const fontSizeValue = controlsContainer.querySelector("#pairFontSizeValue");
  const letterSpacingValue = controlsContainer.querySelector("#pairLetterSpacingValue");
  const lineHeightValue = controlsContainer.querySelector("#pairLineHeightValue");
  
  if (lineHeightValue && lineHeight) lineHeightValue.textContent = lineHeight.value + "%";
  if (h1 && lineHeight) h1.style.lineHeight = lineHeight.value + "%";

  fontSize?.addEventListener(
    "input",
    function () {
      if (fontSizeValue) fontSizeValue.textContent = this.value + "pt";
      if (h1) h1.style.fontSize = this.value + "pt";
    },
    { signal }
  );

  letterSpacing?.addEventListener(
    "input",
    function () {
      if (letterSpacingValue) letterSpacingValue.textContent = this.value + "pt";
      if (h1) h1.style.letterSpacing = this.value + "pt";
    },
    { signal }
  );

  lineHeight?.addEventListener(
    "input",
    function () {
      if (lineHeightValue) lineHeightValue.textContent = this.value + "%";
      if (h1) h1.style.lineHeight = this.value + "%";
    },
    { signal }
  );

  const chooseBtn = controlsContainer.querySelector(".choose_style_btn");
  const menu = controlsContainer.querySelector("#pair_styles_menu");
  const menuScroll = menu?.querySelector(".styles_menu_scroll");

  const pairFamily = `${font._id}-font-pair-single`;

  let pairFace = document.getElementById("pair-font-face");
  if (!pairFace) {
    pairFace = document.createElement("style");
    pairFace.id = "pair-font-face";
    document.head.appendChild(pairFace);
  } else {
    pairFace.textContent = "";
  }

  function applyWeight(weight) {
    pairFace.textContent = `
      @font-face {
        font-family: '${pairFamily}';
        src: url('../assets/fonts/${weight.file}');
      }
    `;
    if (h1) h1.style.fontFamily = `'${pairFamily}'`;
  }

  function buildStylesMenu() {
    if (!menuScroll) return;
    menuScroll.innerHTML = "";

    const defaultWeight = font.weights.find((w) => w.default) || font.weights[0];

    font.weights.forEach((w) => {
      const optionLink = document.createElement("a");
      optionLink.href = "#";
      optionLink.className = "option style-option";

      const optionSelected = document.createElement("div");
      optionSelected.className = "option_selected";
      if (w === defaultWeight) optionSelected.classList.add("selected");

      const optionText = document.createElement("h5");
      optionText.textContent = w.style;

      optionLink.appendChild(optionSelected);
      optionLink.appendChild(optionText);
      menuScroll.appendChild(optionLink);

      optionLink.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();

          menuScroll?.querySelectorAll(".option_selected").forEach((sel) => sel.classList.remove("selected"));
          optionSelected.classList.add("selected");

          applyWeight(w);
        },
        { signal }
      );
    });

    applyWeight(defaultWeight);
  }

  buildStylesMenu();

  chooseBtn?.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!menu) return;

      const isOpening = menu.style.display === "none";
      menu.style.display = isOpening ? "block" : "none";
      chooseBtn.classList.toggle("selected", isOpening);

      displayContainer.classList.toggle("shifted", isOpening);
    },
    { signal }
  );

  document.addEventListener(
    "click",
    (e) => {
      if (menu && chooseBtn && !menu.contains(e.target) && !chooseBtn.contains(e.target)) {
        menu.style.display = "none";
        chooseBtn.classList.remove("selected");
        displayContainer.classList.remove("shifted");
      }
    },
    { signal }
  );
}

async function populatePairCollections(pairDiv, currentFont, allFonts) {
  const pairCollectionsList = pairDiv.querySelector("#pair_collections_list");
  if (!pairCollectionsList) return;

  pairCollectionsList.innerHTML = "";

  let userCollections = [];
  try {
    const { getUserCollections } = await import("../collections.js");
    userCollections = getUserCollections() || [];
  } catch (e) {
    console.error("Failed to get user collections:", e);
    pairCollectionsList.innerHTML = '<p style="color: var(--darker-grey); padding: 1rem;">Please login to see your collections.</p>';
    return;
  }

  const fontsCollections = userCollections.filter(c => c.type === "fonts");

  if (fontsCollections.length === 0) {
    pairCollectionsList.innerHTML = '<p style="color: var(--darker-grey); padding: 1rem;">No collections available. Create one first!</p>';
    return;
  }

  const fontsById = new Map(allFonts.map(f => [String(f._id), f]));

  fontsCollections.forEach(collection => {
    const collectionCategory = document.createElement("a");
    collectionCategory.href = "#";
    collectionCategory.className = "save-option pair-category";
    collectionCategory.dataset.collectionId = String(collection._id);

    const sampleLetter = "Aa";
    collectionCategory.innerHTML = `
      <div><h4>${sampleLetter}</h4><h4>${escapeHtml(collection.name)}</h4></div>
    `;

    const optionsSection = document.createElement("section");
    optionsSection.className = "pair-options";
    optionsSection.dataset.collectionId = String(collection._id);
    optionsSection.style.display = "none";

    const items = Array.isArray(collection.items) ? collection.items : [];
    const fontIds = items.map(item => String(item.fontId)).filter(Boolean);
    const fonts = fontIds.map(id => fontsById.get(id)).filter(Boolean);

    const fontsToShow = fonts.filter(f => String(f._id) !== String(currentFont._id));

    if (fontsToShow.length === 0) {
      optionsSection.innerHTML = '<p style="color: var(--darker-grey); padding: 0.5rem;">No other fonts in this collection.</p>';
    } else {
      fontsToShow.forEach(font => {
        ensureFontFace(font);
        const isAllCaps = Array.isArray(font?.tags) && font.tags.includes("All Caps");
        const sampleLetter = isAllCaps ? "AA" : "Aa";

        const optionBtn = document.createElement("a");
        optionBtn.href = "#";
        optionBtn.className = "pair-option-btn";
        optionBtn.dataset.fontId = String(font._id);

        optionBtn.innerHTML = `
          <div>
        <h4 style="font-family:'${String(font._id)}-font'">${sampleLetter}</h4>
           <h4>${escapeHtml(font.name)}</h4>
         </div>
          <h5 class="add-text">add</h5>
          <img src="../assets/imgs/check.svg" class="check-icon" alt="check icon">
        `;

        optionsSection.appendChild(optionBtn);
      });
    }

    pairCollectionsList.appendChild(collectionCategory);
    pairCollectionsList.appendChild(optionsSection);
  });
}

async function buildSimilarSection({ currentFont, fontsAll, onOpenFont, onOpenPairSuggestion }) {
  const root = document.createElement("div");
  root.className = "similar-wrapper";

  const allFonts = Array.isArray(fontsAll) ? fontsAll : [];
  const fontsById = new Map(allFonts.map((f) => [String(f._id), f]));

  const pairsWrapper = document.createElement("div");
  pairsWrapper.className = "suggestions";
  root.appendChild(pairsWrapper);

  const pairsTitle = document.createElement("h2");
  pairsTitle.textContent = "Pairs Suggestions";
  pairsWrapper.appendChild(pairsTitle);

  const pairsGrid = document.createElement("div");
  pairsGrid.className = "grid grid_view";
  pairsWrapper.appendChild(pairsGrid);

  let pairsToShow = [];

  try {
    const res = await fetch("http://web-dev-grupo05.dei.uc.pt/api/top-pairs?limit=4");
    if (res.ok) {
      const topPairs = await res.json();
      pairsToShow = topPairs
        .map((p) => ({
          heading: fontsById.get(p.headingFontId),
          body: fontsById.get(p.bodyFontId),
        }))
        .filter((p) => p.heading && p.body);
    }
  } catch (e) {
    console.warn("Failed to fetch top pairs:", e);
  }

  if (pairsToShow.length === 0) {
    const bodyCandidates = allFonts.filter(
      (f) => f && f._id !== currentFont._id && Array.isArray(f.tags) && f.tags.includes("Body Text")
    );
    const bodyChosen = pickRandom(bodyCandidates, 4);
    pairsToShow = bodyChosen.map((bodyFont) => ({
      heading: currentFont,
      body: bodyFont,
    }));
  }

  const bodyText =
    "This is sample text used to demonstrate how typefaces work together. It allows designers to focus on form, spacing, hierarchy, and contrast. By removing meaning from the content, attention shifts to structure, rhythm, and the relationship between headline and body text.";

  pairsToShow.forEach(({ heading, body }) => {
    ensureFontFace(heading);
    ensureFontFace(body);

    const headingBase = "Sample Heading";
    const isAllCaps = Array.isArray(heading?.tags) && heading.tags.includes("All Caps");
    const headingText = isAllCaps ? headingBase.toUpperCase() : headingBase;
    const numStyles = Array.isArray(body.weights) ? body.weights.length : 0;

    const article = document.createElement("article");
    article.dataset.fontId = body._id;

    article.innerHTML = `
      <section class="grid_information_pairs">
        <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
      </section>

      <h1 class="pairs_title" style="font-family:'${heading._id}-font'">${headingText}</h1>

      <p style="font-family:'${body._id}-font'">${bodyText}</p>

      <section class="grid_information">
        <h2>${body.name}</h2>
        <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
      </section>
    `;

    const favImg = article.querySelector(".fav-btn img");
    if (favImg) {
      setFavIconState(favImg, isFavorite(body._id));
      favImg.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newState = await toggleFavorite(body._id);
        setFavIconState(favImg, newState);
      });
    }

    article.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button")) return;
      if (typeof onOpenPairSuggestion === "function") {
        onOpenPairSuggestion(heading, body);
      } else {
        onOpenFont(body);
      }
    });

    pairsGrid.appendChild(article);
  });

  // =========================
  // SIMILAR
  // =========================
  const similarWrapper = document.createElement("div");
  similarWrapper.className = "suggestions";
  root.appendChild(similarWrapper);

  const title = document.createElement("h2");
  title.textContent = "Similar";
  similarWrapper.appendChild(title);

  const similarGrid = document.createElement("div");
  similarGrid.className = "grid grid_view";
  similarWrapper.appendChild(similarGrid);

  const currentTags = Array.isArray(currentFont?.tags) ? currentFont.tags : [];

  const tagOverlapScore = (a, b) => {
    const A = Array.isArray(a) ? a : [];
    const B = new Set(Array.isArray(b) ? b : []);
    let score = 0;
    for (const t of A) if (B.has(t)) score++;
    return score;
  };

  let ranked = allFonts
    .filter((f) => f && f._id !== currentFont._id)
    .map((f) => ({ font: f, score: tagOverlapScore(f.tags, currentTags) }))
    .filter((x) => x.score > 0);

  ranked.sort((a, b) => b.score - a.score);

  const pool = ranked.slice(0, 20).map((x) => x.font);
  let chosen = pickRandom(pool, 4);

  if (chosen.length === 0) {
    const fallback = allFonts.filter((f) => f && f._id !== currentFont._id);
    chosen = pickRandom(fallback, 4);
  }

  chosen.forEach((font) => {
    ensureFontFace(font);

    const numStyles = font.weights.length;
    const sampleLetter = font.tags?.includes("All Caps") ? "AA" : "Aa";

    const article = document.createElement("article");
    article.dataset.fontId = font._id;

    article.innerHTML = `
      <section class="grid_information">
        <a href="#" class="button save-btn"><h4>Save</h4></a>
        <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
      </section>

      <section class="save">
        <h4>Save font on...</h4>
        <a href="#" class="save-option" data-type="web">
          <div><h4>Aa</h4><h4>Web</h4></div>
          <h5 class="add-text">add</h5>
          <img src="../assets/imgs/check.svg" class="check-icon" alt="check icon">
        </a>
        <a href="#" class="save-option" data-type="print">
          <div><h4>Aa</h4><h4>Print</h4></div>
          <h5 class="add-text">add</h5>
          <img src="../assets/imgs/check.svg" class="check-icon" alt="check icon">
        </a>
      </section>

      <h1 class="title_gridview" style="font-family:'${font._id}-font'">${sampleLetter}</h1>

      <section class="grid_information">
        <h2>${font.name}</h2>
        <h3>${numStyles} styles</h3>
      </section>
    `;

    const favImg = article.querySelector(".fav-btn img");
    if (favImg) {
      setFavIconState(favImg, isFavorite(font._id));
      favImg.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newState = await toggleFavorite(font._id);
        setFavIconState(favImg, newState);
      });
    }

    const saveMenu = article.querySelector(".save");
    const saveBtn = article.querySelector(".save-btn");
    if (saveMenu) saveMenu.style.display = "none";

    saveBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      document.querySelectorAll(".save, .save_list").forEach((menu) => {
        if (menu !== saveMenu) {
          menu.style.display = "none";
          menu.parentElement.querySelector(".save-btn")?.classList.remove("selected");
        }
      });

      const isOpening = saveMenu && saveMenu.style.display === "none";
      if (saveMenu) saveMenu.style.display = isOpening ? "block" : "none";
      saveBtn?.classList.toggle("selected", isOpening);
    });

    article.querySelectorAll(".save-option").forEach((option) => {
      option.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const collectionType = option.dataset.type;
        if (collectionType && font._id) {
          const collectionName = collectionType === "web" ? "Web" : "Print";
          const result = await toggleFontInCollection(font._id, collectionName);
          option.classList.toggle("selected-option", result?.added);
        }
      });
    });

    article.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".save")) return;
      onOpenFont(font);
    });

    similarGrid.appendChild(article);
  });

  return root;
}

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

  function setupSingleViewEvents(controlsContainer, displayContainer, pairContainer, font) {
    const signal = teardownController?.signal;

    // =========================
    // ADD PAIR
    // =========================
    const addPairBtn = pairContainer?.querySelector("#add_pair_btn");
    const pairMenu = pairContainer?.querySelector("#pair_menu");

    if (pairMenu) pairMenu.style.display = "none";

    addPairBtn?.addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isLoggedIn = document.body.classList.contains("is-logged-in");

    if (!isLoggedIn) {
      const loginBox = document.querySelector(".loginContentor");
      const loginForm = document.getElementById("login");
      const registerForm = document.getElementById("register");

      if (loginBox) loginBox.style.display = "block";
      if (loginForm) loginForm.style.display = "block";
      if (registerForm) registerForm.style.display = "none";

      if (pairMenu) pairMenu.style.display = "none";
      addPairBtn.classList.remove("selected");
      return;
    }

    if (!pairMenu) return;
    const isOpening = pairMenu.style.display === "none";
    pairMenu.style.display = isOpening ? "block" : "none";
    addPairBtn.classList.toggle("selected", isOpening);
  },
  { signal }
);


    const handlePairCategoryClick = (e) => {
  const cat = e.target.closest(".pair-category");
  if (!cat) return;

  e.preventDefault();
  e.stopPropagation();

  const collectionId = cat.dataset.collectionId;
  const options = pairContainer.querySelector(`.pair-options[data-collection-id="${collectionId}"]`);
  if (!options) return;

  const isOpening = options.style.display === "none";

  pairContainer.querySelectorAll(".pair-options").forEach((sec) => (sec.style.display = "none"));
  pairContainer.querySelectorAll(".pair-category").forEach((c) => c.classList.remove("selected-option"));

  options.style.display = isOpening ? "block" : "none";
  cat.classList.toggle("selected-option", isOpening);
};

const removePairBox = () => {
  const existingPairBox = singleFontView.querySelector("#pair-box-wrapper");
  if (existingPairBox) existingPairBox.remove();

  const pairFace = document.getElementById("pair-font-face");
  if (pairFace) pairFace.textContent = "";

  pairContainer?.querySelectorAll(".pair-option-btn").forEach((b) => b.classList.remove("selected-option"));

  const addPairLabel = addPairBtn?.querySelector("h4");
  if (addPairLabel) addPairLabel.textContent = "Add Pair";
};

const handlePairOptionClick = (e) => {
  const btn = e.target.closest(".pair-option-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const fontId = btn.dataset.fontId;
  if (!fontId) return;

  const allFonts = getAllFonts();
  const pairFont = allFonts.find((f) => String(f._id) === String(fontId));
  if (!pairFont) return;

  removePairBox();

  const pairBox = createPairControlsBox(pairFont, signal);



  const firstListIndividual = singleFontView.querySelector(".list_individual:not(.pair-list)");
  if (firstListIndividual && firstListIndividual.nextSibling) {
    singleFontView.insertBefore(pairBox, firstListIndividual.nextSibling);
  } else {
    singleFontView.appendChild(pairBox);
  }

  const addPairLabel = addPairBtn?.querySelector("h4");
  if (addPairLabel) addPairLabel.textContent = "Change Pair";

  const removePairBtn = pairBox.querySelector(".remove-pair-btn");
  removePairBtn?.addEventListener(
    "click",
    (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      removePairBox();
    },
    { signal }
  );

  pairMenu.style.display = "none";
  addPairBtn?.classList.remove("selected");
  pairContainer?.querySelectorAll(".pair-options").forEach((sec) => (sec.style.display = "none"));
  pairContainer?.querySelectorAll(".pair-category").forEach((c) => c.classList.remove("selected-option"));

  btn.classList.add("selected-option");
};

pairContainer?.addEventListener("click", handlePairCategoryClick, { signal });
pairContainer?.addEventListener("click", handlePairOptionClick, { signal });


    // FAVOURITE
    const favBtn = displayContainer.querySelector(".fav-btn img");
    favBtn?.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavIcon(favBtn);
      },
      { signal }
    );

    // SAVE MENU
    const saveMenu = displayContainer.querySelector(".save_list");
    const saveBtn = displayContainer.querySelector(".save-btn");
    if (saveMenu) saveMenu.style.display = "none";

    saveBtn?.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!saveMenu) return;

        const isOpening = saveMenu.style.display === "none";
        saveMenu.style.display = isOpening ? "block" : "none";
        saveBtn.classList.toggle("selected", isOpening);
      },
      { signal }
    );

    // SAVE OPTIONS
    displayContainer.querySelectorAll(".save-option").forEach((option) => {
      option.addEventListener(
        "click",
        async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const collectionType = option.dataset.type;
          if (collectionType && font._id) {
            const collectionName = collectionType === "web" ? "Web" : "Print";
            const result = await toggleFontInCollection(font._id, collectionName);
            option.classList.toggle("selected-option", result?.added);
          }
        },
        { signal }
      );
    });

    // SLIDERS
    const h1 = displayContainer.querySelector("h1");
    const fontSize = controlsContainer.querySelector("#fontSize");
    const letterSpacing = controlsContainer.querySelector("#letterSpacing");
    const lineHeight = controlsContainer.querySelector("#lineHeight");

    const fontSizeValue = controlsContainer.querySelector("#fontSizeValue");
    const letterSpacingValue = controlsContainer.querySelector("#letterSpacingValue");
    const lineHeightValue = controlsContainer.querySelector("#lineHeightValue");
    if (lineHeightValue && lineHeight) lineHeightValue.textContent = lineHeight.value + "%";
    if (h1 && lineHeight) h1.style.lineHeight = lineHeight.value + "%";

    fontSize?.addEventListener(
      "input",
      function () {
        if (fontSizeValue) fontSizeValue.textContent = this.value + "pt";
        if (h1) h1.style.fontSize = this.value + "pt";
      },
      { signal }
    );

    letterSpacing?.addEventListener(
      "input",
      function () {
        if (letterSpacingValue) letterSpacingValue.textContent = this.value + "pt";
        if (h1) h1.style.letterSpacing = this.value + "pt";
      },
      { signal }
    );

    lineHeight?.addEventListener(
      "input",
      function () {
        if (lineHeightValue) lineHeightValue.textContent = this.value + "%";
        if (h1) h1.style.lineHeight = this.value + "%";
      },
      { signal }
    );

    const tagLinks = displayContainer.querySelectorAll(".font-tags a.tag-btn");

    tagLinks.forEach((link) => {
      link.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();

          const tag = link.textContent.trim();

          closeSingleFontView();

          if (filtersPanelEl) filtersPanelEl.style.display = "block";
          if (gridEl) gridEl.classList.add("shifted");
          if (listEl) listEl.classList.add("shifted");
          filtersBtnEl?.classList.add("selected");

          requestAnimationFrame(() => {
            const filterTagButtons = Array.from(document.querySelectorAll(".tag-btn"));

            const targetBtn = filterTagButtons.find((btn) => btn.textContent.trim() === tag);
            if (!targetBtn) return;

            targetBtn.scrollIntoView({ block: "center" });
            targetBtn.click();
          });
        },
        { signal }
      );
    });

    // CHOOSE STYLE
    const chooseBtn = controlsContainer.querySelector(".choose_style_btn");
    const menu = controlsContainer.querySelector("#styles_menu");
    const menuScroll = menu?.querySelector(".styles_menu_scroll");

    const singleFamily = `${font._id}-font-single`;

    let singleFace = document.getElementById("single-font-face");
    if (!singleFace) {
      singleFace = document.createElement("style");
      singleFace.id = "single-font-face";
      document.head.appendChild(singleFace);
    }

    function applyWeight(weight) {
      singleFace.textContent = `
        @font-face {
          font-family: '${singleFamily}';
          src: url('../assets/fonts/${weight.file}');
        }
      `;
      if (h1) h1.style.fontFamily = `'${singleFamily}'`;
    }

    function buildStylesMenu() {
      if (!menuScroll) return;
      menuScroll.innerHTML = "";

      const defaultWeight = font.weights.find((w) => w.default) || font.weights[0];

      font.weights.forEach((w) => {
        const optionLink = document.createElement("a");
        optionLink.href = "#";
        optionLink.className = "option style-option";

        const optionSelected = document.createElement("div");
        optionSelected.className = "option_selected";
        if (w === defaultWeight) optionSelected.classList.add("selected");

        const optionText = document.createElement("h5");
        optionText.textContent = w.style;

        optionLink.appendChild(optionSelected);
        optionLink.appendChild(optionText);
        menuScroll.appendChild(optionLink);

        optionLink.addEventListener(
          "click",
          (e) => {
            e.preventDefault();
            e.stopPropagation();

            menuScroll?.querySelectorAll(".option_selected").forEach((sel) => sel.classList.remove("selected"));

            applyWeight(w);
          },
          { signal }
        );
      });

      applyWeight(defaultWeight);
    }

    buildStylesMenu();

    chooseBtn?.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!menu) return;

        const isOpening = menu.style.display === "none";
        menu.style.display = isOpening ? "block" : "none";
        chooseBtn.classList.toggle("selected", isOpening);

        displayContainer.classList.toggle("shifted", isOpening);
      },
      { signal }
    );

    document.addEventListener(
      "click",
      (e) => {
        if (menu && chooseBtn && !menu.contains(e.target) && !chooseBtn.contains(e.target)) {
          menu.style.display = "none";
          chooseBtn.classList.remove("selected");
          displayContainer.classList.remove("shifted");
        }

        if (saveMenu && saveBtn && !saveMenu.contains(e.target) && !saveBtn.contains(e.target)) {
          saveMenu.style.display = "none";
          saveBtn.classList.remove("selected");
        }

        if (pairMenu && addPairBtn && !pairMenu.contains(e.target) && !addPairBtn.contains(e.target)) {
          pairMenu.style.display = "none";
          addPairBtn.classList.remove("selected");
          pairContainer?.querySelectorAll(".pair-options").forEach((sec) => (sec.style.display = "none"));
          pairContainer?.querySelectorAll(".pair-category").forEach((c) => c.classList.remove("selected-option"));
        }
      },
      { signal }
    );
  }

  async function showSingleFont(font) {
    const isAlreadyOpen = singleFontView.style.display === "block";

    if (!isAlreadyOpen) {
      openSingleFontView();
    }

    const numStyles = font.weights.length;
    const hasAllCaps = font.tags && font.tags.includes("All Caps");
    const globalText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
    const displayText = hasAllCaps ? globalText.toUpperCase() : globalText;

    const controlsDiv = document.createElement("div");
    controlsDiv.className = "bar_individual_font";
    controlsDiv.classList.add("force-visible-controls");

    controlsDiv.innerHTML = `
      <div class="sliders">
        <div class="divLabel">
          <label class="rangeLabel" for="fontSize">
            <span>font size</span>
            <span class="range-value" id="fontSizeValue">48pt</span>
          </label>
          <div class="range-container">
            <input type="range" id="fontSize" min="12" max="150" value="48">
          </div>
        </div>

        <div class="divLabel">
          <label class="rangeLabel" for="letterSpacing">
            <span>tracking</span>
            <span class="range-value" id="letterSpacingValue">0pt</span>
          </label>
          <div class="range-container">
            <input type="range" id="letterSpacing" min="-5" max="50" value="0" step="0.5">
          </div>
        </div>

        <div class="divLabel">
          <label class="rangeLabel" for="lineHeight">
            <span>leading</span>
            <span class="range-value" id="lineHeightValue">100%</span>
          </label>
          <div class="range-container">
            <input type="range" id="lineHeight" min="80" max="300" value="100" step="1">
          </div>
        </div>
      </div>

      <div class="choose-style-wrapper">
        <a href="#" class="button choose_style_btn">
          <h4>Choose style</h4>
          <img src="../assets/imgs/arrow.svg" alt="icon arrow down"/>
        </a>
        <div id="styles_menu" class="styles_menu" style="display:none;">
          <div class="styles_menu_scroll"></div>
        </div>
      </div>
    `;

    const listDiv = document.createElement("div");
    listDiv.className = "list_individual";
    listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

    const tagsHTML = renderFontTags(font);
    const designers = Array.isArray(font?.design) ? font.design : [];
    const designersText = designers.length ? designers.map(escapeHtml).join(", ") : "";

    listDiv.innerHTML = `
      <div class="list_information_bar">
        <section class="list_information">
          <h3>${font.name}</h3>
          ${font.foundry !== "Unknown" ? `<h3>${font.foundry}</h3>` : ""}
          ${designersText ? `<h3>${designersText}</h3>` : ""}
          <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
          ${font.variable ? "<h3>Variable</h3>" : ""}
        </section>

        <section class="list_information">
          <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
          <a href="#" class="button save-btn"><h4>Save</h4></a>
        </section>

        <section class="save_list">
          <h4>Save font on...</h4>
          <a href="#" class="save-option" data-type="web"><div><h4>Aa</h4><h4>Web</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
          <a href="#" class="save-option" data-type="print"><div><h4>Aa</h4><h4>Print</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
        </section>
      </div>

      <h1 class="sampleText" contenteditable="true"
        style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
        ${displayText}
      </h1>

      ${tagsHTML}
    `;

    // =========================
    // PAIR WRAPPER 
    // =========================
    const pairDiv = document.createElement("div");
    pairDiv.className = "pair-wrapper";

    pairDiv.innerHTML = `
      <a href="#" class="button" id="add_pair_btn">
        <h4>Add Pair</h4>
        <img src="../assets/imgs/add.svg" alt="icon albuns"/>
      </a>

      <section class="save" id="pair_menu" style="display:none;">
        <h4>Choose a collection to pair</h4>
        <div id="pair_collections_list"></div>
      </section>
    `;

    await populatePairCollections(pairDiv, font, getAllFonts());

    const similarSection = await buildSimilarSection({
      currentFont: font,
      fontsAll: getAllFonts(),
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
    singleFontView.appendChild(pairDiv); 
    singleFontView.appendChild(similarSection);

    setupSingleViewEvents(controlsDiv, listDiv, pairDiv, font);

    if (headerBackBtn && teardownController?.signal) {
      headerBackBtn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          const existingPairBox = singleFontView.querySelector("#pair-box-wrapper");
          if (existingPairBox) {
            existingPairBox.remove();
          }
          const pairFace = document.getElementById("pair-font-face");
          if (pairFace) {
            pairFace.textContent = "";
          }
          closeSingleFontView();
        },
        { signal: teardownController.signal }
      );
    }
  }

  async function showSingleFontWithPair(headingFont, bodyFont) {
    const isAlreadyOpen = singleFontView.style.display === "block";

    if (!isAlreadyOpen) {
      openSingleFontView();
    }

    ensureFontFace(headingFont);
    ensureFontFace(bodyFont);

    const numStyles = headingFont.weights.length;
    const hasAllCaps = headingFont.tags && headingFont.tags.includes("All Caps");
    const globalText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
    const displayText = hasAllCaps ? globalText.toUpperCase() : globalText;

    const controlsDiv = document.createElement("div");
    controlsDiv.className = "bar_individual_font";
    controlsDiv.classList.add("force-visible-controls");

    controlsDiv.innerHTML = `
      <div class="sliders">
        <div class="divLabel">
          <label class="rangeLabel" for="fontSize">
            <span>font size</span>
            <span class="range-value" id="fontSizeValue">48pt</span>
          </label>
          <div class="range-container">
            <input type="range" id="fontSize" min="12" max="150" value="48">
          </div>
        </div>

        <div class="divLabel">
          <label class="rangeLabel" for="letterSpacing">
            <span>tracking</span>
            <span class="range-value" id="letterSpacingValue">0pt</span>
          </label>
          <div class="range-container">
            <input type="range" id="letterSpacing" min="-5" max="50" value="0" step="0.5">
          </div>
        </div>

        <div class="divLabel">
          <label class="rangeLabel" for="lineHeight">
            <span>leading</span>
            <span class="range-value" id="lineHeightValue">100%</span>
          </label>
          <div class="range-container">
            <input type="range" id="lineHeight" min="80" max="300" value="100" step="1">
          </div>
        </div>
      </div>

      <div class="choose-style-wrapper">
        <a href="#" class="button choose_style_btn">
          <h4>Choose style</h4>
          <img src="../assets/imgs/arrow.svg" alt="icon arrow down"/>
        </a>
        <div id="styles_menu" class="styles_menu" style="display:none;">
          <div class="styles_menu_scroll"></div>
        </div>
      </div>
    `;

    const listDiv = document.createElement("div");
    listDiv.className = "list_individual";
    listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

    const tagsHTML = renderFontTags(headingFont);
    const designers = Array.isArray(headingFont?.design) ? headingFont.design : [];
    const designersText = designers.length ? designers.map(escapeHtml).join(", ") : "";

    listDiv.innerHTML = `
      <div class="list_information_bar">
        <section class="list_information">
          <h3>${headingFont.name}</h3>
          ${headingFont.foundry !== "Unknown" ? `<h3>${headingFont.foundry}</h3>` : ""}
          ${designersText ? `<h3>${designersText}</h3>` : ""}
          <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
          ${headingFont.variable ? "<h3>Variable</h3>" : ""}
        </section>

        <section class="list_information">
          <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
          <a href="#" class="button save-btn"><h4>Save</h4></a>
        </section>

        <section class="save_list">
          <h4>Save font on...</h4>
          <a href="#" class="save-option" data-type="web"><div><h4>Aa</h4><h4>Web</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
          <a href="#" class="save-option" data-type="print"><div><h4>Aa</h4><h4>Print</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
        </section>
      </div>

      <h1 class="sampleText" contenteditable="true"
        style="font-family:'${headingFont._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
        ${displayText}
      </h1>

      ${tagsHTML}
    `;

    teardownController?.abort();
    teardownController = new AbortController();
    const signal = teardownController.signal;

    const pairBox = createPairControlsBox(bodyFont, signal);

    const pairDiv = document.createElement("div");
    pairDiv.className = "pair-wrapper";

    pairDiv.innerHTML = `
      <a href="#" class="button" id="add_pair_btn">
        <h4>Add Pair</h4>
        <img src="../assets/imgs/add.svg" alt="icon albuns"/>
      </a>

      <section class="save" id="pair_menu" style="display:none;">
        <h4>Choose a collection to pair</h4>
        <div id="pair_collections_list"></div>
      </section>
    `;

    await populatePairCollections(pairDiv, headingFont, getAllFonts());

    const similarSection = await buildSimilarSection({
      currentFont: headingFont,
      fontsAll: getAllFonts(),
      onOpenFont: showSingleFont,
      onOpenPairSuggestion: (newHeadingFont, newBodyFont) => {
        showSingleFontWithPair(newHeadingFont, newBodyFont);
      },
    });

    singleFontView.innerHTML = "";
    singleFontView.appendChild(controlsDiv);
    singleFontView.appendChild(listDiv);
    singleFontView.appendChild(pairBox);
    singleFontView.appendChild(pairDiv);
    singleFontView.appendChild(similarSection);

    setupSingleViewEvents(controlsDiv, listDiv, pairDiv, headingFont);

    const removePairBtn = pairBox.querySelector(".remove-pair-btn");
    removePairBtn?.addEventListener(
      "click",
      (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        pairBox.remove();
        const pairFace = document.getElementById("pair-font-face");
        if (pairFace) {
          pairFace.textContent = "";
        }
      },
      { signal }
    );

    if (headerBackBtn) {
      headerBackBtn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          const existingPairBox = singleFontView.querySelector("#pair-box-wrapper");
          if (existingPairBox) {
            existingPairBox.remove();
          }
          const pairFace = document.getElementById("pair-font-face");
          if (pairFace) {
            pairFace.textContent = "";
          }
          closeSingleFontView();
        },
        { signal }
      );
    }
  }

  return {
    showSingleFont,
    closeSingleFontView,
    setOnClose: (fn) => {
      onCloseCallback = fn;
    },
  };
}