document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid.grid_view");
    const filtersBtn = document.querySelector('#filters_btn');
    const filtersPanel = document.querySelector("#filters");
    const closeFiltersBtn = document.querySelector("#close_filters");
    const removeAllFiltersBtn = document.querySelector("#remove_all_filters");
    const tagsContainer = document.querySelector("#tags");

    // =========================
    // INITIALIZATION
    // =========================
    if (filtersPanel) filtersPanel.style.display = "none";

    // =========================
    // TOGGLE FILTERS PANEL
    // =========================
    filtersBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!filtersPanel || !grid) return;

        const isOpening = filtersPanel.style.display === "none";
        filtersPanel.style.display = isOpening ? "flex" : "none";
        grid.classList.toggle("shifted", isOpening);
        filtersBtn.classList.toggle("selected", isOpening);
    });

    closeFiltersBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        filtersPanel.style.display = "none";
        grid.classList.remove("shifted");
        filtersBtn.classList.remove("selected");
    });

    document.addEventListener("click", (e) => {
        if (!filtersPanel.contains(e.target) && !filtersBtn.contains(e.target)) {
            filtersPanel.style.display = "none";
            grid.classList.remove("shifted");
            filtersBtn.classList.remove("selected");
        }
    });

    // =========================
    // LOAD JSON AND CREATE ARTICLES + DYNAMIC TAGS
    // =========================
    fetch("./assets/data.json")
        .then(res => res.json())
        .then(fonts => {
            const allTags = [];
            const foundriesMap = {};

            fonts.forEach(font => {
                if (font.tags && Array.isArray(font.tags)) {
                    font.tags.forEach(tag => {
                        if (!allTags.includes(tag)) allTags.push(tag);
                    });
                }
                if (font.foundry) {
                    foundriesMap[font.foundry] = (foundriesMap[font.foundry] || 0) + 1;
                }
            });

            const foundriesList = Object.entries(foundriesMap)
                .filter(([_, count]) => count >= 2)
                .map(([foundry, _]) => foundry)
                .sort();

            allTags.sort();

            // =========================
            // TAGS
            // =========================
            if (tagsContainer) {
                tagsContainer.innerHTML = '';
                allTags.forEach(tag => {
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
                    });
                });
            }

            // =========================
            // FOUNDRIES
            // =========================
            const filterSections = document.querySelectorAll('#filters .filters_section');
            let foundrySection = null;
            filterSections.forEach(section => {
                const title = section.querySelector('h2');
                if (title && title.textContent === 'Foundry') foundrySection = section;
            });

            if (foundrySection) {
                const elementsToRemove = foundrySection.querySelectorAll('a.option');
                elementsToRemove.forEach(el => el.remove());

                foundriesList.forEach(foundry => {
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
                        optionSelected.classList.toggle("selected");
                        filterFonts();
                    });
                });

                if (foundriesList.length === 0) {
                    const noFoundriesMsg = document.createElement("h5");
                    noFoundriesMsg.textContent = "No foundries with 2+ occurrences";
                    noFoundriesMsg.style.color = "var(--darker-grey)";
                    noFoundriesMsg.style.fontStyle = "italic";
                    foundrySection.appendChild(noFoundriesMsg);
                }
            }

            // =========================
            // FILTER FONTS
            // =========================
            function filterFonts() {
                const selectedTags = Array.from(document.querySelectorAll('#tags .tag-btn.selected')).map(btn => btn.dataset.tag);
                const selectedFoundries = Array.from(document.querySelectorAll('.foundry-option .option_selected.selected'))
                    .map(sel => sel.closest('.foundry-option').dataset.foundry);

                document.querySelectorAll('.grid_view article').forEach((article, index) => {
                    const fontData = fonts[index];
                    let show = true;

                    if (selectedTags.length > 0 && fontData.tags) {
                        if (!selectedTags.some(tag => fontData.tags.includes(tag))) show = false;
                    }

                    if (selectedFoundries.length > 0 && fontData.foundry) {
                        if (!selectedFoundries.includes(fontData.foundry)) show = false;
                    }

                    article.style.display = show ? 'block' : 'none';
                });
            }

            // =========================
            // CREATE FONT ARTICLES
            // =========================
            fonts.forEach((font, index) => {
                const defaultWeight = font.weights.find(w => w.default) || font.weights[0];
                const fontPath = `assets/fonts/${defaultWeight.file}`;
                const numStyles = font.weights.length;

                const article = document.createElement("article");
                article.dataset.fontId = font._id;

                article.innerHTML = `
                    <section class="grid_information">
                        <a href="#" class="button save-btn">
                            <h4>Save</h4>
                            <img src="assets/imgs/arrow.svg" alt="arrow"/>
                        </a>
                        <a href="#"><img src="assets/imgs/fav.svg" alt="icon favourite"/></a>
                    </section>
                    <section class="save">
                        <h4>Save font on...</h4>
                        <a href="#"><div><h4>Aa</h4><h4>Web</h4></div><h5>add</h5></a>
                        <a href="#"><div><h4>Aa</h4><h4>Print</h4></div><h5>add</h5></a>
                    </section>
                    <h1 style="font-family:'${font._id}-font'">Aa</h1>
                    <section class="grid_information">
                        <h2>${font.name}</h2>
                        <h3>${numStyles} styles</h3>
                    </section>
                `;

                const style = document.createElement("style");
                style.textContent = `@font-face { font-family:'${font._id}-font'; src:url('${fontPath}'); }`;
                document.head.appendChild(style);

                grid.appendChild(article);

                // =========================
                // SAVE MENU
                // =========================
                const saveBtn = article.querySelector(".save-btn");
                const saveMenu = article.querySelector(".save");
                saveMenu.style.display = "none";

                saveBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    document.querySelectorAll(".save").forEach(menu => {
                        if (menu !== saveMenu) menu.style.display = "none";
                    });
                    saveMenu.style.display = saveMenu.style.display === "none" ? "block" : "none";
                });

                document.addEventListener("click", () => saveMenu.style.display = "none");
            });

            // =========================
            // REMOVE ALL FILTERS
            // =========================
            removeAllFiltersBtn?.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelectorAll('#tags .tag-btn.selected').forEach(btn => btn.classList.remove("selected"));
                document.querySelectorAll('.foundry-option .option_selected.selected').forEach(sel => sel.classList.remove("selected"));
                document.querySelectorAll('.grid_view article').forEach(article => article.style.display = 'block');
            });

        })
        .catch(err => console.error("Error loading JSON:", err));
});