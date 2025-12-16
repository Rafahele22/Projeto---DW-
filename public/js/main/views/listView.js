import { ensureFontFace } from "../utils.js";

let isCapsLockOn = false;
let capsLockListenersAttached = false;

function ensureCapsLockTracking() {
  if (capsLockListenersAttached) return;
  capsLockListenersAttached = true;

  document.addEventListener("keydown", (e) => (isCapsLockOn = e.getModifierState("CapsLock")));
  document.addEventListener("keyup", (e) => (isCapsLockOn = e.getModifierState("CapsLock")));
}

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

    setupListItemEvents({ listItem: listDiv, getGlobalSampleText, setGlobalSampleText });
  });
}

function setupListItemEvents({ listItem, getGlobalSampleText, setGlobalSampleText }) {
  // FAVOURITE
  const favBtn = listItem.querySelector(".fav-btn img");
  favBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = favBtn.src.includes("../assets/imgs/fav_selected.svg");
    favBtn.src = selected ? "../assets/imgs/fav.svg" : "../assets/imgs/fav_selected.svg";
  });

  // SAVE MENU
  const saveMenu = listItem.querySelector(".save_list");
  const saveBtn = listItem.querySelector(".save-btn");
  if (saveMenu) saveMenu.style.display = "none";

  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    document.querySelectorAll(".save, .save_list").forEach((menu) => {
      if (menu !== saveMenu) {
        menu.style.display = "none";
        menu.parentElement.querySelector(".save-btn")?.classList.remove("selected");
      }
    });

    if (!saveMenu) return;
    const isOpening = saveMenu.style.display === "none";
    saveMenu.style.display = isOpening ? "block" : "none";
    saveBtn?.classList.toggle("selected", isOpening);
  });

  // SAVE OPTIONS
  const saveOptions = listItem.querySelectorAll(".save_list a");
  saveOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      option.classList.toggle("selected-option");
    });
  });

  // GLOBAL SAMPLE TEXT
  const editable = listItem.querySelector("h1.sampleText");

  function renderGlobalTextEverywhere() {
    document.querySelectorAll("h1.sampleText").forEach((h1) => {
      if (h1 === document.activeElement) return;
      h1.innerText = getGlobalSampleText();
    });
  }

  if (editable) {
    renderGlobalTextEverywhere();

    editable.addEventListener("input", () => {
      const parent = editable.closest(".list");
      const isAllCapsBox = parent?.dataset.allCaps === "1";

      if (!isAllCapsBox) {
        setGlobalSampleText(editable.innerText);
        renderGlobalTextEverywhere();
        return;
      }

      const visualText = editable.innerText;
      const oldText = getGlobalSampleText();

      if (Math.abs(visualText.length - oldText.length) > 1) {
        setGlobalSampleText(isCapsLockOn ? visualText : visualText.toLowerCase());
        renderGlobalTextEverywhere();
        return;
      }

      if (visualText.length > oldText.length) {
        let newChar = "";
        for (let i = 0; i < visualText.length; i++) {
          if (visualText[i] !== oldText[i]?.toUpperCase()) {
            newChar = visualText[i];
            break;
          }
        }

        if (!newChar) newChar = visualText[visualText.length - 1];

        if (!isCapsLockOn) {
          setGlobalSampleText(visualText.toLowerCase());
          renderGlobalTextEverywhere();
          return;
        }

        let reconstructed = "";
        let j = 0;

        for (let i = 0; i < visualText.length; i++) {
          const visualChar = visualText[i];
          const oldChar = oldText[j];

          if (oldChar && visualChar === oldChar.toUpperCase()) {
            reconstructed += oldChar;
            j++;
          } else {
            reconstructed += visualChar.toUpperCase();
          }
        }

        setGlobalSampleText(reconstructed);
        renderGlobalTextEverywhere();
        return;
      }

      // deletion
      if (!isCapsLockOn) {
        setGlobalSampleText(visualText.toLowerCase());
      } else {
        setGlobalSampleText(visualText);
      }
      renderGlobalTextEverywhere();
    });
  }
}
