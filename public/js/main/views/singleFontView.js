import { escapeHtml, ensureFontFace, pickRandom, sameTags, setFavIconState } from "../shared/fontUtils.js";
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

async function buildSimilarSection({ currentFont, fontsAll, onOpenFont }) {
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
    const res = await fetch("http://localhost:4000/api/top-pairs?limit=4");
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
      onOpenFont(body);
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

  const candidates = allFonts
    .filter((f) => f && f._id !== currentFont._id)
    .filter((f) => sameTags(f.tags, currentTags));

  const chosen = pickRandom(candidates, 4);

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
      option.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        option.classList.toggle("selected-option");
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

export function createSingleFontView({ gridEl, listEl, discoverUniverseEl, filtersPanelEl, filtersBtnEl, getAllFonts }) {
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

  function setupSingleViewEvents(controlsContainer, displayContainer, font) {
    const signal = teardownController?.signal;

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
          gridEl?.classList.add("shifted");
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
    const chooseBtn = controlsContainer.querySelector("#choose_style_btn");
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
      },
      { signal }
    );
  }

  async function showSingleFont(font) {
    openSingleFontView();

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
        <a href="#" class="button" id="choose_style_btn">
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
          <a href="#"><div><h4>Aa</h4><h4>Web</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
          <a href="#"><div><h4>Aa</h4><h4>Print</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
        </section>
      </div>

      <h1 class="sampleText" contenteditable="true"
        style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
        ${displayText}
      </h1>

      ${tagsHTML}
    `;

    const similarSection = await buildSimilarSection({
      currentFont: font,
      fontsAll: getAllFonts(),
      onOpenFont: showSingleFont,
    });

    singleFontView.innerHTML = "";
    singleFontView.appendChild(controlsDiv);
    singleFontView.appendChild(listDiv);
    singleFontView.appendChild(similarSection);

    setupSingleViewEvents(controlsDiv, listDiv, font);

    if (headerBackBtn && teardownController?.signal) {
      headerBackBtn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          closeSingleFontView();
        },
        { signal: teardownController.signal }
      );
    }
  }

  return { 
    showSingleFont, 
    closeSingleFontView,
    setOnClose: (fn) => { onCloseCallback = fn; }
  };
}