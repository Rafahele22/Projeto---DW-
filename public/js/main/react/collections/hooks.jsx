const API_BASE = "http://web-dev-grupo05.dei.uc.pt/api";

function AlbumPreview({ fonts }) {
  const safeFonts = React.useMemo(
    () => (Array.isArray(fonts) ? fonts.filter(Boolean) : []),
    [fonts]
  );

  const fontIdsKey = React.useMemo(
    () => safeFonts.map((f) => String(f?._id)).join("|"),
    [safeFonts]
  );

  React.useEffect(() => {
    safeFonts.forEach((f) => {
      try {
        ensureFontFaceInline?.(f);
      } catch (e) {}
    });
  }, [fontIdsKey]);

  const getFont = (index) => safeFonts[index] || null;

  const renderCell = (fontObj, fallbackFontObj = null) => {
    const fontToUse = fontObj || fallbackFontObj || null;
    const hasFont = !!fontToUse;

    const hasAllCaps =
      Array.isArray(fontToUse?.tags) && fontToUse.tags.includes("All Caps");
    const sampleLetter = hasAllCaps ? "AA" : "Aa";

    const style = hasFont
      ? { fontFamily: `'${fontToUse._id}-font'` }
      : { color: "transparent" };

    return (
      <h1 className={hasFont ? "" : "is-empty"} style={style}>
        {sampleLetter}
      </h1>
    );
  };

  const f0 = getFont(0);
  const f1 = getFont(1);
  const f2 = getFont(2);

  return (
    <>
      {renderCell(f0)}
      <section>
        {renderCell(f1)}
        {renderCell(f2)}
      </section>
    </>
  );
}

function useFontsFromCollection(collection, fontsById) {
  const itemsKey = React.useMemo(() => {
    const items = Array.isArray(collection?.items) ? collection.items : [];
    return items.map((it) => String(it?.fontId)).join("|");
  }, [collection?.items]);

  return React.useMemo(() => {
    const items = Array.isArray(collection?.items) ? collection.items : [];
    const seen = new Set();
    const fonts = [];

    for (const item of items) {
      const idStr = String(item?.fontId);
      if (!idStr || seen.has(idStr)) continue;
      seen.add(idStr);

      const font = fontsById.get(idStr);
      if (font) fonts.push(font);
    }

    return fonts;
  }, [itemsKey, fontsById, collection?._id]);
}

function useFavorite(fontId) {
  const [favSelected, setFavSelected] = React.useState(false);

  React.useEffect(() => {
    if (window.__appState?.isFavorite) {
      setFavSelected(window.__appState.isFavorite(fontId));
    }
  }, [fontId]);

  const toggle = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (window.__appState?.toggleFavorite) {
      const newState = await window.__appState.toggleFavorite(fontId);
      setFavSelected(newState);
    }
  };

  return { favSelected, toggle };
}

function useSaveMenu(fontId, openSaveId, setOpenSaveId) {
  const isOpen = openSaveId === String(fontId);
  const toggle = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpenSaveId?.(isOpen ? null : String(fontId));
  };
  return { isOpen, toggle };
}

window.CollectionsHooks = {
  API_BASE,
  AlbumPreview,
  useFontsFromCollection,
  useFavorite,
  useSaveMenu,
};
