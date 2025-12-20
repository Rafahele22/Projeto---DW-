import { setActualMode, getActualMode } from "./state.js";

export function setupViewModeToggle({ gridViewBtn, listViewBtn, gridUniverse, listUniverse, filtersPanel, onToggle }) {
  if (!gridViewBtn || !listViewBtn || !gridUniverse || !listUniverse) {
    return { getIsGridView: () => true, syncFromActualMode: () => {} };
  }

  let isGridView = true;

  function syncIcons() {
    if (isGridView) {
      gridViewBtn.id = "view_mode_selected";
      listViewBtn.id = "";
      const gridImg = gridViewBtn.querySelector("img");
      const listImg = listViewBtn.querySelector("img");
      if (gridImg) gridImg.src = "../assets/imgs/grid_selected.svg";
      if (listImg) listImg.src = "../assets/imgs/list.svg";
    } else {
      gridViewBtn.id = "";
      listViewBtn.id = "view_mode_selected";
      const gridImg = gridViewBtn.querySelector("img");
      const listImg = listViewBtn.querySelector("img");
      if (gridImg) gridImg.src = "../assets/imgs/grid.svg";
      if (listImg) listImg.src = "../assets/imgs/list_selected.svg";
    }
  }

  function applyViewMode() {
    if (isGridView) {
      gridUniverse.style.display = "";
      listUniverse.style.display = "none";
    } else {
      gridUniverse.style.display = "none";
      listUniverse.style.display = "";
    }
    syncIcons();
  }

  function toggleViewMode() {
    const filtersOpen = filtersPanel?.style?.display === "flex";
    isGridView = !isGridView;

    setActualMode(isGridView ? "grid" : "list");
    applyViewMode();

    if (filtersOpen) {
      gridUniverse.classList.add("shifted");
      listUniverse.classList.add("shifted");
    }

    onToggle?.(isGridView);
  }

  gridViewBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isGridView) toggleViewMode();
  });

  listViewBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isGridView) toggleViewMode();
  });

  applyViewMode();

  return {
    getIsGridView() {
      return isGridView;
    },
    setGridView() {
      if (!isGridView) toggleViewMode();
    },
    setListView() {
      if (isGridView) toggleViewMode();
    },
    syncFromActualMode() {
      const mode = getActualMode();
      isGridView = mode === "grid";
      applyViewMode();
    },
  };
}
