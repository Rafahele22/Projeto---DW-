export function checkFontAgainstFilters(
  font,
  selectedTags,
  selectedFoundries,
  selectedFamilySizes,
  selectedVariables,
  searchQuery = ""
) {
  let show = true;

  // SEARCH
  const q = String(searchQuery ?? "").trim().toLowerCase();
  if (q) {
    const name = String(font?.name ?? "").toLowerCase();
    const foundry = String(font?.foundry ?? "").toLowerCase();
    if (!name.includes(q) && !foundry.includes(q)) {
      show = false;
    }
  }

  if (selectedTags.length > 0 && font?.tags) {
    if (!selectedTags.some((tag) => font.tags.includes(tag))) {
      show = false;
    }
  }

  if (selectedFoundries.length > 0) {
    if (!selectedFoundries.includes(font?.foundry)) {
      show = false;
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
      show = false;
    }
  }

  if (selectedVariables.length > 0) {
    const type = font?.variable ? "Variable" : "Static";
    if (!selectedVariables.includes(type)) {
      show = false;
    }
  }

  return show;
}

export function filterArticles({ selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables, searchQuery, fonts }) {
  const articles = document.querySelectorAll("article");
  let visibleCount = 0;

  articles.forEach((article, index) => {
    const font = fonts[index];
    if (!font) {
      article.style.display = "none";
      return;
    }

    const show = checkFontAgainstFilters(
      font,
      selectedTags,
      selectedFoundries,
      selectedFamilySizes,
      selectedVariables,
      searchQuery
    );

    article.style.display = show ? "block" : "none";
    if (show) visibleCount++;
  });

  return visibleCount;
}

export function filterListItems({ selectedTags, selectedFoundries, selectedFamilySizes, selectedVariables, searchQuery, fonts }) {
  const listItems = document.querySelectorAll(".list");
  let visibleCount = 0;

  listItems.forEach((listItem, index) => {
    const font = fonts[index];
    if (!font) {
      listItem.style.display = "none";
      return;
    }

    const show = checkFontAgainstFilters(
      font,
      selectedTags,
      selectedFoundries,
      selectedFamilySizes,
      selectedVariables,
      searchQuery
    );

    listItem.style.display = show ? "block" : "none";
    if (show) visibleCount++;
  });

  return visibleCount;
}
