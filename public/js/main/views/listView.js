import {
  ensureFontFace,
  setupFavButton,
  closeSaveMenusExcept,
  ensureCapsLockTracking,
  getIsCapsLockOn,
  populateGridSaveMenu,
} from "../shared/fontUtils.js";
import { hide } from "../shared/displayUtils.js";
import { createLazyListLoader } from "../shared/lazyLoader.js";

function createListItem(font, onOpenFont, getGlobalSampleText, setGlobalSampleText) {
  ensureFontFace(font);

  const numStyles = font.weights.length;
  const hasAllCaps = font.tags && font.tags.includes("All Caps");
  const sampleText = getGlobalSampleText() || "The quick brown fox jumps over the lazy dog.";
  const displayText = hasAllCaps ? sampleText.toUpperCase() : sampleText;

  const listDiv = document.createElement("div");
  listDiv.className = "list";
  listDiv.dataset.allCaps = hasAllCaps ? "1" : "0";

  listDiv.innerHTML = `
    <div class="list_information_bar">
      <section class="list_information">
        <h3>${font.name}</h3>
        ${font.foundry !== "Unknown" ? `<h3>${font.foundry}</h3>` : ""}
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
    <h1 class="sampleText" contenteditable="true" style="font-family:'${font._id}-font'; line-height: 4.5vw; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; outline: none;">${displayText}</h1>
  `;

  listDiv.addEventListener("click", (e) => {
    if (
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest(".save_list") ||
      e.target.closest(".range-container") ||
      e.target.closest('h1[contenteditable="true"]')
    ) {
      return;
    }
    onOpenFont(font);
  });

  setupListItemEvents({ listItem: listDiv, font, getGlobalSampleText, setGlobalSampleText });
  return listDiv;
}

export function generateListItems({ gridEl, fonts, onOpenFont, getGlobalSampleText, setGlobalSampleText }) {
  if (!gridEl) return { 
    cleanup: () => {},
    rerender: () => {}
  };

  ensureCapsLockTracking();
  
  gridEl.innerHTML = "";

  const loader = createLazyListLoader({
    listEl: gridEl,
    fonts,
    onOpenFont,
    renderListItem: (font) => createListItem(font, onOpenFont, getGlobalSampleText, setGlobalSampleText)
  });

  return {
    cleanup: () => loader.cleanup(),
    rerender: (newFonts) => {
      loader.cleanup();
      gridEl.innerHTML = "";
      
      const newLoader = createLazyListLoader({
        listEl: gridEl,
        fonts: newFonts,
        onOpenFont,
        renderListItem: (font) => createListItem(font, onOpenFont, getGlobalSampleText, setGlobalSampleText)
      });
      
      return newLoader;
    }
  };
}

function setupListItemEvents({ listItem, font, getGlobalSampleText, setGlobalSampleText }) {
  setupFavButton(listItem.querySelector(".fav-btn img"), font._id);

  const saveMenu = listItem.querySelector(".save_list");
  const saveBtn = listItem.querySelector(".save-btn");
  hide(saveMenu);
  
  let menuPopulated = false;

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
    saveBtn?.classList.toggle("selected", isOpening);
  });

  const editable = listItem.querySelector("h1.sampleText");
  if (!editable) return;

  editable.addEventListener("input", () => {
    const parent = editable.closest(".list");
    const isAllCapsBox = parent?.dataset.allCaps === "1";
    const visualText = editable.innerText;
    const isCapsLock = getIsCapsLockOn();

    if (!isAllCapsBox) {
      setGlobalSampleText(visualText);
    } else if (!isCapsLock) {
      setGlobalSampleText(visualText.toLowerCase());
    } else {
      setGlobalSampleText(visualText);
    }

    requestAnimationFrame(() => {
      document.querySelectorAll("h1.sampleText").forEach((h1) => {
        if (h1 === document.activeElement) return;
        const parentDiv = h1.closest(".list");
        const isAllCaps = parentDiv?.dataset.allCaps === "1";
        const text = getGlobalSampleText();
        h1.innerText = isAllCaps ? text.toUpperCase() : text;
      });
    });
  });
}
