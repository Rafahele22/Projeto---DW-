export function checkFontAgainstFilters(
  font,
  selectedTags,
  selectedFoundries,
  selectedFamilySizes,
  selectedVariables,
  searchQuery = ""
) {
  const q = String(searchQuery ?? "").trim().toLowerCase();
  if (q) {
    const name = String(font?.name ?? "").toLowerCase();
    const foundry = String(font?.foundry ?? "").toLowerCase();
    if (!name.includes(q) && !foundry.includes(q)) {
      return false;
    }
  }

  if (selectedTags.length > 0 && font?.tags) {
    if (!selectedTags.some((tag) => font.tags.includes(tag))) {
      return false;
    }
  }

  if (selectedFoundries.length > 0) {
    if (!selectedFoundries.includes(font?.foundry)) {
      return false;
    }
  }

  if (selectedFamilySizes.length > 0 && Array.isArray(font?.weights)) {
    const n = font.weights.length;
    let size = "";

    if (n === 1) size = "single";
    else if (n <= 6) size = "small";
    else if (n <= 10) size = "medium";
    else if (n <= 20) size = "large";
    else size = "xlarge";

    if (!selectedFamilySizes.includes(size)) {
      return false;
    }
  }

  if (selectedVariables.length > 0) {
    const type = font?.variable ? "Variable" : "Static";
    if (!selectedVariables.includes(type)) {
      return false;
    }
  }

  return true;
}

function filterElements(selector, fonts, filterParams) {
  const elements = document.querySelectorAll(selector);
  let visibleCount = 0;

  elements.forEach((el, index) => {
    const font = fonts[index];
    if (!font) {
      el.style.display = "none";
      return;
    }

    const show = checkFontAgainstFilters(
      font,
      filterParams.selectedTags,
      filterParams.selectedFoundries,
      filterParams.selectedFamilySizes,
      filterParams.selectedVariables,
      filterParams.searchQuery
    );

    el.style.display = show ? "block" : "none";
    if (show) visibleCount++;
  });

  return visibleCount;
}

export function filterArticles(params) {
  return filterElements("article", params.fonts, params);
}

export function filterListItems(params) {
  return filterElements(".list", params.fonts, params);
}

export function filterFonts({ gridEl, fonts, isGridView, filterParams }) {
  if (!gridEl) return 0;
  
  let visibleCount = 0;

  const elements = isGridView 
    ? gridEl.querySelectorAll(":scope > article")
    : gridEl.querySelectorAll(":scope > .list");

  elements.forEach((el, index) => {
    const font = fonts[index];
    if (!font) {
      el.style.display = "none";
      return;
    }
    const show = checkFontAgainstFilters(
      font,
      filterParams.selectedTags || [],
      filterParams.selectedFoundries || [],
      filterParams.selectedFamilySizes || [],
      filterParams.selectedVariables || [],
      filterParams.searchQuery || ""
    );
    el.style.display = show ? "block" : "none";
    if (show) visibleCount++;
  });

  const noResults = document.getElementById("no_results");
  if (noResults) {
    noResults.style.display = visibleCount === 0 ? "block" : "none";
  }

  return visibleCount;
}
