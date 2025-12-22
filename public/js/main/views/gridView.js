import {
  ensureFontFace,
  setupFavButton,
  setupSaveMenuToggle,
  populateGridSaveMenu,
  closeSaveMenusExcept,
} from "../shared/fontUtils.js";
import { hide } from "../shared/displayUtils.js";
import { createLazyGridLoader } from "../shared/lazyLoader.js";

function createGridArticle(font, onOpenFont) {
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

  const saveMenu = article.querySelector(".save");
  const saveBtn = article.querySelector(".save-btn");

  setupFavButton(article.querySelector(".fav-btn img"), font._id);
  
  let menuPopulated = false;
  hide(saveMenu);

  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!menuPopulated) {
      populateGridSaveMenu(saveMenu, font._id);
      menuPopulated = true;
    }
    
    closeSaveMenusExcept(saveMenu);
    const isOpening = saveMenu?.style.display === "none";
    if (saveMenu) saveMenu.style.display = isOpening ? "block" : "none";
    saveBtn.classList.toggle("selected", isOpening);
  });

  article.addEventListener("mouseleave", () => {
    hide(saveMenu);
    saveBtn?.classList.remove("selected");
  });

  return article;
}

export function generateGridArticles({ gridEl, fonts, onOpenFont }) {
  if (!gridEl) return { 
    cleanup: () => {},
    rerender: () => {}
  };

  gridEl.innerHTML = "";

  const loader = createLazyGridLoader({
    gridEl,
    fonts,
    onOpenFont,
    renderArticle: createGridArticle
  });

  const handleGlobalClick = (e) => {
    document.querySelectorAll(".save").forEach((menu) => {
      const btn = menu.parentElement?.querySelector(".save-btn");
      if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
        hide(menu);
        btn?.classList.remove("selected");
      }
    });
  };

  document.addEventListener("click", handleGlobalClick);

  return {
    cleanup: () => {
      loader.cleanup();
      document.removeEventListener("click", handleGlobalClick);
    },
    loadAll: loader.loadAll,
    rerender: (newFonts) => {
      loader.cleanup();
      gridEl.innerHTML = "";
      
      const newLoader = createLazyGridLoader({
        gridEl,
        fonts: newFonts,
        onOpenFont,
        renderArticle: createGridArticle
      });
      
      return newLoader;
    }
  };
}
