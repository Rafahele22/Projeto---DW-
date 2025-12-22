import { API_BASE, AlbumPreview, useFontsFromCollection } from "./hooks.jsx";
import { ListItem, GridItem, PairsCard } from "./items.jsx";

export function CollectionHeader({
  collectionName,
  count,
  showEdit = true,
  onEdit,
  showDelete = true,
  onDelete,
  isEditing = false,
  editValue = "",
  onChangeEditValue,
  onSaveEdit,
  onCancelEdit,
}) {
  const isFavourites = collectionName === "Favourites";
  const canManage = !isFavourites;

  return (
    <div className="album_information">
      <div className="album_title">
        {isEditing ? (
          <input
            type="text"
            className="edit-album-input"
            value={editValue}
            onChange={(e) => onChangeEditValue?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit?.();
              if (e.key === "Escape") onCancelEdit?.();
            }}
            autoFocus
          />
        ) : (
          <h2>{collectionName || "Untitled Album"}</h2>
        )}

        {canManage && !isEditing && showEdit && (
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

        {canManage && !isEditing && showDelete && (
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

        {canManage && isEditing && (
          <>
            <a
              href="#"
              className="button"
              onClick={(e) => {
                e.preventDefault();
                onSaveEdit?.();
              }}
            >
              <img src="../assets/imgs/check.svg" alt="save icon" />
              <h4>Save</h4>
            </a>
            <a
              href="#"
              className="button"
              onClick={(e) => {
                e.preventDefault();
                onCancelEdit?.();
              }}
            >
              <img src="../assets/imgs/close.svg" alt="cancel icon" />
              <h4>Cancel</h4>
            </a>
          </>
        )}
      </div>

      <h2 className="collection-count">
        {count} font{count !== 1 ? "s" : ""}
      </h2>
    </div>
  );
}

export function CollectionToolbar({ searchTerm, setSearchTerm, currentMode, onSetMode }) {
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

export function AlbumsGrid({ collections, fontsById, onSelectCollection, onCreateCollection }) {
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
      const res = await fetch(`${API_BASE}/collections`, {
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
      } else {
        const text = await res.text();
        console.error("Create album error:", res.status, text);
        alert("Failed to create album: " + res.status);
      }
    } catch (err) {
      console.error("Failed to create album:", err);
      alert("Error creating album: " + (err?.message || ""));
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

export function CollectionList({
  collection,
  fontsById,
  globalText,
  setGlobalText,
  onOpenFont,
  currentViewMode,
  onSetViewMode,
  onCollectionRenamed,
  onDeleteCollection,
  onRefreshCollections,
}) {
  const allFonts = useFontsFromCollection(collection, fontsById);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openSaveId, setOpenSaveId] = React.useState(null);
  const isFavourites = collection?.name === "Favourites";
  const forceFavSelected = collection?.name === "Favourites";
  const [removedFontIds, setRemovedFontIds] = React.useState(new Set());

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editName, setEditName] = React.useState(collection?.name || "");

  const itemsLength = collection?.items?.length ?? 0;

  React.useEffect(() => {
    setIsEditingName(false);
    setEditName(collection?.name || "");
    setRemovedFontIds(new Set());
  }, [collection?._id, collection?.name, itemsLength]);

  const displayedFonts = React.useMemo(() => {
    let fonts = allFonts.filter((f) => !removedFontIds.has(String(f._id)));
    if (!searchTerm) return fonts;
    const lower = searchTerm.toLowerCase();
    return fonts.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        (f.foundry && f.foundry.toLowerCase().includes(lower))
    );
  }, [allFonts, searchTerm, removedFontIds]);

  const handleSaveName = async () => {
    const newName = editName.trim();
    if (!newName || newName === collection?.name) {
      setIsEditingName(false);
      setEditName(collection?.name || "");
      return;
    }

    const id = String(collection?._id);
    if (!id) {
      alert("Collection id not found");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        setIsEditingName(false);
        if (typeof onCollectionRenamed === "function") {
          onCollectionRenamed(id, newName);
        } else {
          collection.name = newName;
        }
      } else {
        const text = await res.text();
        console.error("Rename error status:", res.status, text);
        alert("Failed to rename album: " + res.status);
      }
    } catch (err) {
      console.error("Failed to rename album:", err);
      alert("Error renaming album: " + (err?.message || ""));
    }
  };

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this album?")) return;
    const id = String(collection?._id);
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleteCollection?.();
      } else {
        alert("Failed to delete album");
      }
    } catch (err) {
      alert("Error deleting album");
    }
  };

  const handleDeleteFont = (fontId) => {
    setRemovedFontIds((prev) => new Set([...prev, String(fontId)]));
    onRefreshCollections?.();
  };

  const actualCount = allFonts.length - removedFontIds.size;

  return (
    <>
      <CollectionHeader
        collectionName={collection?.name}
        count={actualCount}
        showEdit={!isFavourites}
        showDelete={!isFavourites}
        isEditing={isEditingName}
        editValue={editName}
        onChangeEditValue={setEditName}
        onEdit={() => setIsEditingName(true)}
        onSaveEdit={handleSaveName}
        onCancelEdit={() => {
          setIsEditingName(false);
          setEditName(collection?.name || "");
        }}
        onDelete={handleDeleteCollection}
      />

      {actualCount > 0 && (
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
            {actualCount === 0 ? "No fonts in this collection yet." : "No results found."}
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
              collectionId={String(collection?._id)}
              collectionName={collection?.name}
              onDeleteFont={handleDeleteFont}
              onFontRemovedFromCollection={handleDeleteFont}
            />
          ))
        )}
      </div>
    </>
  );
}

export function CollectionGrid({
  collection,
  fontsById,
  onOpenFont,
  currentViewMode,
  onSetViewMode,
  onCollectionRenamed,
  onDeleteCollection,
  onRefreshCollections,
}) {
  const allFonts = useFontsFromCollection(collection, fontsById);
  const [searchTerm, setSearchTerm] = React.useState("");
  const isFavourites = collection?.name === "Favourites";
  const forceFavSelected = collection?.name === "Favourites";
  const [removedFontIds, setRemovedFontIds] = React.useState(new Set());

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editName, setEditName] = React.useState(collection?.name || "");

  const itemsLength = collection?.items?.length ?? 0;

  React.useEffect(() => {
    setIsEditingName(false);
    setEditName(collection?.name || "");
    setRemovedFontIds(new Set());
  }, [collection?._id, collection?.name, itemsLength]);

  const displayedFonts = React.useMemo(() => {
    let fonts = allFonts.filter((f) => !removedFontIds.has(String(f._id)));
    if (!searchTerm) return fonts;
    const lower = searchTerm.toLowerCase();
    return fonts.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        (f.foundry && f.foundry.toLowerCase().includes(lower))
    );
  }, [allFonts, searchTerm, removedFontIds]);

  const handleSaveName = async () => {
    const newName = editName.trim();
    if (!newName || newName === collection?.name) {
      setIsEditingName(false);
      setEditName(collection?.name || "");
      return;
    }

    const id = String(collection?._id);
    if (!id) {
      alert("Collection id not found");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        setIsEditingName(false);
        if (typeof onCollectionRenamed === "function") {
          onCollectionRenamed(id, newName);
        } else {
          collection.name = newName;
        }
      } else {
        const text = await res.text();
        console.error("Rename error status:", res.status, text);
        alert("Failed to rename album: " + res.status);
      }
    } catch (err) {
      console.error("Failed to rename album:", err);
      alert("Error renaming album: " + (err?.message || ""));
    }
  };

  const handleDeleteCollection = async () => {
    if (!confirm("Are you sure you want to delete this album?")) return;
    const id = String(collection?._id);
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/collections/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleteCollection?.();
      } else {
        alert("Failed to delete album");
      }
    } catch (err) {
      alert("Error deleting album");
    }
  };

  const handleDeleteFont = (fontId) => {
    setRemovedFontIds((prev) => new Set([...prev, String(fontId)]));
    onRefreshCollections?.();
  };

  const actualCount = allFonts.length - removedFontIds.size;

  return (
    <>
      <CollectionHeader
        collectionName={collection?.name}
        count={actualCount}
        showEdit={!isFavourites}
        showDelete={!isFavourites}
        isEditing={isEditingName}
        editValue={editName}
        onChangeEditValue={setEditName}
        onEdit={() => setIsEditingName(true)}
        onSaveEdit={handleSaveName}
        onCancelEdit={() => {
          setIsEditingName(false);
          setEditName(collection?.name || "");
        }}
        onDelete={handleDeleteCollection}
      />

      {actualCount > 0 && (
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
            {actualCount === 0 ? "No fonts in this collection yet." : "No results found."}
          </p>
        ) : (
          displayedFonts.map((font) => (
            <GridItem
              key={String(font._id)}
              font={font}
              forceFavSelected={forceFavSelected}
              onOpenFont={onOpenFont}
              collectionId={String(collection?._id)}
              collectionName={collection?.name}
              onDeleteFont={handleDeleteFont}
              onFontRemovedFromCollection={handleDeleteFont}
            />
          ))
        )}
      </div>
    </>
  );
}

export function PairsGrid({ collection, fontsById, onOpenFont, onOpenPair, onRefreshCollections, forceFavSelected = false }) {
  const items = Array.isArray(collection?.items) ? collection.items : [];
  const [removedPairs, setRemovedPairs] = React.useState(new Set());
  
  const pairs = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length - 1; i += 2) {
      const headingItem = items[i];
      const bodyItem = items[i + 1];
      if (!headingItem || !bodyItem) continue;
      
      const headingFont = fontsById.get(String(headingItem.fontId));
      const bodyFont = fontsById.get(String(bodyItem.fontId));
      
      if (!headingFont || !bodyFont) continue;
      
      const pairKey = `${headingFont._id}|${bodyFont._id}`;
      if (!removedPairs.has(pairKey)) {
        result.push({ heading: headingFont, body: bodyFont, key: pairKey });
      }
    }
    return result;
  }, [items, fontsById, removedPairs]);

  const handleRemovePair = (headingId, bodyId) => {
    const pairKey = `${headingId}|${bodyId}`;
    setRemovedPairs(prev => new Set([...prev, pairKey]));
    onRefreshCollections?.();
  };

  if (pairs.length === 0)
    return (
      <p style={{ fontFamily: "roboto regular", color: "var(--darker-grey)" }}>
        No pairs yet.
      </p>
    );

  return (
    <div className="grid grid_view">
      {pairs.map(({ heading, body, key }) => (
        <PairsCard
          key={key}
          headingFont={heading}
          bodyFont={body}
          onOpenFont={onOpenFont}
          onOpenPair={onOpenPair}
          onRemovePair={handleRemovePair}
          forceFavSelected={forceFavSelected}
        />
      ))}
    </div>
  );
}