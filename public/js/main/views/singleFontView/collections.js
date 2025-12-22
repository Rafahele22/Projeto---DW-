import { escapeHtml, ensureFontFace, toggleFontInCollection } from "../../shared/fontUtils.js";

// =========================
// POPULATE PAIR COLLECTIONS
// =========================
export async function populatePairCollections(pairDiv, currentFont, allFonts) {
  const pairCollectionsList = pairDiv.querySelector("#pair_collections_list");
  if (!pairCollectionsList) return;

  pairCollectionsList.innerHTML = "";

  let userCollections = [];
  try {
    const { getUserCollections } = await import("../../collections.js");
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

    collectionCategory.innerHTML = `
      <div><h4>Aa</h4><h4>${escapeHtml(collection.name)}</h4></div>
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

// =========================
// POPULATE SAVE COLLECTIONS
// =========================
export async function populateSaveCollections(saveMenu, fontId) {
  if (!saveMenu) return;

  let userCollections = [];
  try {
    const { getUserCollections } = await import("../../collections.js");
    userCollections = getUserCollections() || [];
  } catch (e) {
    console.error("Failed to get user collections:", e);
    saveMenu.innerHTML = '<h4>Save font on...</h4><p style="color: var(--darker-grey); padding: 1rem;">Please login to see your collections.</p>';
    return;
  }

  const fontsCollections = userCollections.filter(c => c.type === "fonts" && c.name !== "Favourites");

  if (fontsCollections.length === 0) {
    saveMenu.innerHTML = '<h4>Save font on...</h4><p style="color: var(--darker-grey); padding: 1rem;">No collections available. Create one first!</p>';
    return;
  }

  saveMenu.innerHTML = '<h4>Save font on...</h4>';

  fontsCollections.forEach(collection => {
    const items = Array.isArray(collection.items) ? collection.items : [];
    const fontIds = items.map(item => String(item.fontId)).filter(Boolean);
    const isInCollection = fontIds.includes(String(fontId));

    const option = document.createElement("a");
    option.href = "#";
    option.className = "save-option";
    if (isInCollection) option.classList.add("selected-option");
    option.dataset.collectionName = collection.name;

    option.innerHTML = `
      <div><h4>Aa</h4><h4>${escapeHtml(collection.name)}</h4></div>
      <h5 class="add-text">add</h5>
      <img src="../assets/imgs/check.svg" class="check-icon" alt="check icon">
    `;

    option.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const result = await toggleFontInCollection(fontId, collection.name);
      option.classList.toggle("selected-option", result?.added);
    });

    saveMenu.appendChild(option);
  });
}
