const BATCH_SIZE = 20;
const LOAD_THRESHOLD = 300;

let gridObserver = null;
let listObserver = null;

export function createLazyGridLoader({ gridEl, fonts, onOpenFont, renderArticle }) {
  if (!gridEl || !fonts.length) return { cleanup: () => {} };

  let loadedCount = 0;
  const totalFonts = fonts.length;

  const sentinel = document.createElement("div");
  sentinel.className = "lazy-sentinel";
  sentinel.style.height = "1px";

  function loadNextBatch() {
    if (loadedCount >= totalFonts) {
      if (sentinel.parentNode) sentinel.remove();
      return;
    }

    const endIndex = Math.min(loadedCount + BATCH_SIZE, totalFonts);
    const fragment = document.createDocumentFragment();

    for (let i = loadedCount; i < endIndex; i++) {
      const article = renderArticle(fonts[i], onOpenFont);
      fragment.appendChild(article);
    }

    if (sentinel.parentNode) {
      gridEl.insertBefore(fragment, sentinel);
    } else {
      gridEl.appendChild(fragment);
    }
    loadedCount = endIndex;

    if (loadedCount >= totalFonts && sentinel.parentNode) {
      sentinel.remove();
    }
  }

  gridEl.appendChild(sentinel);
  loadNextBatch();

  if (gridObserver) gridObserver.disconnect();

  gridObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadNextBatch();
    }
  }, { rootMargin: `${LOAD_THRESHOLD}px` });

  gridObserver.observe(sentinel);

  return {
    cleanup: () => {
      gridObserver?.disconnect();
      gridObserver = null;
    },
    getLoadedCount: () => loadedCount,
    loadAll: () => {
      while (loadedCount < totalFonts) {
        loadNextBatch();
      }
    }
  };
}

export function createLazyListLoader({ listEl, fonts, onOpenFont, renderListItem }) {
  if (!listEl || !fonts.length) return { cleanup: () => {} };

  let loadedCount = 0;
  const totalFonts = fonts.length;

  const sentinel = document.createElement("div");
  sentinel.className = "lazy-sentinel";
  sentinel.style.height = "1px";

  function loadNextBatch() {
    if (loadedCount >= totalFonts) {
      if (sentinel.parentNode) sentinel.remove();
      return;
    }

    const endIndex = Math.min(loadedCount + BATCH_SIZE, totalFonts);
    const fragment = document.createDocumentFragment();

    for (let i = loadedCount; i < endIndex; i++) {
      const listItem = renderListItem(fonts[i], onOpenFont);
      fragment.appendChild(listItem);
    }

    if (sentinel.parentNode) {
      listEl.insertBefore(fragment, sentinel);
    } else {
      listEl.appendChild(fragment);
    }
    loadedCount = endIndex;

    if (loadedCount >= totalFonts && sentinel.parentNode) {
      sentinel.remove();
    }
  }

  listEl.appendChild(sentinel);
  loadNextBatch();

  if (listObserver) listObserver.disconnect();

  listObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadNextBatch();
    }
  }, { rootMargin: `${LOAD_THRESHOLD}px` });

  listObserver.observe(sentinel);

  return {
    cleanup: () => {
      listObserver?.disconnect();
      listObserver = null;
    },
    getLoadedCount: () => loadedCount
  };
}

export function cleanupLazyLoaders() {
  gridObserver?.disconnect();
  listObserver?.disconnect();
  gridObserver = null;
  listObserver = null;
}
