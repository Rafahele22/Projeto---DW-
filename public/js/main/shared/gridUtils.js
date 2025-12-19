export function equalizeGridCardHeights(gridEl, isGridView) {
  if (!isGridView) return;

  const cards = Array.from(gridEl.querySelectorAll("article"));
  if (!cards.length) return;

  if (!cards.some((c) => c.offsetHeight > 0)) return;

  cards.forEach((c) => (c.style.height = "auto"));

  requestAnimationFrame(() => {
    let max = 0;
    for (const c of cards) {
      const h = c.offsetHeight;
      if (h > max) max = h;
    }
    if (max > 0) cards.forEach((c) => (c.style.height = max + "px"));
  });
}
