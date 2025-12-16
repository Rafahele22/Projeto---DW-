async function main() {
    const abaCollections = document.getElementById('abaCollections');
    const userLoggedIn = localStorage.getItem('user') !== null;
    
    if (abaCollections) {
        abaCollections.style.display = userLoggedIn ? '' : 'none';
    }

    const grid = document.querySelector(".grid.grid_view");
    const filtersBtn = document.querySelector('#filters_btn');
    const filtersPanel = document.querySelector("#filters");
    const closeFiltersBtn = document.querySelector("#close_filters");
    const removeAllFiltersBtn = document.querySelector("#remove_all_filters");
    const tagsContainer = document.querySelector("#tags");
    const filtersCountBubble = filtersBtn?.querySelector("h6");
    let globalSampleText = "The quick brown fox jumps over the lazy dog.";
    let allFonts = [];


    // ==========================================
    // SINGLE FONT VIEW 
    // ==========================================
let singleFontView = document.getElementById("singleFontView");
if (!singleFontView) {
  singleFontView = document.createElement("div");
  singleFontView.id = "singleFontView";
  singleFontView.style.display = "none";

  const mainEl = document.querySelector("main");
  mainEl.appendChild(singleFontView);
}

let lastScrollY = 0;

function openSingleFontView() {
  lastScrollY = window.scrollY || 0;

  document.body.classList.add("single-font-open");
  grid.classList.add("is-hidden");

  singleFontView.style.display = "block";

  if (filtersPanel) filtersPanel.style.display = "none";
  grid.classList.remove("shifted");
  filtersBtn?.classList.remove("selected");
}

function closeSingleFontView() {
  singleFontView.innerHTML = "";
  singleFontView.style.display = "none";

  grid.classList.remove("is-hidden");
  document.body.classList.remove("single-font-open");

  window.scrollTo(0, lastScrollY);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function renderFontTags(font) {
  const tags = Array.isArray(font?.tags) ? font.tags : [];
  if (!tags.length) return "";

  return `
    <section class="list_information font-tags">
      ${tags.map(tag => `
        <a href="#" class="button tag-btn"><h4>${escapeHtml(tag)}</h4></a>
      `).join("")}
    </section>
  `;
}

function sameTags(tagsA, tagsB) {
  const a = Array.isArray(tagsA) ? tagsA : [];
  const b = Array.isArray(tagsB) ? tagsB : [];
  if (a.length !== b.length) return false;

  const setA = new Set(a);
  if (setA.size !== b.length) return false;
  return b.every(t => setA.has(t));
}

function pickRandom(arr, n) {
  const copy = [...arr];
  copy.sort(() => Math.random() - 0.5);
  return copy.slice(0, n);
}

function ensureFontFace(font) {
  const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
  const fontPath = `../assets/fonts/${defaultWeight.file}`;
  const styleId = `font-face-${font._id}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @font-face {
      font-family:'${font._id}-font';
      src:url('${fontPath}');
    }
  `;
  document.head.appendChild(style);
}

function wireMiniCardEvents(articleEl, fontObj) {
  // Fav
  const favImg = articleEl.querySelector(".fav-btn img");
  favImg?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = favImg.src.includes("../assets/imgs/fav_selected.svg");
    favImg.src = selected ? "../assets/imgs/fav.svg" : "../assets/imgs/fav_selected.svg";
  });

  // Save menu
  const saveMenu = articleEl.querySelector(".save");
  const saveBtn = articleEl.querySelector(".save-btn");
  if (saveMenu) saveMenu.style.display = "none";

  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.querySelectorAll(".save, .save_list").forEach(menu => {
      if (menu !== saveMenu) {
        menu.style.display = "none";
        menu.parentElement.querySelector(".save-btn")?.classList.remove("selected");
      }
    });

    const isOpening = saveMenu && saveMenu.style.display === "none";
    if (saveMenu) saveMenu.style.display = isOpening ? "block" : "none";
    saveBtn.classList.toggle("selected", isOpening);
  });

  articleEl.querySelectorAll(".save-option").forEach(option => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      option.classList.toggle("selected-option");
    });
  });

  articleEl.addEventListener("click", (e) => {
    if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".save")) return;
    showSingleFont(fontObj);
  });
}

function buildSimilarSection(currentFont, fontsAll) {
  const wrapper = document.createElement("div");
  wrapper.className = "similar-wrapper";

  const title = document.createElement("h2");
  title.textContent = "Similar";
  wrapper.appendChild(title);

  const similarGrid = document.createElement("div");
  similarGrid.className = "grid grid_view";
  wrapper.appendChild(similarGrid);

  const currentTags = Array.isArray(currentFont?.tags) ? currentFont.tags : [];

  const candidates = (Array.isArray(fontsAll) ? fontsAll : [])
    .filter(f => f && f._id !== currentFont._id)
    .filter(f => sameTags(f.tags, currentTags));

  const chosen = pickRandom(candidates, 4);

  chosen.forEach(font => {
    ensureFontFace(font);

    const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
    const numStyles = font.weights.length;
    const sampleLetter = font.tags?.includes("All Caps") ? "AA" : "Aa";

    const article = document.createElement("article");
    article.dataset.fontId = font._id;

    article.innerHTML = `
      <section class="grid_information">
        <a href="#" class="button save-btn">
          <h4>Save</h4>
        </a>
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

      <h1 style="font-family:'${font._id}-font'">${sampleLetter}</h1>

      <section class="grid_information">
        <h2>${font.name}</h2>
        <h3>${numStyles} styles</h3>
      </section>
    `;

    wireMiniCardEvents(article, font);
    similarGrid.appendChild(article);
  });

  return wrapper;
}


function showSingleFont(font) {
  openSingleFontView();

  const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
  const numStyles = font.weights.length;
  const hasAllCaps = font.tags && font.tags.includes("All Caps");
  const sampleText = "The quick brown fox jumps over the lazy dog.";
  const displayText = hasAllCaps ? sampleText.toUpperCase() : sampleText;

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "bar_individual_font";
  controlsDiv.classList.add("force-visible-controls");

  controlsDiv.innerHTML = `
    <a href="#" class="button" id="backToCollection">
      <img src="../assets/imgs/back_arrow.svg" alt="icon arrow left"/>
      <h4>Back</h4>
    </a>

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
          <span class="range-value" id="lineHeightValue">1.5</span>
        </label>
        <div class="range-container">
          <input type="range" id="lineHeight" min="0.8" max="3" value="1.5" step="0.1">
        </div>
      </div>
    </div>

    <div class="choose-style-wrapper">
    <a href="#" class="button" id="choose_style_btn">
      <h4>Choose style</h4>
      <img src="../assets/imgs/arrow.svg" alt="icon arrow down"/>
    </a>
    <div id="styles_menu" class="styles_menu" style="display:none;"></div>
  </div>
  `;

  const listDiv = document.createElement("div");
  listDiv.className = "list_individual";
  const tagsHTML = renderFontTags(font);

  listDiv.innerHTML = `
  <div class="list_information_bar">
    <section class="list_information">
      <h3>${font.name}</h3>
      ${font.foundry !== "Unknown" ? `<h3>${font.foundry}</h3>` : ""}
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

  <h1 contenteditable="true"
      style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
    ${displayText}
  </h1>

  ${tagsHTML}
`;

const similarSection = buildSimilarSection(font, allFonts);

singleFontView.innerHTML = "";
singleFontView.appendChild(controlsDiv);
singleFontView.appendChild(listDiv);
singleFontView.appendChild(similarSection);

setupSingleViewEvents(controlsDiv, listDiv, font);


  const backBtn = controlsDiv.querySelector("#backToCollection");
  backBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeSingleFontView();
  });
}

function setupSingleViewEvents(controlsContainer, displayContainer, font) {

  // -------------------------
  // FAVOURITE + SAVE 
  // -------------------------
  const favBtn = displayContainer.querySelector(".fav-btn img");
  favBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = favBtn.src.includes("../assets/imgs/fav_selected.svg");
    favBtn.src = selected ? "../assets/imgs/fav.svg" : "../assets/imgs/fav_selected.svg";
  });

  const saveMenu = displayContainer.querySelector(".save_list");
  const saveBtn = displayContainer.querySelector(".save-btn");

  if (saveMenu) saveMenu.style.display = "none";

  if (saveBtn && saveMenu) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpening = saveMenu.style.display === "none";
      saveMenu.style.display = isOpening ? "block" : "none";
      saveBtn.classList.toggle("selected", isOpening);
    });
  }

  // -------------------------
  // SLIDERS
  // -------------------------
  const h1 = displayContainer.querySelector("h1");
  const fontSize = controlsContainer.querySelector("#fontSize");
  const letterSpacing = controlsContainer.querySelector("#letterSpacing");
  const lineHeight = controlsContainer.querySelector("#lineHeight");

  const fontSizeValue = controlsContainer.querySelector("#fontSizeValue");
  const letterSpacingValue = controlsContainer.querySelector("#letterSpacingValue");
  const lineHeightValue = controlsContainer.querySelector("#lineHeightValue");

  fontSize?.addEventListener("input", function () {
    if (fontSizeValue) fontSizeValue.textContent = this.value + "pt";
    if (h1) h1.style.fontSize = this.value + "pt";
  });

  letterSpacing?.addEventListener("input", function () {
    if (letterSpacingValue) letterSpacingValue.textContent = this.value + "pt";
    if (h1) h1.style.letterSpacing = this.value + "pt";
  });

  lineHeight?.addEventListener("input", function () {
    if (lineHeightValue) lineHeightValue.textContent = this.value;
    if (h1) h1.style.lineHeight = this.value;
  });

  // -------------------------
  // CHOOSE STYLE 
  // -------------------------
  const chooseBtn = controlsContainer.querySelector("#choose_style_btn");
  const menu = controlsContainer.querySelector("#styles_menu");

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
    if (!menu) return;
    menu.innerHTML = "";

    const defaultWeight = font.weights.find(w => w.default) || font.weights[0];

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
      menu.appendChild(optionLink);

      optionLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        menu.querySelectorAll(".option_selected").forEach(sel => sel.classList.remove("selected"));
        optionSelected.classList.add("selected");

        applyWeight(w);

        menu.style.display = "none";
        chooseBtn?.classList.remove("selected");
      });
    });

    applyWeight(defaultWeight);
  }

  buildStylesMenu();

 chooseBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!menu) return;

  const isOpening = menu.style.display === "none";
  menu.style.display = isOpening ? "block" : "none";
  chooseBtn.classList.toggle("selected", isOpening);

  displayContainer.classList.toggle("shifted", isOpening);
});

document.addEventListener("click", (e) => {
  if (menu && chooseBtn && !menu.contains(e.target) && !chooseBtn.contains(e.target)) {
    menu.style.display = "none";
    chooseBtn.classList.remove("selected");
    displayContainer.classList.remove("shifted");
  }
});

  document.addEventListener("click", (e) => {
    if (menu && chooseBtn && !menu.contains(e.target) && !chooseBtn.contains(e.target)) {
      menu.style.display = "none";
      chooseBtn.classList.remove("selected");
    }
    if (saveMenu && saveBtn && !saveMenu.contains(e.target) && !saveBtn.contains(e.target)) {
      saveMenu.style.display = "none";
      saveBtn.classList.remove("selected");
    }
  });
}




    // =========================
    // VIEW MODE (GRID/LIST)
    // =========================
    let isGridView = true;
    
    function setupViewModeToggle(articles, fonts) {
        const gridViewBtn = document.querySelector('#view_mode_selected');
        const listViewBtn = document.querySelector('#second_bar section a:last-of-type');
        const mainGrid = document.querySelector('.grid.grid_view');
        
        if (!gridViewBtn || !listViewBtn || !mainGrid) return;
        
        function toggleViewMode() {
    const filtersOpen = filtersPanel.style.display === "flex";
    
    if (isGridView) {
        gridViewBtn.id = '';
        listViewBtn.id = 'view_mode_selected';
        
        const gridImg = gridViewBtn.querySelector('img');
        const listImg = listViewBtn.querySelector('img');
        
        if (gridImg && listImg) {
            gridImg.src = '../assets/imgs/grid.svg';
            listImg.src = '../assets/imgs/list_selected.svg';
        }
        
        mainGrid.classList.remove('grid_view');
        mainGrid.classList.add('list_view');
        isGridView = false;
        
        if (filtersOpen) {
            mainGrid.classList.add('shifted');
        }
        
        filterFonts();
    } else {
        listViewBtn.id = '';
        gridViewBtn.id = 'view_mode_selected';
        
        const gridImg = gridViewBtn.querySelector('img');
        const listImg = listViewBtn.querySelector('img');
        
        if (gridImg && listImg) {
            gridImg.src = '../assets/imgs/grid_selected.svg';
            listImg.src = '../assets/imgs/list.svg';
        }
        
        mainGrid.classList.remove('list_view');
        mainGrid.classList.add('grid_view');
        isGridView = true;
        
        if (filtersOpen) {
            mainGrid.classList.add('shifted');
        }
        
        filterFonts();
    }
}
        
        gridViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!isGridView) {
                toggleViewMode();
            }
        });
        
        listViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isGridView) {
                toggleViewMode();
            }
        });
        
        document.addEventListener("click", (e) => {
            document.querySelectorAll(".save_list").forEach(saveMenu => {
                const saveBtn = saveMenu.parentElement.querySelector(".save-btn");
                if (!saveMenu.contains(e.target) && (!saveBtn || !saveBtn.contains(e.target))) {
                    saveMenu.style.display = "none";
                    if (saveBtn) saveBtn.classList.remove("selected");
                }
            });
        });
    }
    
    function truncateToSingleLine(element) {
    const originalText = element.innerText;
    let low = 0;
    let high = originalText.length;
    let truncated = originalText;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        element.innerText = originalText.slice(0, mid) + "…";

        if (element.scrollHeight > element.clientHeight) {
            high = mid - 1;
        } else {
            truncated = element.innerText;
            low = mid + 1;
        }
    }

    element.innerText = truncated;
}


function normalizeForAllCaps(text) {
  return (text || "").toUpperCase();
}


      function generateListItems(fonts) {
    const grid = document.querySelector(".grid.grid_view");
    if (!grid) return;
    
    fonts.forEach(font => {
        const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
        const numStyles = font.weights.length;
        const designList = font.design ? font.design.join(", ") : "Unknown";
        
        const hasAllCaps = font.tags && font.tags.includes("All Caps");
        const sampleText = "The quick brown fox jumps over the lazy dog.";
        const displayText = hasAllCaps ? sampleText.toUpperCase() : sampleText;
        
        const listDiv = document.createElement("div");
        listDiv.className = "list";

        listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";
        
        listDiv.innerHTML = `
            <div class="list_information_bar">
                <section class="list_information">
                    <h3>${font.name}</h3>
                    ${font.foundry !== "Unknown" ? `<h3>${font.foundry}</h3>` : ""}
                    <h3>${numStyles} ${numStyles === 1 ? 'style' : 'styles'}</h3>
                    ${font.variable ? '<h3>Variable</h3>' : ''}
                </section>
                <section class="list_information">
                    <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
                    <a href="#" class="button save-btn">
                        <h4>Save</h4>
                    </a>
                </section>
                <section class="save_list">
                    <h4>Save font on...</h4>
                    <a href="#"><div><h4>Aa</h4><h4>Web</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
                    <a href="#"><div><h4>Aa</h4><h4>Print</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
                </section>
            </div>
            <h1 class="sampleText" contenteditable="true" style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">${displayText}</h1>
        `;
        
listDiv.addEventListener('click', (e) => {
    if (e.target.closest('a') || 
        e.target.closest('input') || 
        e.target.closest('.save_list') || 
        e.target.closest('.range-container') ||
        e.target.closest('h1[contenteditable="true"]')) {
        return;
    }
    showSingleFont(font);
});


        grid.appendChild(listDiv);

        const style = document.createElement("style");
        style.textContent = `
            @font-face {
                font-family:'${font._id}-font';
                src:url('../assets/fonts/${defaultWeight.file}');
            }
        `;
        document.head.appendChild(style);
        
        setupListItemEvents(listDiv, font);
    });
   }

    
        function setupListItemEvents(listItem, font) {
        // FAVOURITE
        const favBtn = listItem.querySelector('.fav-btn img');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const selected = favBtn.src.includes("../assets/imgs/fav_selected.svg");
                favBtn.src = selected ? "../assets/imgs/fav.svg" : "../assets/imgs/fav_selected.svg";
            });
        }
        
        // SAVE MENU
        const saveMenu = listItem.querySelector('.save_list');
        const saveBtn = listItem.querySelector('.save-btn');
        
        if (saveMenu) saveMenu.style.display = "none";
        
        if (saveBtn) {
            saveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                document.querySelectorAll(".save, .save_list").forEach(menu => {
                    if (menu !== saveMenu) {
                        menu.style.display = "none";
                        menu.parentElement.querySelector(".save-btn")?.classList.remove("selected");
                    }
                });

                const isOpening = saveMenu.style.display === "none";
                
                if (saveMenu) saveMenu.style.display = isOpening ? "block" : "none";
                
                if (isOpening) {
                    saveBtn.classList.add("selected");
                } else {
                    saveBtn.classList.remove("selected");
                }
            });
        }

        // SAVE OPTIONS
        const saveOptions = listItem.querySelectorAll('.save_list a');
        saveOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                option.classList.toggle('selected-option');
            });
        });
        
        // FONT CONTROLS
        const h1 = listItem.querySelector('h1');
        const fontSize = listItem.querySelector('#fontSize');
        const letterSpacing = listItem.querySelector('#letterSpacing');
        const lineHeight = listItem.querySelector('#lineHeight');
        
        const fontSizeValue = listItem.querySelector('#fontSizeValue');
        const letterSpacingValue = listItem.querySelector('#letterSpacingValue');
        const lineHeightValue = listItem.querySelector('#lineHeightValue');
        
        if (fontSize && fontSizeValue && h1) {
            fontSize.addEventListener('input', function() {
                fontSizeValue.textContent = this.value + 'pt';
                h1.style.fontSize = this.value + 'pt';
            });
        }
        
        if (letterSpacing && letterSpacingValue && h1) {
            letterSpacing.addEventListener('input', function() {
                letterSpacingValue.textContent = this.value + 'pt';
                h1.style.letterSpacing = this.value + 'pt';
            });
        }
        
        if (lineHeight && lineHeightValue && h1) {
            lineHeight.addEventListener('input', function() {
                lineHeightValue.textContent = this.value;
                h1.style.lineHeight = this.value;
            });
        }
        
        if (!listItem.classList.contains('force-visible')) {
            const divLabels = listItem.querySelectorAll('.divLabel');
            
            listItem.addEventListener('mouseenter', () => {
                divLabels.forEach(label => {
                    label.style.opacity = '1';
                    label.style.pointerEvents = 'auto';
                });
            });
            
            listItem.addEventListener('mouseleave', () => {
                divLabels.forEach(label => {
                    label.style.opacity = '0';
                    label.style.pointerEvents = 'none';
                });
            });
        }

       const editable = listItem.querySelector('h1.sampleText');

function renderGlobalTextEverywhere() {
  document.querySelectorAll('h1.sampleText').forEach(h1 => {
    if (h1 === document.activeElement) return;

    h1.innerText = globalSampleText;
  });
}

//WRITE TXT
let isCapsLockOn = false;
document.addEventListener('keydown', (e) => isCapsLockOn = e.getModifierState("CapsLock"));
document.addEventListener('keyup', (e) => isCapsLockOn = e.getModifierState("CapsLock"));

if (editable) {
  renderGlobalTextEverywhere();

  editable.addEventListener('input', (e) => {
    const parent = editable.closest('.list');
    const isAllCapsBox = parent?.dataset.allCaps === "1";
    
    if (!isAllCapsBox) {
        globalSampleText = editable.innerText;
        renderGlobalTextEverywhere();
        return;
    }
    
    const visualText = editable.innerText; 
    const oldText = globalSampleText;      
    
    if (Math.abs(visualText.length - oldText.length) > 1) {
         globalSampleText = isCapsLockOn ? visualText : visualText.toLowerCase();
         renderGlobalTextEverywhere();
         return;
    }

    if (visualText.length > oldText.length) {
        
        let newChar = "";
        for(let i=0; i<visualText.length; i++) {
            if (visualText[i] !== oldText[i]?.toUpperCase()) {
                newChar = visualText[i];
                break;
            }
        }
        
        if (!newChar) newChar = visualText[visualText.length - 1];

        const finalChar = isCapsLockOn ? newChar.toUpperCase() : newChar.toLowerCase();
        
        if (!isCapsLockOn) {
            globalSampleText = visualText.toLowerCase();
        } else {

            let reconstructed = "";
            let j = 0;
            
            for (let i = 0; i < visualText.length; i++) {
                const visualChar = visualText[i];
                const oldChar = oldText[j];
                
                if (oldChar && visualChar === oldChar.toUpperCase()) {
                    reconstructed += oldChar;
                    j++;
                } else {
                    reconstructed += isCapsLockOn ? visualChar.toUpperCase() : visualChar.toLowerCase();
                }
            }
            globalSampleText = reconstructed;
        }
    } else {
        if (!isCapsLockOn) {
             globalSampleText = visualText.toLowerCase();
        } else {
             globalSampleText = visualText; 
        }
    }

    renderGlobalTextEverywhere();
  });
}



    }

    
    // =========================
    // FILTER LIST VIEW
    // =========================
    function filterListItems(selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables, fonts) {
        const listItems = document.querySelectorAll('.list');
        let visibleCount = 0;
        
        listItems.forEach((listItem, index) => {
            const font = fonts[index];
            if (!font) {
                listItem.style.display = 'none';
                return;
            }
            
            let show = checkFontAgainstFilters(font, selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables);

            listItem.style.display = show ? 'block' : 'none';
            if (show) visibleCount++;
        });
        
        return visibleCount;
    }
    
    // =========================
    // HELPER
    // =========================
    function checkFontAgainstFilters(font, selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables) {
        let show = true;

        // TAGS
        if (selectedTags.length > 0 && font.tags) {
            if (!selectedTags.some(tag => font.tags.includes(tag))) {
                show = false;
            }
        }

        // FOUNDRY
        if (selectedFoundries.length > 0) {
            if (!selectedFoundries.includes(font.foundry)) {
                show = false;
            }
        }

        // FAMILY SIZE
        if (selectedFamilySizes.length > 0) {
            const n = font.weights.length;
            let size = "";
            
            if (n === 1) size = "single";
            else if (n <= 6) size = "small";
            else if (n <= 10) size = "medium";
            else if (n <= 20) size = "large";
            else size = "xlarge";

            if (!selectedFamilySizes.includes(size)) {
                show = false;
            }
        }

        // VARIABLE
        if (selectedVariables.length > 0) {
            const type = font.variable ? "Variable" : "Static";
            if (!selectedVariables.includes(type)) {
                show = false;
            }
        }

        return show;
    }
    
    // =========================
    // FILTER GRID VIEW
    // =========================
    function filterArticles(selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables, fonts) {
        const articles = document.querySelectorAll('article');
        let visibleCount = 0;
        
        articles.forEach((article, index) => {
            const font = fonts[index];
            if (!font) {
                article.style.display = 'none';
                return;
            }
            
            let show = checkFontAgainstFilters(font, selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables);

            article.style.display = show ? 'block' : 'none';
            if (show) visibleCount++;
        });
        
        return visibleCount;
    }
    
    // =========================
    // INITIALIZATION
    // =========================
    if (filtersPanel) {
        filtersPanel.style.display = "none";
    }

    if (filtersCountBubble) {
        filtersCountBubble.style.display = "none";
    }

    // =========================
    // FILTER COUNTER
    // =========================
    let foundrySection = null;
    let familySizeSection = null;
    let variableSection = null;

    function getFilterCount() {
        let count = 0;
        
        for (const tag of document.querySelectorAll("#tags .selected")) {
            count++;
        }
        
        if (foundrySection?.querySelector(".option_selected.selected")) {
            count++;
        }
        
        if (familySizeSection?.querySelector(".option_selected.selected")) {
            count++;
        }
        
        if (variableSection?.querySelector(".option_selected.selected")) {
            count++;
        }
        
        return count;
    }

    function updateCounter() {
        const count = getFilterCount();
        const isFiltersOpen = filtersPanel.style.display === "flex";
        
        if (count > 0 && !isFiltersOpen) {
            if (filtersCountBubble) {
                filtersCountBubble.style.display = "flex";
                filtersCountBubble.textContent = count;
            }
        } else if (filtersCountBubble) {
            filtersCountBubble.style.display = "none";
        }
    }

    // =========================
    // SHOW / HIDE FILTER PANEL
    // =========================
    filtersBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyOpen = filtersPanel.style.display === "flex";
        const newStateOpen = !isCurrentlyOpen;

        filtersPanel.style.display = newStateOpen ? "flex" : "none";
        grid.classList.toggle("shifted", newStateOpen);
        filtersBtn.classList.toggle("selected", newStateOpen);

        if (newStateOpen) {
            if (filtersCountBubble) filtersCountBubble.style.display = "none";
        } else {
            updateCounter();
        }
    });

    closeFiltersBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        filtersPanel.style.display = "none";
        grid.classList.remove("shifted");
        filtersBtn.classList.remove("selected");
        updateCounter();
    });

    document.addEventListener("click", (e) => {
        if (filtersPanel && !filtersPanel.contains(e.target) && !filtersBtn.contains(e.target)) {
            filtersPanel.style.display = "none";
            grid.classList.remove("shifted");
            filtersBtn.classList.remove("selected");
            updateCounter();
        }
    });

    // =========================
    // LOAD JSON AND BUILD UI
    // =========================
    try {
        const response = await fetch("../assets/data.json");
        const fonts = await response.json();
        allFonts = fonts;
        
        const allTags = [];
        const foundriesMap = {};

        for (const font of fonts) {
            if (font.tags && Array.isArray(font.tags)) {
                for (const tag of font.tags) {
                    if (!allTags.includes(tag)) {
                        allTags.push(tag);
                    }
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

        // TAG BUTTONS
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
            
            for (const tag of allTags) {
                const tagBtn = document.createElement("a");
                tagBtn.href = "#";
                tagBtn.className = "button tag-btn";
                tagBtn.dataset.tag = tag;
                tagBtn.innerHTML = `<h4>${tag}</h4>`;
                tagsContainer.appendChild(tagBtn);

                tagBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    tagBtn.classList.toggle("selected");
                    filterFonts();
                    updateCounter();
                });
            }
        }

        // FILTER SECTIONS
        const filterSections = document.querySelectorAll('#filters .filters_section');
        
        for (const section of filterSections) {
            const title = section.querySelector('h2');
            if (!title) continue;
            
            if (title.textContent === 'Foundry') {
                foundrySection = section;
            }
            if (title.textContent === 'Family Size') {
                familySizeSection = section;
            }
            if (title.textContent === 'Variable') {
                variableSection = section;
            }
        }

        // FILTERS: FOUNDRY 
        if (foundrySection) {
            for (const el of foundrySection.querySelectorAll('a.option')) {
                el.remove();
            }

            for (const foundry of foundriesList) {
                const optionLink = document.createElement("a");
                optionLink.href = "#";
                optionLink.className = "option foundry-option";
                optionLink.dataset.foundry = foundry;

                const optionSelected = document.createElement("div");
                optionSelected.className = "option_selected";

                const optionText = document.createElement("h5");
                optionText.textContent = foundry;

                optionLink.appendChild(optionSelected);
                optionLink.appendChild(optionText);
                foundrySection.appendChild(optionLink);

                optionLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    const isSelected = optionSelected.classList.contains("selected");
                    
                    for (const sel of foundrySection.querySelectorAll(".option_selected")) {
                        sel.classList.remove("selected");
                    }
                    
                    if (!isSelected) {
                        optionSelected.classList.add("selected");
                    }

                    filterFonts();
                    updateCounter();
                });
            }
        }

        // FILTERS: : FAMILY SIZE
        if (familySizeSection) {
            for (const option of familySizeSection.querySelectorAll("a.option")) {
                option.addEventListener("click", (e) => {
                    e.preventDefault();
                    const sel = option.querySelector(".option_selected");
                    const already = sel.classList.contains("selected");

                    for (const s of familySizeSection.querySelectorAll(".option_selected")) {
                        s.classList.remove("selected");
                    }
                    
                    if (!already) {
                        sel.classList.add("selected");
                    }

                    filterFonts();
                    updateCounter();
                });
            }
        }

        // FILTERS: VARIABLE
        if (variableSection) {
            for (const option of variableSection.querySelectorAll("a.option")) {
                option.addEventListener("click", (e) => {
                    e.preventDefault();
                    const sel = option.querySelector(".option_selected");
                    const already = sel.classList.contains("selected");

                    for (const s of variableSection.querySelectorAll(".option_selected")) {
                        s.classList.remove("selected");
                    }
                    
                    if (!already) {
                        sel.classList.add("selected");
                    }

                    filterFonts();
                    updateCounter();
                });
            }
        }

        // =========================
        // BUILD FONT CARDS
        // =========================
        let initialMaxHeight = 0;
        const articles = [];

        generateListItems(fonts);
        
               for (const [index, font] of fonts.entries()) {
            const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
            const fontPath = `../assets/fonts/${defaultWeight.file}`;
            const numStyles = font.weights.length;

            const sampleLetter = font.tags?.includes("All Caps") ? "AA" : "Aa";

            const article = document.createElement("article");
            article.dataset.fontId = font._id;

            article.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.save')) {
                    return; 
                }
                showSingleFont(font);
            });

            article.innerHTML = `
                <section class="grid_information">
                    <a href="#" class="button save-btn">
                        <h4>Save</h4>
                    </a>
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

                <h1 style="font-family:'${font._id}-font'">${sampleLetter}</h1>

                <section class="grid_information">
                    <h2>${font.name}</h2>
                    <h3>${numStyles} styles</h3>
                </section>
            `;

            const style = document.createElement("style");
            style.textContent = `
                @font-face {
                    font-family:'${font._id}-font';
                    src:url('${fontPath}');
                }
            `;
            document.head.appendChild(style);

            grid.appendChild(article);
            articles.push(article);
            
            const favImg = article.querySelector(".fav-btn img");
            favImg.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const selected = favImg.src.includes("../assets/imgs/fav_selected.svg");
                favImg.src = selected ? "../assets/imgs/fav.svg" : "../assets/imgs/fav_selected.svg";
            });

            const saveMenu = article.querySelector(".save");
            const saveBtn = article.querySelector(".save-btn");
            saveMenu.style.display = "none";

            saveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                document.querySelectorAll(".save, .save_list").forEach(menu => {
                    if (menu !== saveMenu) {
                        menu.style.display = "none";
                        menu.parentElement.querySelector(".save-btn")?.classList.remove("selected");
                    }
                });

                const isOpening = saveMenu.style.display === "none";
                saveMenu.style.display = isOpening ? "block" : "none";
                
                if (isOpening) {
                    saveBtn.classList.add("selected");
                } else {
                    saveBtn.classList.remove("selected");
                }
            });
            
            const saveOptions = article.querySelectorAll('.save-option');
            saveOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    option.classList.toggle('selected-option');
                });
            });

            article.addEventListener("mouseleave", () => {
                saveMenu.style.display = "none";
                saveBtn.classList.remove("selected");
            });

            document.addEventListener("click", (e) => {
                if (!saveMenu.contains(e.target) && !saveBtn.contains(e.target)) {
                    saveMenu.style.display = "none";
                    saveBtn.classList.remove("selected");
                }
            });
        }

        setupViewModeToggle(articles, fonts);

        // =========================
        // FILTERING FUNCTION
        // =========================
        function filterFonts() {
            const selectedTags = Array.from(document.querySelectorAll("#tags .selected"))
                .map(btn => btn.dataset.tag);

            const selectedFoundries = foundrySection ? 
                Array.from(foundrySection.querySelectorAll(".option_selected.selected"))
                    .map(sel => sel.closest(".foundry-option").dataset.foundry) : [];

            const selectedFamilySizes = familySizeSection ?
                Array.from(familySizeSection.querySelectorAll(".option_selected.selected"))
                    .map(sel => sel.closest("a.option").dataset.familySize) : [];

            const selectedVariables = variableSection ?
                Array.from(variableSection.querySelectorAll(".option_selected.selected"))
                    .map(sel => sel.closest("a.option").querySelector("h5").textContent) : [];

            let visibleCount = 0;

            if (isGridView) {
                visibleCount = filterArticles(selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables, fonts);
                
                document.querySelectorAll('.list').forEach(listItem => {
                    listItem.style.display = 'none';
                });
            } else {
                visibleCount = filterListItems(selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables, fonts);
                
                document.querySelectorAll('article').forEach(article => {
                    article.style.display = 'none';
                });
            }

            const noResults = document.getElementById("no_results");
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? "block" : "none";
            }
        }

        // =========================
        // REMOVE ALL FILTERS
        // =========================
        removeAllFiltersBtn.addEventListener("click", (e) => {
            e.preventDefault();

            for (const btn of document.querySelectorAll("#tags .selected")) {
                btn.classList.remove("selected");
            }
            
            if (foundrySection) {
                for (const s of foundrySection.querySelectorAll(".option_selected")) {
                    s.classList.remove("selected");
                }
            }
            
            if (familySizeSection) {
                for (const s of familySizeSection.querySelectorAll(".option_selected")) {
                    s.classList.remove("selected");
                }
            }
            
            if (variableSection) {
                for (const s of variableSection.querySelectorAll(".option_selected")) {
                    s.classList.remove("selected");
                }
            }

            filterFonts();
            updateCounter();
        });

        // =========================
        // INITIAL CALLS
        // =========================
        document.querySelectorAll('.list').forEach(listItem => {
            listItem.style.display = 'none';
        });
        
        document.querySelectorAll('article').forEach(article => {
            article.style.display = 'block';
        });

        function setInitialCardHeights() {
            if (!articles.length) return;

            for (const c of articles) {
                c.style.height = "auto";
            }

            initialMaxHeight = 0;
            for (const c of articles) {
                const height = c.offsetHeight;
                if (height > initialMaxHeight) {
                    initialMaxHeight = height;
                }
            }

            for (const c of articles) {
                c.style.height = initialMaxHeight + "px";
            }
        }

        setTimeout(() => {
            setInitialCardHeights();
            updateCounter();
        }, 100);

        window.addEventListener("resize", () => {
            for (const c of articles) {
                c.style.height = "auto";
            }
            
            let newMax = 0;
            for (const c of articles) {
                const height = c.offsetHeight;
                if (height > newMax) {
                    newMax = height;
                }
            }
            
            for (const c of articles) {
                c.style.height = newMax + "px";
            }
        });
    } catch (err) {
        console.error("Error loading JSON:", err);
    }
};

main();

console.log(require("process").platform)