export function initFiltersUI({ gridEl, filtersBtn, filtersPanel, closeFiltersBtn, removeAllFiltersBtn }) {
  if (filtersPanel) filtersPanel.style.display = "none";

  const filtersCountBubble = filtersBtn?.querySelector("h6") ?? null;
  if (filtersCountBubble) filtersCountBubble.style.display = "none";

  let foundrySection = null;
  let familySizeSection = null;
  let variableSection = null;

  function findFilterSections() {
    const filterSections = document.querySelectorAll("#filters .filters_section");

    for (const section of filterSections) {
      const title = section.querySelector("h2");
      if (!title) continue;

      if (title.textContent === "Foundry") foundrySection = section;
      if (title.textContent === "Family Size") familySizeSection = section;
      if (title.textContent === "Variable") variableSection = section;
    }
  }

  function getFilterCount() {
    let count = 0;

    for (const _ of document.querySelectorAll("#tags .selected")) count++;
    if (foundrySection?.querySelector(".option_selected.selected")) count++;
    if (familySizeSection?.querySelector(".option_selected.selected")) count++;
    if (variableSection?.querySelector(".option_selected.selected")) count++;

    return count;
  }

  function updateCounter() {
    const count = getFilterCount();
    const isFiltersOpen = filtersPanel?.style?.display === "flex";

    if (count > 0 && !isFiltersOpen) {
      if (filtersCountBubble) {
        filtersCountBubble.style.display = "flex";
        filtersCountBubble.textContent = String(count);
      }
    } else if (filtersCountBubble) {
      filtersCountBubble.style.display = "none";
    }
  }

  function setupPanelOpenClose({ onClose, onOpen }) {
    filtersBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isCurrentlyOpen = filtersPanel?.style?.display === "flex";
      const newStateOpen = !isCurrentlyOpen;

      if (filtersPanel) filtersPanel.style.display = newStateOpen ? "flex" : "none";
      gridEl?.classList.toggle("shifted", newStateOpen);
      filtersBtn.classList.toggle("selected", newStateOpen);

      if (newStateOpen) {
        if (filtersCountBubble) filtersCountBubble.style.display = "none";
        onOpen?.();
      } else {
        updateCounter();
        onClose?.();
      }
    });

    closeFiltersBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (filtersPanel) filtersPanel.style.display = "none";
      gridEl?.classList.remove("shifted");
      filtersBtn?.classList.remove("selected");
      updateCounter();
      onClose?.();
    });

    document.addEventListener("click", (e) => {
      if (!filtersPanel || !filtersBtn) return;
      if (filtersPanel.contains(e.target) || filtersBtn.contains(e.target)) return;

      filtersPanel.style.display = "none";
      gridEl?.classList.remove("shifted");
      filtersBtn.classList.remove("selected");
      updateCounter();
      onClose?.();
    });
  }

  function clearAllSelections() {
    for (const btn of document.querySelectorAll("#tags .selected")) {
      btn.classList.remove("selected");
    }

    if (foundrySection) {
      for (const s of foundrySection.querySelectorAll(".option_selected")) s.classList.remove("selected");
    }

    if (familySizeSection) {
      for (const s of familySizeSection.querySelectorAll(".option_selected")) s.classList.remove("selected");
    }

    if (variableSection) {
      for (const s of variableSection.querySelectorAll(".option_selected")) s.classList.remove("selected");
    }
  }

  function wireRemoveAll({ onRemoveAll }) {
    removeAllFiltersBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      clearAllSelections();
      onRemoveAll?.();
      updateCounter();
    });
  }

  function getSelections() {
    const selectedTags = Array.from(document.querySelectorAll("#tags .selected")).map((btn) => btn.dataset.tag);

    const selectedFoundries = foundrySection
      ? Array.from(foundrySection.querySelectorAll(".option_selected.selected")).map(
          (sel) => sel.closest(".foundry-option").dataset.foundry
        )
      : [];

    const selectedFamilySizes = familySizeSection
      ? Array.from(familySizeSection.querySelectorAll(".option_selected.selected")).map(
          (sel) => sel.closest("a.option").dataset.familySize
        )
      : [];

    const selectedVariables = variableSection
      ? Array.from(variableSection.querySelectorAll(".option_selected.selected")).map((sel) =>
          sel.closest("a.option").querySelector("h5").textContent
        )
      : [];

    return { selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables };
  }

  function populateTags({ tagsContainer, allTags, onChange }) {
    if (!tagsContainer) return;

    tagsContainer.innerHTML = "";

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
        onChange?.();
        updateCounter();
      });
    }
  }

  function populateFoundries({ foundries, onChange }) {
    if (!foundrySection) return;

    for (const el of foundrySection.querySelectorAll("a.option")) {
      el.remove();
    }

    for (const foundry of foundries) {
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

        if (!isSelected) optionSelected.classList.add("selected");

        onChange?.();
        updateCounter();
      });
    }
  }

  function wireSingleSelectSections({ onChange }) {
    if (familySizeSection) {
      for (const option of familySizeSection.querySelectorAll("a.option")) {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          const sel = option.querySelector(".option_selected");
          const already = sel.classList.contains("selected");

          for (const s of familySizeSection.querySelectorAll(".option_selected")) {
            s.classList.remove("selected");
          }

          if (!already) sel.classList.add("selected");

          onChange?.();
          updateCounter();
        });
      }
    }

    if (variableSection) {
      for (const option of variableSection.querySelectorAll("a.option")) {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          const sel = option.querySelector(".option_selected");
          const already = sel.classList.contains("selected");

          for (const s of variableSection.querySelectorAll(".option_selected")) {
            s.classList.remove("selected");
          }

          if (!already) sel.classList.add("selected");

          onChange?.();
          updateCounter();
        });
      }
    }
  }

  findFilterSections();

  return {
    updateCounter,
    setupPanelOpenClose,
    wireRemoveAll,
    getSelections,
    populateTags,
    populateFoundries,
    wireSingleSelectSections,
  };
}
