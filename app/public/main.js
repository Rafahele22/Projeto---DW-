document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".grid.grid_view");
    const filtersBtn = document.querySelector('#filters_btn');
    const filtersPanel = document.querySelector("#filters");
    const closeFiltersBtn = document.querySelector("#close_filters");
    const removeAllFiltersBtn = document.querySelector("#remove_all_filters");
    const tagsContainer = document.querySelector("#tags");
    const filtersCountBubble = filtersBtn?.querySelector("h6");

    // =========================
    // VIEW MODE (GRID/LIST)
    // =========================
    function setupViewModeToggle(articles, fonts) {
        const gridViewBtn = document.querySelector('#view_mode_selected');
        const listViewBtn = document.querySelector('#second_bar section a:last-of-type');
        const mainGrid = document.querySelector('.grid.grid_view');
        const listContainer = document.querySelector('.list');
        
        if (!gridViewBtn || !listViewBtn || !mainGrid || !listContainer) return;
        
        let isGridView = true;
        
        function toggleArticlesVisibility(isGridMode) {
            console.log(`Modo Grid: ${isGridMode}, Número de articles: ${articles.length}`);
            
            if (isGridMode) {
                for (const article of articles) {
                    article.style.display = 'block';
                }
                listContainer.style.display = 'none';
            } else {
                for (const article of articles) {
                    article.style.display = 'none';
                }
                listContainer.style.display = 'block';
                updateListContent(fonts[0]);
            }
        }
        
        function updateListContent(font) {
            const h1 = listContainer.querySelector('h1');
            if (h1 && font._id) {
                h1.style.fontFamily = `'${font._id}-font'`;
            }
            
            const fontNameElements = listContainer.querySelectorAll('.list_information h3');
            if (fontNameElements.length > 0 && font.name) {
                fontNameElements[0].textContent = font.name;
                fontNameElements[2].textContent = `${font.weights.length} styles`;
                fontNameElements[3].textContent = font.variable ? "Variable" : "Static";
            }
        }
        
        toggleArticlesVisibility(isGridView);
        
        function toggleViewMode() {
            if (isGridView) {
                gridViewBtn.id = '';
                listViewBtn.id = 'view_mode_selected';
                
                const gridImg = gridViewBtn.querySelector('img');
                const listImg = listViewBtn.querySelector('img');
                
                if (gridImg && listImg) {
                    gridImg.src = 'assets/imgs/grid.svg';
                    listImg.src = 'assets/imgs/list_selected.svg';
                }
                
                mainGrid.classList.remove('grid_view');
                mainGrid.classList.add('list_view');
                toggleArticlesVisibility(false);
                isGridView = false;
            } else {
                listViewBtn.id = '';
                gridViewBtn.id = 'view_mode_selected';
                
                const gridImg = gridViewBtn.querySelector('img');
                const listImg = listViewBtn.querySelector('img');
                
                if (gridImg && listImg) {
                    gridImg.src = 'assets/imgs/grid_selected.svg';
                    listImg.src = 'assets/imgs/list.svg';
                }
                
                mainGrid.classList.remove('list_view');
                mainGrid.classList.add('grid_view');
                toggleArticlesVisibility(true);
                isGridView = true;
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
        
        setupListEvents();
    }
    
    // =========================
    // LIST EVENTS
    // =========================
    function setupListEvents() {
        const listContainer = document.querySelector('.list');
        if (!listContainer) return;
        
        const favBtn = listContainer.querySelector('.fav-btn img');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const selected = favBtn.src.includes("fav_selected.svg");
                favBtn.src = selected ? "assets/imgs/fav.svg" : "assets/imgs/fav_selected.svg";
            });
        }
        
        const saveMenu = listContainer.querySelector('.save_list');
        const saveBtn = listContainer.querySelector('.save-btn');
        
        if (saveMenu && saveBtn) {
            saveMenu.style.display = "none";
            
            saveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                for (const menu of document.querySelectorAll(".save_list")) {
                    if (menu !== saveMenu) {
                        menu.style.display = "none";
                    }
                }
                
                saveMenu.style.display = saveMenu.style.display === "none" ? "block" : "none";
            });
            
            document.addEventListener("click", (e) => {
                if (!saveMenu.contains(e.target) && !saveBtn.contains(e.target)) {
                    saveMenu.style.display = "none";
                }
            });
        }
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
            filtersCountBubble.style.display = "flex";
            filtersCountBubble.textContent = count;
        } else {
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
            filtersCountBubble.style.display = "none";
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
        const response = await fetch("./assets/data.json");
        const fonts = await response.json();
        
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

        for (const [index, font] of fonts.entries()) {
            const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
            const fontPath = `assets/fonts/${defaultWeight.file}`;
            const numStyles = font.weights.length;

            const sampleLetter = font.tags?.includes("All Caps") ? "AA" : "Aa";

            const article = document.createElement("article");
            article.dataset.fontId = font._id;

            article.innerHTML = `
                <section class="grid_information">
                    <a href="#" class="button save-btn">
                        <h4>Save</h4>
                        <img src="assets/imgs/arrow.svg" alt="arrow"/>
                    </a>
                    <a href="#" class="fav-btn"><img src="assets/imgs/fav.svg" alt="favourite"/></a>
                </section>

                <section class="save">
                    <h4>Save font on...</h4>
                    <a href="#"><div><h4>Aa</h4><h4>Web</h4></div><h5>add</h5></a>
                    <a href="#"><div><h4>Aa</h4><h4>Print</h4></div><h5>add</h5></a>
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

            // FAVOURITE
            const favImg = article.querySelector(".fav-btn img");
            favImg.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const selected = favImg.src.includes("fav_selected.svg");
                favImg.src = selected ? "assets/imgs/fav.svg" : "assets/imgs/fav_selected.svg";
            });

            // SAVE
            const saveMenu = article.querySelector(".save");
            const saveBtn = article.querySelector(".save-btn");
            saveMenu.style.display = "none";

            saveBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                for (const menu of document.querySelectorAll(".save")) {
                    if (menu !== saveMenu) {
                        menu.style.display = "none";
                    }
                }

                saveMenu.style.display = saveMenu.style.display === "none" ? "block" : "none";
            });

            document.addEventListener("click", () => {
                saveMenu.style.display = "none";
            });
        }

        setupViewModeToggle(articles, fonts);

        // =========================
        // CARDS HEIGHTS
        // =========================
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

        // =========================
        // FILTERING
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

            for (const [i, article] of Array.from(document.querySelectorAll(".grid_view article")).entries()) {
                const font = fonts[i];
                if (!font) continue;
                
                let show = true;

                // by tags
                if (selectedTags.length > 0 && font.tags) {
                    if (!selectedTags.some(tag => font.tags.includes(tag))) {
                        show = false;
                    }
                }

                // by foundry
                if (selectedFoundries.length > 0) {
                    if (!selectedFoundries.includes(font.foundry)) {
                        show = false;
                    }
                }

                // by family size
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

                //  by variable
                if (selectedVariables.length > 0) {
                    const type = font.variable ? "Variable" : "Static";
                    if (!selectedVariables.includes(type)) {
                        show = false;
                    }
                }

                article.style.display = show ? "block" : "none";
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

            for (const a of document.querySelectorAll(".grid_view article")) {
                a.style.display = "block";
            }
            
            updateCounter();
        });

        // =========================
        // INITIAL CALLS
        // =========================
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
});