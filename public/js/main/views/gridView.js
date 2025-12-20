import {
  ensureFontFace,
  setupFavButton,
  setupSaveMenuToggle,
  setupSaveOptions,
  closeSaveMenusExcept,
} from "../shared/fontUtils.js";
import { hide } from "../shared/displayUtils.js";

export function generateGridArticles({ gridEl, fonts, onOpenFont }) {
  if (!gridEl) return [];

  const articles = [];

  fonts.forEach((font) => {
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

    article.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".save")) {
        return;
      }
      onOpenFont(font);
    });

    gridEl.appendChild(article);
    articles.push(article);

    const saveMenu = article.querySelector(".save");
    const saveBtn = article.querySelector(".save-btn");

    setupFavButton(article.querySelector(".fav-btn img"), font._id);
    setupSaveOptions(article);

    hide(saveMenu);

    saveBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSaveMenusExcept(saveMenu);
      const isOpening = saveMenu?.style.display === "none";
      if (saveMenu) saveMenu.style.display = isOpening ? "block" : "none";
      saveBtn.classList.toggle("selected", isOpening);
    });

    article.addEventListener("mouseleave", () => {
      hide(saveMenu);
      saveBtn?.classList.remove("selected");
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".save").forEach((menu) => {
      const btn = menu.parentElement?.querySelector(".save-btn");
      if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
        hide(menu);
        btn?.classList.remove("selected");
      }
    });
  });

  return articles;
}
