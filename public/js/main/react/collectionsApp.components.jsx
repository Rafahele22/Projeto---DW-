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

    return <h1 className={hasFont ? "" : "is-empty"} style={style}>{sampleLetter}</h1>;
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
    import("../state.js").then(({ isFavorite }) => {
      setFavSelected(isFavorite(fontId));
    });
  }, [fontId]);

  const toggle = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const { toggleFavorite } = await import("../state.js");
    const newState = await toggleFavorite(fontId);
    setFavSelected(newState);
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

function FavButton({ selected, onToggle }) {
  return (
    <a href="#" className="fav-btn" onClick={onToggle}>
      <img
        src={selected ? "../assets/imgs/fav_selected.svg" : "../assets/imgs/fav.svg"}
        alt="favourite"
      />
    </a>
  );
}

function SaveMenu({ isOpen }) {
  return (
    <section className="save_list" style={{ display: isOpen ? "block" : "none" }}>
      <h4>Save font on...</h4>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div>
          <h4>Aa</h4>
          <h4>Web</h4>
        </div>
        <h5 className="add-text">add</h5>
        <img src="../assets/imgs/check.svg" className="check-icon" alt="check icon" />
      </a>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div>
          <h4>Aa</h4>
          <h4>Print</h4>
        </div>
        <h5 className="add-text">add</h5>
        <img src="../assets/imgs/check.svg" className="check-icon" alt="check icon" />
      </a>
    </section>
  );
}

function SaveOption({ label }) {
  const [selected, setSelected] = React.useState(false);

  return (
    <a
      href="#"
      className={"save-option" + (selected ? " selected-option" : "")}
      data-type={label.toLowerCase()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelected((v) => !v);
      }}
    >
      <div>
        <h4>Aa</h4>
        <h4>{label}</h4>
      </div>
      <h5 className="add-text">add</h5>
      <img src="../assets/imgs/check.svg" className="check-icon" alt="check icon" />
    </a>
  );
}

/* =========================================================================
   HEADER & TOOLBAR
   ========================================================================= */

function CollectionHeader({
  collectionName,
  count,
  showEdit = true,
  onEdit,
  showDelete = true,
  onDelete,
}) {
  const isFavourites = collectionName === "Favourites";
  const canManage = !isFavourites;

  return (
    <div className="album_information">
      <div className="album_title">
        <h2>{collectionName || "Untitled Album"}</h2>

        {canManage && showEdit && (
          <a
            href="#"
            className="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <img src="../assets/imgs/edit.svg" alt="edit icon" />
            <h4>Edit</h4>
          </a>
        )}

        {canManage && showDelete && (
          <a
            href="#"
            className="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <img src="../assets/imgs/trash.svg" alt="trash icon" />
            <h4>Delete</h4>
          </a>
        )}
      </div>

      <h2 className="collection-count">
        {count} font{count !== 1 ? "s" : ""}
      </h2>
    </div>
  );
}



function CollectionToolbar({ searchTerm, setSearchTerm, currentMode, onSetMode }) {
  const activeMode = currentMode || "grid";

  return (
    <div
      id="second_bar"
      style={{
        position: "relative",
        top: "auto",
        paddingTop: 0,
        paddingBottom: "2vh",
        width: "100%",
        gridColumn: "1 / -1",
        backgroundColor: "transparent",
        marginBottom: "2vh",
      }}
    >
      <div></div>

      <div className="button" id="search_bar" style={{ display: "flex" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <img src="../assets/imgs/search.svg" alt="search icon" />
      </div>

      <section style={{ display: "flex", gap: "0.2vw" }}>
        <a
          href="#"
          id={activeMode === "grid" ? "view_mode_selected" : ""}
          onClick={(e) => {
            e.preventDefault();
            onSetMode("grid");
          }}
        >
          <img
            src={
              activeMode === "grid"
                ? "../assets/imgs/grid_selected.svg"
                : "../assets/imgs/grid.svg"
            }
            alt="icon display content grid"
          />
        </a>

        <a
          href="#"
          id={activeMode === "list" ? "view_mode_selected" : ""}
          onClick={(e) => {
            e.preventDefault();
            onSetMode("list");
          }}
        >
          <img
            src={
              activeMode === "list"
                ? "../assets/imgs/list_selected.svg"
                : "../assets/imgs/list.svg"
            }
            alt="icon display content list"
          />
        </a>
      </section>
    </div>
  );
}

function AlbumsGrid({ collections, fontsById, onSelectCollection, onCreateCollection }) {
  const list = Array.isArray(collections) ? collections : [];
  const [pendingAlbum, setPendingAlbum] = React.useState(null);
  const [albumName, setAlbumName] = React.useState("New Album");
  const inputRef = React.useRef(null);
  const pendingAlbumRef = React.useRef(null);

  const getPreviewFontsForCollection = (collection, max = 3) => {
    const items = Array.isArray(collection?.items) ? collection.items : [];
    const fonts = [];
    const seen = new Set();

    for (const item of items) {
      if (fonts.length >= max) break;

      const idStr = String(item?.fontId);
      if (!idStr || seen.has(idStr)) continue;

      seen.add(idStr);
      const font = fontsById.get(idStr);
      if (font) fonts.push(font);
    }

    return fonts;
  };

  const handleCreateClick = (e) => {
    e.preventDefault();
    setPendingAlbum({ tempId: Date.now() });
    setAlbumName("New Album");
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user._id) return;

    try {
      const res = await fetch("http://web-dev-grupo05.dei.uc.pt/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name: albumName.trim() || "New Album",
          type: "fonts",
        }),
      });

      if (res.ok) {
        setPendingAlbum(null);
        setAlbumName("New Album");
        if (typeof onCreateCollection === "function") onCreateCollection();
      }
    } catch (err) {
      console.error("Failed to create album:", err);
    }
  };

  React.useEffect(() => {
    if (pendingAlbum && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [pendingAlbum]);

  React.useEffect(() => {
    if (!pendingAlbum) return;

    const handleClickOutside = (e) => {
      if (pendingAlbumRef.current && !pendingAlbumRef.current.contains(e.target)) {
        setPendingAlbum(null);
        setAlbumName("New Album");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pendingAlbum]);

  const favIndex = list.findIndex((c) => c?.name === "Favourites");
  const beforeFav = favIndex >= 0 ? list.slice(0, favIndex + 1) : list;
  const afterFav = favIndex >= 0 ? list.slice(favIndex + 1) : [];

  return (
    <div className="grid grid_view">
      <div className="create_album" onClick={handleCreateClick}>
        <img src="../assets/imgs/create.svg" alt="create album icon" />
        <h4>Create New Album</h4>
      </div>

      {beforeFav.map((collection) => {
        const previewFonts = getPreviewFontsForCollection(collection, 3);
        const itemsCount = Array.isArray(collection?.items) ? collection.items.length : 0;
        const isFavourites = collection?.name === "Favourites";

        return (
          <div
            key={String(collection._id)}
            className="album"
            data-collection-id={String(collection._id)}
            onClick={(e) => {
              e.preventDefault();
              onSelectCollection?.(String(collection._id));
            }}
          >
            <article className="exemples_album">
              <AlbumPreview fonts={previewFonts} />
            </article>

            <section>
              <div>
                {isFavourites ? (
                  <img
                    src="../assets/imgs/fav_selected.svg"
                    className="check-icon"
                    alt="favourite icon"
                  />
                ) : null}
                <h2>{collection?.name}</h2>
              </div>
              <h3>
                {itemsCount} font{itemsCount !== 1 ? "s" : ""}
              </h3>
            </section>
          </div>
        );
      })}

      {pendingAlbum && (
        <div className="album pending-album" ref={pendingAlbumRef}>
          <article className="exemples_album">
            <AlbumPreview fonts={[]} />
          </article>

          <section>
            <div className="pending-album-input-row">
              <input
                ref={inputRef}
                type="text"
                className="pending-album-input"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm(e);
                }}
                onClick={(e) => e.stopPropagation()}
              />

              <button className="pending-album-confirm" onClick={handleConfirm}>
                <img src="../assets/imgs/check.svg" alt="confirm" />
              </button>
            </div>
          </section>
        </div>
      )}

      {afterFav.map((collection) => {
        const previewFonts = getPreviewFontsForCollection(collection, 3);
        const itemsCount = Array.isArray(collection?.items) ? collection.items.length : 0;

        return (
          <div
            key={String(collection._id)}
            className="album"
            data-collection-id={String(collection._id)}
            onClick={(e) => {
              e.preventDefault();
              onSelectCollection?.(String(collection._id));
            }}
          >
            <article className="exemples_album">
              <AlbumPreview fonts={previewFonts} />
            </article>

            <section>
              <div>
                <h2>{collection?.name}</h2>
              </div>
              <h3>
                {itemsCount} font{itemsCount !== 1 ? "s" : ""}
              </h3>
            </section>
          </div>
        );
      })}
    </div>
  );
}

function ListItem({
  font,
  forceFavSelected = false,
  globalText,
  setGlobalText,
  onOpenFont,
  openSaveId,
  setOpenSaveId,
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
    ensureFontFaceInline(font);
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
          <FavButton selected={forceFavSelected ? true : favSelected} onToggle={toggleFav} />
          <a
            href="#"
            className={"button save-btn" + (isSaveOpen ? " selected" : "")}
            onClick={toggleSave}
          >
            <h4>Save</h4>
          </a>
        </section>

        <SaveMenu isOpen={isSaveOpen} />
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

function GridItem({ font, onOpenFont, forceFavSelected = false }) {
  const { favSelected, toggle: toggleFav } = useFavorite(font?._id);
  const [saveOpen, setSaveOpen] = React.useState(false);

  React.useEffect(() => {
    ensureFontFaceInline(font);
  }, [font?._id]);

  const numStyles = Array.isArray(font?.weights) ? font.weights.length : 0;
  const sampleLetter =
    Array.isArray(font?.tags) && font.tags.includes("All Caps") ? "AA" : "Aa";

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

        <FavButton selected={forceFavSelected ? true : favSelected} onToggle={toggleFav} />
      </section>

      <section className="save" style={{ display: saveOpen ? "block" : "none" }}>
        <h4>Save font on...</h4>
        <SaveOption label="Web" />
        <SaveOption label="Print" />
      </section>

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

function CollectionList({
  collection,
  fontsById,
  globalText,
  setGlobalText,
  onOpenFont,
  currentViewMode,
  onSetViewMode,
}) {
  const allFonts = useFontsFromCollection(collection, fontsById);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openSaveId, setOpenSaveId] = React.useState(null);
  const isFavourites = collection?.name === "Favourites";
  const forceFavSelected = collection?.name === "Favourites";

  const displayedFonts = React.useMemo(() => {
    if (!searchTerm) return allFonts;
    const lower = searchTerm.toLowerCase();
    return allFonts.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        (f.foundry && f.foundry.toLowerCase().includes(lower))
    );
  }, [allFonts, searchTerm]);

  return (
    <>
      <CollectionHeader collectionName={collection?.name} count={allFonts.length} showEdit={!isFavourites} showDelete={!isFavourites}/>

      {allFonts.length > 0 && (
        <CollectionToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentMode={currentViewMode}
          onSetMode={onSetViewMode}
        />
      )}

      <div className="list-container">
        {displayedFonts.length === 0 ? (
          <p style={{ fontFamily: "roboto regular", color: "var(--darker-grey)" }}>
            {allFonts.length === 0 ? "No fonts in this collection yet." : "No results found."}
          </p>
        ) : (
          displayedFonts.map((font) => (
            <ListItem
              key={String(font._id)}
              font={font}
              forceFavSelected={forceFavSelected}
              globalText={globalText}
              setGlobalText={setGlobalText}
              onOpenFont={onOpenFont}
              openSaveId={openSaveId}
              setOpenSaveId={setOpenSaveId}
            />
          ))
        )}
      </div>
    </>
  );
}

function CollectionGrid({ collection, fontsById, onOpenFont, currentViewMode, onSetViewMode }) {
  const allFonts = useFontsFromCollection(collection, fontsById);
  const [searchTerm, setSearchTerm] = React.useState("");
  const isFavourites = collection?.name === "Favourites";
  const forceFavSelected = collection?.name === "Favourites";

  const displayedFonts = React.useMemo(() => {
    if (!searchTerm) return allFonts;
    const lower = searchTerm.toLowerCase();
    return allFonts.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        (f.foundry && f.foundry.toLowerCase().includes(lower))
    );
  }, [allFonts, searchTerm]);

  return (
    <>
      <CollectionHeader collectionName={collection?.name} count={allFonts.length} showEdit={!isFavourites} showDelete={!isFavourites}/>

      {allFonts.length > 0 && (
        <CollectionToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentMode={currentViewMode}
          onSetMode={onSetViewMode}
        />
      )}

      <div className="grid grid_view">
        {displayedFonts.length === 0 ? (
          <p
            style={{
              fontFamily: "roboto regular",
              color: "var(--darker-grey)",
              gridColumn: "1 / -1",
            }}
          >
            {allFonts.length === 0 ? "No fonts in this collection yet." : "No results found."}
          </p>
        ) : (
          displayedFonts.map((font) => (
            <GridItem
              key={String(font._id)}
              font={font}
              forceFavSelected={forceFavSelected}
              onOpenFont={onOpenFont}
            />
          ))
        )}
      </div>
    </>
  );
}

function PairsCard({ headingFont, bodyFont, onOpenFont, forceFavSelected = false }) {
  const { favSelected, toggle: toggleFav } = useFavorite(bodyFont?._id);

  React.useEffect(() => {
    ensureFontFaceInline(headingFont);
    ensureFontFaceInline(bodyFont);
  }, [headingFont?._id, bodyFont?._id]);

  const numStyles = Array.isArray(bodyFont?.weights) ? bodyFont.weights.length : 0;
  const headingBase = "Sample Heading";
  const isAllCaps = Array.isArray(headingFont?.tags) && headingFont.tags.includes("All Caps");
  const headingText = isAllCaps ? headingBase.toUpperCase() : headingBase;

  const bodyText =
    "This is sample text used to demonstrate how typefaces work together in a layout. It allows you to focus on form, spacing, hierarchy, rhythm, and contrast, helping evaluate how different fonts interact, complement each other, and perform across various sizes and contexts.";

  return (
    <article
      data-font-id={String(bodyFont?._id)}
      onClick={(e) => {
        if (e.target.closest("a") || e.target.closest("button")) return;
        onOpenFont?.(bodyFont);
      }}
    >
      <section className="grid_information_pairs">
        <FavButton selected={forceFavSelected ? true : favSelected} onToggle={toggleFav} />
      </section>

      <h1 className="pairs_title" style={{ fontFamily: `'${headingFont?._id}-font'` }}>
        {headingText}
      </h1>
      <p style={{ fontFamily: `'${bodyFont?._id}-font'` }}>{bodyText}</p>

      <section className="grid_information">
        <h2>{bodyFont?.name}</h2>
        <h3>
          {numStyles} {numStyles === 1 ? "style" : "styles"}
        </h3>
      </section>
    </article>
  );
}

function PairsGrid({ collection, fontsById, onOpenFont, forceFavSelected = false }) {
  const items = Array.isArray(collection?.items) ? collection.items : [];
  const ids = items.map((it) => String(it?.fontId)).filter(Boolean);
  const fonts = ids.map((id) => fontsById.get(id)).filter(Boolean);

  if (fonts.length === 0)
    return <p style={{ fontFamily: "roboto regular", color: "var(--darker-grey)" }}>No pairs yet.</p>;

  if (fonts.length === 1) {
    const only = fonts[0];
    return (
      <PairsCard
        headingFont={only}
        bodyFont={only}
        onOpenFont={onOpenFont}
        forceFavSelected={forceFavSelected}
      />
    );
  }

  return (
    <div className="grid grid_view">
      {fonts.map((headingFont, idx) => {
        const bodyFont = fonts[(idx + 1) % fonts.length];
        return (
          <PairsCard
            key={String(headingFont._id) + "-" + String(bodyFont?._id)}
            headingFont={headingFont}
            bodyFont={bodyFont}
            onOpenFont={onOpenFont}
            forceFavSelected={forceFavSelected}
          />
        );
      })}
    </div>
  );
}