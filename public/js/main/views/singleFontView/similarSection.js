import { ensureFontFace, pickRandom, setFavIconState } from "../../shared/fontUtils.js";
import { isFavorite, toggleFavorite } from "../../state.js";
import { renderSimilarCard, renderPairSuggestionCard } from "./templates.js";
import { populateSaveCollections } from "./collections.js";
import { getFontsById } from "./fontCache.js";

const BODY_TEXT = "This is sample text used to demonstrate how typefaces work together. It allows designers to focus on form, spacing, hierarchy, and contrast. By removing meaning from the content, attention shifts to structure, rhythm, and the relationship between headline and body text.";

// =========================
// BUILD SIMILAR SECTION
// =========================
export async function buildSimilarSection({ currentFont, fontsAll, onOpenFont, onOpenPairSuggestion }) {
  const root = document.createElement("div");
  root.className = "similar-wrapper";

  const allFonts = Array.isArray(fontsAll) ? fontsAll : [];
  const fontsById = getFontsById(allFonts);

  await buildPairSuggestions(root, currentFont, allFonts, fontsById, onOpenFont, onOpenPairSuggestion);

  buildSimilarFonts(root, currentFont, allFonts, onOpenFont);

  return root;
}

// =========================
// PAIR SUGGESTIONS
// =========================
async function buildPairSuggestions(root, currentFont, allFonts, fontsById, onOpenFont, onOpenPairSuggestion) {
  const pairsWrapper = document.createElement("div");
  pairsWrapper.className = "suggestions";
  root.appendChild(pairsWrapper);

  const pairsTitle = document.createElement("h2");
  pairsTitle.textContent = "Pairs Suggestions";
  pairsWrapper.appendChild(pairsTitle);

  const pairsGrid = document.createElement("div");
  pairsGrid.className = "grid grid_view";
  pairsWrapper.appendChild(pairsGrid);

  let pairsToShow = await fetchTopPairs(fontsById, currentFont, allFonts);

  pairsToShow.forEach(({ heading, body }) => {
    ensureFontFace(heading);
    ensureFontFace(body);

    const article = document.createElement("article");
    article.dataset.fontId = body._id;
    article.innerHTML = renderPairSuggestionCard(heading, body, BODY_TEXT);

    setupFavButton(article, body._id);

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
}

// =========================
// FETCH TOP PAIRS
// =========================
async function fetchTopPairs(fontsById, currentFont, allFonts) {
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

  return pairsToShow;
}

// =========================
// SIMILAR FONTS
// =========================
function buildSimilarFonts(root, currentFont, allFonts, onOpenFont) {
  const similarWrapper = document.createElement("div");
  similarWrapper.className = "suggestions";
  root.appendChild(similarWrapper);

  const title = document.createElement("h2");
  title.textContent = "Similar";
  similarWrapper.appendChild(title);

  const similarGrid = document.createElement("div");
  similarGrid.className = "grid grid_view";
  similarWrapper.appendChild(similarGrid);

  const chosen = getSimilarFonts(currentFont, allFonts);

  chosen.forEach((font) => {
    ensureFontFace(font);

    const article = document.createElement("article");
    article.dataset.fontId = font._id;
    article.innerHTML = renderSimilarCard(font);

    const gridSaveMenu = article.querySelector(".save");
    populateSaveCollections(gridSaveMenu, font._id);

    setupFavButton(article, font._id);
    setupSaveMenuToggle(article);

    article.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".save")) return;
      onOpenFont(font);
    });

    similarGrid.appendChild(article);
  });
}

// =========================
// GET SIMILAR FONTS
// =========================
function getSimilarFonts(currentFont, allFonts) {
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

  return chosen;
}

// =========================
// HELPER: Setup Fav Button
// =========================
function setupFavButton(article, fontId) {
  const favImg = article.querySelector(".fav-btn img");
  if (favImg) {
    setFavIconState(favImg, isFavorite(fontId));
    favImg.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newState = await toggleFavorite(fontId);
      setFavIconState(favImg, newState);
    });
  }
}

// =========================
// HELPER: Setup Save Menu Toggle
// =========================
function setupSaveMenuToggle(article) {
  const gridSaveMenuBtn = article.querySelector(".save");
  const gridSaveBtn = article.querySelector(".save-btn");
  
  if (gridSaveMenuBtn) gridSaveMenuBtn.style.display = "none";

  gridSaveBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.querySelectorAll(".save, .save_list").forEach((menu) => {
      if (menu !== gridSaveMenuBtn) {
        menu.style.display = "none";
        menu.parentElement.querySelector(".save-btn")?.classList.remove("selected");
      }
    });

    const isOpening = gridSaveMenuBtn && gridSaveMenuBtn.style.display === "none";
    if (gridSaveMenuBtn) gridSaveMenuBtn.style.display = isOpening ? "block" : "none";
    gridSaveBtn?.classList.toggle("selected", isOpening);
  });
}
