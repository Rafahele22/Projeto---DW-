import { API_BASE, useFavorite, useSaveMenu } from "./hooks.jsx";

export function FavButton({ selected, onToggle }) {
  return (
    <a href="#" className="fav-btn" onClick={onToggle}>
      <img
        src={selected ? "../assets/imgs/fav_selected.svg" : "../assets/imgs/fav.svg"}
        alt="favourite"
      />
    </a>
  );
}

export function SaveMenu({ isOpen, fontId, onClose }) {
  const [collections, setCollections] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  React.useEffect(() => {
    if (!isOpen) return;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) return;

    fetch(`${API_BASE}/collections?userId=${encodeURIComponent(user._id)}`)
      .then((res) => res.json())
      .then((data) => {
        const fontsCols = (Array.isArray(data) ? data : []).filter(
          (c) => c?.type === "fonts" && c?.name !== "Favourites"
        );
        setCollections(fontsCols);

        const selected = new Set();
        for (const col of fontsCols) {
          const items = Array.isArray(col.items) ? col.items : [];
          if (items.some((it) => String(it?.fontId) === String(fontId))) {
            selected.add(String(col._id));
          }
        }
        setSelectedIds(selected);
      })
      .catch(() => {});
  }, [isOpen, fontId]);

  const handleToggle = async (col) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) return;

    try {
      const res = await fetch(`${API_BASE}/collections/toggle-font`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          collectionName: col.name,
          fontId: String(fontId),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (data.added) next.add(String(col._id));
          else next.delete(String(col._id));
          return next;
        });
      }
    } catch (e) {}
  };

  return (
    <section className="save_list" style={{ display: isOpen ? "block" : "none" }}>
      <h4>Save font on...</h4>
      {collections.map((col) => {
        const isSelected = selectedIds.has(String(col._id));
        return (
          <a
            key={String(col._id)}
            href="#"
            className={isSelected ? "selected-option" : ""}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggle(col);
            }}
          >
            <div>
              <h4>Aa</h4>
              <h4>{col.name}</h4>
            </div>
            <h5 className="add-text">{isSelected ? "added" : "add"}</h5>
            <img
              src="../assets/imgs/check.svg"
              className="check-icon"
              alt="check icon"
              style={{ opacity: isSelected ? 1 : 0 }}
            />
          </a>
        );
      })}
    </section>
  );
}

export function GridSaveMenu({ isOpen, fontId }) {
  // Nota: A lógica é idêntica à SaveMenu mas o markup/classes variam ligeiramente
  const [collections, setCollections] = React.useState([]);
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  React.useEffect(() => {
    if (!isOpen) return;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) return;

    fetch(`${API_BASE}/collections?userId=${encodeURIComponent(user._id)}`)
      .then((res) => res.json())
      .then((data) => {
        const fontsCols = (Array.isArray(data) ? data : []).filter(
          (c) => c?.type === "fonts" && c?.name !== "Favourites"
        );
        setCollections(fontsCols);

        const selected = new Set();
        for (const col of fontsCols) {
          const items = Array.isArray(col.items) ? col.items : [];
          if (items.some((it) => String(it?.fontId) === String(fontId))) {
            selected.add(String(col._id));
          }
        }
        setSelectedIds(selected);
      })
      .catch(() => {});
  }, [isOpen, fontId]);

  const handleToggle = async (col) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) return;

    try {
      const res = await fetch(`${API_BASE}/collections/toggle-font`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          collectionName: col.name,
          fontId: String(fontId),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (data.added) next.add(String(col._id));
          else next.delete(String(col._id));
          return next;
        });
      }
    } catch (e) {}
  };

  return (
    <section className="save" style={{ display: isOpen ? "block" : "none" }}>
      <h4>Save font on...</h4>
      {collections.map((col) => {
        const isSelected = selectedIds.has(String(col._id));
        return (
          <a
            key={String(col._id)}
            href="#"
            className={"save-option" + (isSelected ? " selected-option" : "")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleToggle(col);
            }}
          >
            <div>
              <h4>Aa</h4>
              <h4>{col.name}</h4>
            </div>
            <h5 className="add-text">{isSelected ? "added" : "add"}</h5>
            <img
              src="../assets/imgs/check.svg"
              className="check-icon"
              alt="check icon"
              style={{ opacity: isSelected ? 1 : 0 }}
            />
          </a>
        );
      })}
    </section>
  );
}

export function ListItem({
  font,
  forceFavSelected = false,
  globalText,
  setGlobalText,
  onOpenFont,
  openSaveId,
  setOpenSaveId,
  collectionId,
  collectionName,
  onDeleteFont,
  onFontRemovedFromCollection,
}) {
  const { favSelected, toggle: toggleFav } = useFavorite(font?._id);
  const { isOpen: isSaveOpen, toggle: toggleSave } = useSaveMenu(
    font?._id,
    openSaveId,
    setOpenSaveId
  );

  const hasAllCaps = Array.isArray(font?.tags) && font.tags.includes("All Caps");
  const editableRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof ensureFontFaceInline !== "undefined") ensureFontFaceInline(font);
  }, [font?._id]);

  const numStyles = Array.isArray(font?.weights) ? font.weights.length : 0;
  const desiredText = hasAllCaps
    ? String(globalText || "").toUpperCase()
    : String(globalText || "");

  React.useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerText !== desiredText) el.innerText = desiredText;
  }, [desiredText]);

  const handleTrashClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!collectionId || !font?._id) return;

    try {
      const res = await fetch(`${API_BASE}/collections/${collectionId}/fonts/${font._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleteFont?.(font._id);
      }
    } catch (err) {}
  };

  const handleFavToggle = async (e) => {
    const wasSelected = favSelected || forceFavSelected;
    console.log('[ListItem handleFavToggle]', { collectionName, wasSelected, fontId: font._id });
    if (collectionName === "Favourites" && wasSelected) {
      await toggleFav(e);
      console.log('[ListItem] Calling onFontRemovedFromCollection');
      onFontRemovedFromCollection?.(font._id);
    } else {
      await toggleFav(e);
    }
  };

  const isFavourites = collectionName === "Favourites";

  return (
    <div
      className="list"
      data-all-caps={hasAllCaps ? "1" : "0"}
      onClick={(e) => {
        if (
          e.target.closest("a") ||
          e.target.closest("input") ||
          e.target.closest(".save_list") ||
          e.target.closest(".range-container") ||
          e.target.closest('h1[contenteditable="true"]')
        )
          return;

        onOpenFont?.(font);
      }}
    >
      <div className="list_information_bar">
        <section className="list_information">
          <h3>{font?.name}</h3>
          {font?.foundry && font.foundry !== "Unknown" ? <h3>{font.foundry}</h3> : null}
          <h3>
            {numStyles} {numStyles === 1 ? "style" : "styles"}
          </h3>
          {font?.variable ? <h3>Variable</h3> : null}
        </section>

        <section className="list_information">
          {!isFavourites && (
            <a href="#" className="trash-btn" onClick={handleTrashClick}>
              <img src="../assets/imgs/trash.svg" alt="trash icon" />
            </a>
          )}

          <FavButton selected={forceFavSelected ? true : favSelected} onToggle={handleFavToggle} />

          <a
            href="#"
            className={"button save-btn" + (isSaveOpen ? " selected" : "")}
            onClick={toggleSave}
          >
            <h4>Save</h4>
          </a>
        </section>

        <SaveMenu isOpen={isSaveOpen} fontId={font?._id} />
      </div>

      <h1
        className="sampleText"
        contentEditable={true}
        suppressContentEditableWarning={true}
        ref={editableRef}
        style={{
          fontFamily: `'${font?._id}-font'`,
          lineHeight: "4.5vw",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onInput={(e) => {
          const visualText = e.currentTarget.innerText;
          const isCapsLockOn = !!window.__collectionsIsCapsLockOn;

          if (!hasAllCaps) {
            setGlobalText?.(visualText);
            return;
          }

          if (!isCapsLockOn) {
            setGlobalText?.(visualText.toLowerCase());
          } else {
            setGlobalText?.(visualText);
          }
        }}
      />
    </div>
  );
}

export function GridItem({
  font,
  onOpenFont,
  forceFavSelected = false,
  collectionId,
  collectionName,
  onDeleteFont,
  onFontRemovedFromCollection,
}) {
  const { favSelected, toggle: toggleFav } = useFavorite(font?._id);
  const [saveOpen, setSaveOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof ensureFontFaceInline !== "undefined") ensureFontFaceInline(font);
  }, [font?._id]);

  const numStyles = Array.isArray(font?.weights) ? font.weights.length : 0;
  const sampleLetter =
    Array.isArray(font?.tags) && font.tags.includes("All Caps") ? "AA" : "Aa";

  const handleTrashClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!collectionId || !font?._id) return;

    try {
      const res = await fetch(`${API_BASE}/collections/${collectionId}/fonts/${font._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleteFont?.(font._id);
      }
    } catch (err) {}
  };

  const handleFavToggle = async (e) => {
    const wasSelected = favSelected || forceFavSelected;
    console.log('[GridItem handleFavToggle]', { collectionName, wasSelected, fontId: font._id });
    if (collectionName === "Favourites" && wasSelected) {
      await toggleFav(e);
      console.log('[GridItem] Calling onFontRemovedFromCollection');
      onFontRemovedFromCollection?.(font._id);
    } else {
      await toggleFav(e);
    }
  };

  const isFavourites = collectionName === "Favourites";

  return (
    <article
      data-font-id={String(font?._id)}
      onClick={(e) => {
        if (e.target.closest("a") || e.target.closest("button") || e.target.closest(".save")) {
          return;
        }
        onOpenFont?.(font);
      }}
      onMouseLeave={() => setSaveOpen(false)}
    >
      <section className="grid_information">
        <a
          href="#"
          className={"button save-btn" + (saveOpen ? " selected" : "")}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaveOpen((v) => !v);
          }}
        >
          <h4>Save</h4>
        </a>

        <div className="album_icons_grid">
          {!isFavourites && (
            <a href="#" className="trash-btn" onClick={handleTrashClick}>
              <img src="../assets/imgs/trash.svg" alt="trash icon" />
            </a>
          )}

          <FavButton selected={forceFavSelected ? true : favSelected} onToggle={handleFavToggle} />
        </div>
      </section>

      <GridSaveMenu isOpen={saveOpen} fontId={font?._id} />

      <h1 className="title_gridview" style={{ fontFamily: `'${font?._id}-font'` }}>
        {sampleLetter}
      </h1>

      <section className="grid_information">
        <h2>{font?.name}</h2>
        <h3>
          {numStyles} {numStyles === 1 ? "style" : "styles"}
        </h3>
      </section>
    </article>
  );
}

export function PairsCard({ headingFont, bodyFont, onOpenFont, onOpenPair, onRemovePair, forceFavSelected = false }) {
  const [isRemoved, setIsRemoved] = React.useState(false);

  React.useEffect(() => {
    if (typeof ensureFontFaceInline !== "undefined") {
        ensureFontFaceInline(headingFont);
        ensureFontFaceInline(bodyFont);
    }
  }, [headingFont?._id, bodyFont?._id]);

  const numStyles = Array.isArray(bodyFont?.weights) ? bodyFont.weights.length : 0;

  const headingBase = "Sample Heading";
  const isAllCaps = Array.isArray(headingFont?.tags) && headingFont.tags.includes("All Caps");
  const headingText = isAllCaps ? headingBase.toUpperCase() : headingBase;

  const bodyText =
    "This is sample text used to demonstrate how typefaces work together in a layout. It allows you to focus on form, spacing, hierarchy, rhythm, and contrast, helping evaluate how different fonts interact, complement each other, and perform across various sizes and contexts.";

  const headingNumStyles = Array.isArray(headingFont?.weights) ? headingFont.weights.length : 0;

  const handleFavToggle = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) return;

    try {
      const res = await fetch(`${API_BASE}/pairs/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          headingFontId: String(headingFont?._id),
          bodyFontId: String(bodyFont?._id),
        }),
      });
      if (res.ok) {
        setIsRemoved(true);
        onRemovePair?.(headingFont?._id, bodyFont?._id);
      }
    } catch (err) {}
  };

  if (isRemoved) return null;

  return (
    <article
      data-font-id={String(bodyFont?._id)}
      onClick={(e) => {
        if (e.target.closest("a") || e.target.closest("button")) return;
        if (typeof onOpenPair === "function") {
          onOpenPair(headingFont, bodyFont);
        } else {
          onOpenFont?.(bodyFont);
        }
      }}
    >
      <section className="grid_information_pairs">
        <FavButton selected={true} onToggle={handleFavToggle} />
      </section>

      <h1 className="pairs_title" style={{ fontFamily: `'${headingFont?._id}-font'` }}>
        {headingText}
      </h1>

      <p style={{ fontFamily: `'${bodyFont?._id}-font'` }}>{bodyText}</p>
      <section className="grid_information_font_title">
        <h2>{headingFont?.name}</h2>
        <h3>
          {headingNumStyles} {headingNumStyles === 1 ? "style" : "styles"}
        </h3>
      </section>

      <section className="grid_information">
        <h2>{bodyFont?.name}</h2>
        <h3>
          {numStyles} {numStyles === 1 ? "style" : "styles"}
        </h3>
      </section>
    </article>
  );
}