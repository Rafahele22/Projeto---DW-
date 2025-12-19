export function setupViewModeToggle({ gridViewBtn, listViewBtn, mainGrid, filtersPanel, onToggle }) {
  if (!gridViewBtn || !listViewBtn || !mainGrid) return { getIsGridView: () => true };

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

  function toggleViewMode() {
    const filtersOpen = filtersPanel?.style?.display === "flex";
    isGridView = !isGridView;

    syncIcons();

    mainGrid.classList.toggle("grid_view", isGridView);
    mainGrid.classList.toggle("list_view", !isGridView);

    if (filtersOpen) {
      mainGrid.classList.add("shifted");
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
    syncFromDom() {
      isGridView = mainGrid.classList.contains("grid_view") && !mainGrid.classList.contains("list_view");
      syncIcons();
    },
  };
}
