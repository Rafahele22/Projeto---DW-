import {
  ensureFontFace,
  setupFavButton,
  closeSaveMenusExcept,
  ensureCapsLockTracking,
  getIsCapsLockOn,
} from "../shared/fontUtils.js";
import { hide } from "../shared/displayUtils.js";

export function generateListItems({ gridEl, fonts, onOpenFont, getGlobalSampleText, setGlobalSampleText }) {
  if (!gridEl) return;

  ensureCapsLockTracking();

  fonts.forEach((font) => {
    ensureFontFace(font);

    const numStyles = font.weights.length;
    const hasAllCaps = font.tags && font.tags.includes("All Caps");
    const sampleText = "The quick brown fox jumps over the lazy dog.";
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
          <h4>Save font on...</h4>
          <a href="#"><div><h4>Aa</h4><h4>Web</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
          <a href="#"><div><h4>Aa</h4><h4>Print</h4></div><h5 class="add-text">add</h5><img src="../assets/imgs/check.svg" class="check-icon" alt="check icon"></a>
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

    gridEl.appendChild(listDiv);
    setupListItemEvents({ listItem: listDiv, font, getGlobalSampleText, setGlobalSampleText });
  });
}

function setupListItemEvents({ listItem, font, getGlobalSampleText, setGlobalSampleText }) {
  setupFavButton(listItem.querySelector(".fav-btn img"), font._id);

  const saveMenu = listItem.querySelector(".save_list");
  const saveBtn = listItem.querySelector(".save-btn");
  hide(saveMenu);

  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeSaveMenusExcept(saveMenu);
    const isOpening = saveMenu?.style.display === "none";
    if (saveMenu) saveMenu.style.display = isOpening ? "block" : "none";
    saveBtn?.classList.toggle("selected", isOpening);
  });

  listItem.querySelectorAll(".save_list a").forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      option.classList.toggle("selected-option");
    });
  });

  const editable = listItem.querySelector("h1.sampleText");
  if (!editable) return;

  const renderGlobalTextEverywhere = () => {
    document.querySelectorAll("h1.sampleText").forEach((h1) => {
      if (h1 === document.activeElement) return;
      h1.innerText = getGlobalSampleText();
    });
  };

  renderGlobalTextEverywhere();

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

    renderGlobalTextEverywhere();
  });
}
