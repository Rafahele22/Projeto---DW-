export function setupViewModeToggle({ gridViewBtn, listViewBtn, mainGrid, filtersPanel, onToggle }) {
  if (!gridViewBtn || !listViewBtn || !mainGrid) return { getIsGridView: () => true };

  let isGridView = true;

  function toggleViewMode() {
    const filtersOpen = filtersPanel?.style?.display === "flex";

    if (isGridView) {
      gridViewBtn.id = "";
      listViewBtn.id = "view_mode_selected";

      const gridImg = gridViewBtn.querySelector("img");
      const listImg = listViewBtn.querySelector("img");
      if (gridImg && listImg) {
        gridImg.src = "../assets/imgs/grid.svg";
        listImg.src = "../assets/imgs/list_selected.svg";
      }

      mainGrid.classList.remove("grid_view");
      mainGrid.classList.add("list_view");
      isGridView = false;

      if (filtersOpen) {
        mainGrid.classList.add("shifted");
      }
    } else {
      listViewBtn.id = "";
      gridViewBtn.id = "view_mode_selected";

      const gridImg = gridViewBtn.querySelector("img");
      const listImg = listViewBtn.querySelector("img");
      if (gridImg && listImg) {
        gridImg.src = "../assets/imgs/grid_selected.svg";
        listImg.src = "../assets/imgs/list.svg";
      }

      mainGrid.classList.remove("list_view");
      mainGrid.classList.add("grid_view");
      isGridView = true;

      if (filtersOpen) {
        mainGrid.classList.add("shifted");
      }
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
};
}
