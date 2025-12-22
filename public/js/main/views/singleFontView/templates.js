/**
 * HTML Templates para Single Font View
 * Funções que retornam strings HTML para manter o código organizado
 */

import { escapeHtml } from "../../shared/fontUtils.js";

// =========================
// TAGS
// =========================
export function renderFontTags(font) {
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

// =========================
// CONTROLS BAR
// =========================
export function renderControlsBar(options = {}) {
  const { isPair = false } = options;
  const prefix = isPair ? "pair" : "";
  const idPrefix = isPair ? "pair" : "";

  return `
    <div class="sliders">
      <div>
        <div class="divLabel">
          <label class="rangeLabel" for="${idPrefix}FontSize">
            <span>font size</span>
            <span class="range-value" id="${idPrefix}FontSizeValue">48pt</span>
          </label>
        </div>
        <div class="range-container">
          <input type="range" id="${idPrefix}FontSize" min="12" max="150" value="48" />
        </div>
      </div>

      <div>
        <div class="divLabel">
          <label class="rangeLabel" for="${idPrefix}LetterSpacing">
            <span>tracking</span>
            <span class="range-value" id="${idPrefix}LetterSpacingValue">0pt</span>
          </label>
        </div>
        <div class="range-container">
          <input type="range" id="${idPrefix}LetterSpacing" min="-5" max="50" value="0" step="0.5" />
        </div>
      </div>

      <div>
        <div class="divLabel">
          <label class="rangeLabel" for="${idPrefix}LineHeight">
            <span>leading</span>
            <span class="range-value" id="${idPrefix}LineHeightValue">100%</span>
          </label>
        </div>
        <div class="range-container">
          <input type="range" id="${idPrefix}LineHeight" min="80" max="300" value="100" step="1" />
        </div>
      </div>
    </div>

    <div class="choose-style-wrapper">
      <a href="#" class="button choose_style_btn">
        <h4>Choose style</h4>
        <img src="../assets/imgs/arrow.svg" alt="icon arrow down" />
      </a>
      <div id="${isPair ? 'pair_styles_menu' : 'styles_menu'}" class="styles_menu" style="display:none">
        <div class="styles_menu_scroll"></div>
      </div>
    </div>
  `;
}

// =========================
// LIST INDIVIDUAL (Main font display)
// =========================
export function renderListIndividual(font, displayText, tagsHTML) {
  const numStyles = font.weights?.length || 0;
  const hasAllCaps = font.tags?.includes("All Caps");
  const designers = Array.isArray(font?.design) ? font.design : [];
  const designersText = designers.length ? designers.map(escapeHtml).join(", ") : "";

  return `
    <div class="list_information_bar">
      <section class="list_information">
        <h3>${escapeHtml(font.name)}</h3>
        ${font.foundry !== "Unknown" ? `<h3>${escapeHtml(font.foundry)}</h3>` : ""}
        ${designersText ? `<h3>${designersText}</h3>` : ""}
        <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
        ${font.variable ? "<h3>Variable</h3>" : ""}
      </section>

      <section class="list_information">
        <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
        <a href="#" class="button save-btn"><h4>Save</h4></a>
      </section>

      <section class="save_list">
      </section>
    </div>

    <h1 class="sampleText" contenteditable="true"
      style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
      ${displayText}
    </h1>

    ${tagsHTML}
  `;
}

// =========================
// PAIR BOX (Second font display)
// =========================
export function renderPairBox(font, displayText, tagsHTML) {
  const numStyles = font.weights?.length || 0;
  const designers = Array.isArray(font?.design) ? font.design : [];
  const designersText = designers.length ? designers.map(escapeHtml).join(", ") : "";

  return `
    <div class="list_information_bar">
      <section class="list_information">
        <h3>${escapeHtml(font.name)}</h3>
        ${font.foundry !== "Unknown" ? `<h3>${escapeHtml(font.foundry)}</h3>` : ""}
        ${designersText ? `<h3>${designersText}</h3>` : ""}
        <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
        ${font.variable ? "<h3>Variable</h3>" : ""}
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
      style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">
      ${displayText}
    </h1>

    ${tagsHTML}
  `;
}

// =========================
// PAIR WRAPPER
// =========================
export function renderPairWrapper() {
  return `
    <a href="#" class="button" id="add_pair_btn">
      <h4>Add Pair</h4>
      <img src="../assets/imgs/add.svg" alt="icon albuns"/>
    </a>

    <section class="save" id="pair_menu" style="display:none;">
      <h4>Choose a collection to pair</h4>
      <div id="pair_collections_list"></div>
    </section>
  `;
}

// =========================
// SIMILAR FONT CARD
// =========================
export function renderSimilarCard(font) {
  const numStyles = font.weights?.length || 0;
  const sampleLetter = font.tags?.includes("All Caps") ? "AA" : "Aa";

  return `
    <section class="grid_information">
      <a href="#" class="button save-btn"><h4>Save</h4></a>
      <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
    </section>

    <section class="save">
    </section>

    <h1 class="title_gridview" style="font-family:'${font._id}-font'">${sampleLetter}</h1>

    <section class="grid_information">
      <h2>${escapeHtml(font.name)}</h2>
      <h3>${numStyles} styles</h3>
    </section>
  `;
}

// =========================
// PAIR SUGGESTION CARD
// =========================
export function renderPairSuggestionCard(heading, body, bodyText) {
  const isAllCaps = Array.isArray(heading?.tags) && heading.tags.includes("All Caps");
  const headingText = isAllCaps ? "Sample Heading".toUpperCase() : "Sample Heading";
  const numStyles = Array.isArray(body.weights) ? body.weights.length : 0;

  return `
    <section class="grid_information_pairs">
      <a href="#" class="fav-btn"><img src="../assets/imgs/fav.svg" alt="favourite"/></a>
    </section>

    <h1 class="pairs_title" style="font-family:'${heading._id}-font'">${headingText}</h1>

    <p style="font-family:'${body._id}-font'">${bodyText}</p>

    <section class="grid_information">
      <h2>${escapeHtml(body.name)}</h2>
      <h3>${numStyles} ${numStyles === 1 ? "style" : "styles"}</h3>
    </section>
  `;
}
