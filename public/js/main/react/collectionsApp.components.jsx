function AlbumPreview({ families }) {
  const sampleLetter = "Aa";
  const safeFamilies = Array.isArray(families) ? families.filter(Boolean) : [];
  const count = safeFamilies.length;

  if (count === 0) {
    return (
      <>
        <h1 style={{ fontFamily: "inherit" }}>{sampleLetter}</h1>
        <section>
          <h1 style={{ fontFamily: "inherit" }}>{sampleLetter}</h1>
          <h1 style={{ fontFamily: "inherit" }}>{sampleLetter}</h1>
        </section>
      </>
    );
  }

  if (count === 1) {
    return (
      <>
        <h1 style={{ fontFamily: safeFamilies[0] }}>{sampleLetter}</h1>
        <section>
          <h1 style={{ fontFamily: safeFamilies[0] }}>{sampleLetter}</h1>
          <h1 style={{ fontFamily: safeFamilies[0] }}>{sampleLetter}</h1>
        </section>
      </>
    );
  }

  if (count === 2) {
    return (
      <>
        <h1 style={{ fontFamily: safeFamilies[0] }}>{sampleLetter}</h1>
        <section>
          <h1 style={{ fontFamily: safeFamilies[1] }}>{sampleLetter}</h1>
          <h1 style={{ fontFamily: safeFamilies[0] }}>{sampleLetter}</h1>
        </section>
      </>
    );
  }

  return (
    <>
      <h1 style={{ fontFamily: safeFamilies[0] }}>{sampleLetter}</h1>
      <section>
        <h1 style={{ fontFamily: safeFamilies[1] }}>{sampleLetter}</h1>
        <h1 style={{ fontFamily: safeFamilies[2] }}>{sampleLetter}</h1>
      </section>
    </>
  );
}

function AlbumsGrid({ collections, fontsById, onSelectCollection }) {
  const list = Array.isArray(collections) ? collections : [];

  const getFamiliesForCollection = (collection, max = 3) => {
    const items = Array.isArray(collection?.items) ? collection.items : [];
    const families = [];

    for (const item of items) {
      if (families.length >= max) break;
      const font = fontsById.get(String(item?.fontId));
      const family = font?.family || font?.name || null;
      if (family) families.push(family);
    }

    return families;
  };

  if (list.length === 0) {
    return (
      <p style={{ fontFamily: "roboto regular", color: "var(--darker-grey)" }}>
        No collections yet.
      </p>
    );
  }

  return (
    <>
      {list.map((collection) => {
        const families = getFamiliesForCollection(collection, 3);
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
              <AlbumPreview families={families} />
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
    </>
  );
}

function ListItem({
  font,
  globalText,
  setGlobalText,
  onOpenFont,
  openSaveId,
  setOpenSaveId,
}) {
  const [favSelected, setFavSelected] = React.useState(false);
  const hasAllCaps = Array.isArray(font?.tags) && font.tags.includes("All Caps");

  React.useEffect(() => {
    ensureFontFaceInline(font);
  }, [font?._id]);

  const numStyles = Array.isArray(font?.weights) ? font.weights.length : 0;
  const displayText = hasAllCaps ? String(globalText || "").toUpperCase() : String(globalText || "");

  const isSaveOpen = openSaveId === String(font?._id);

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
        ) {
          return;
        }
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
          <a
            href="#"
            className="fav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFavSelected((v) => !v);
            }}
          >
            <img
              src={favSelected ? "../assets/imgs/fav_selected.svg" : "../assets/imgs/fav.svg"}
              alt="favourite"
            />
          </a>
          <a
            href="#"
            className={"button save-btn" + (isSaveOpen ? " selected" : "")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpenSaveId(isSaveOpen ? null : String(font?._id));
            }}
          >
            <h4>Save</h4>
          </a>
        </section>
        <section className="save_list" style={{ display: isSaveOpen ? "block" : "none" }}>
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
      </div>

      <h1
        className="sampleText"
        contentEditable={true}
        suppressContentEditableWarning={true}
        style={{
          fontFamily: `'${font?._id}-font'`,
          lineHeight: "4.5vw",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          outline: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
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
      >
        {displayText}
      </h1>
    </div>
  );
}

function CollectionList({ collection, fontsById, globalText, setGlobalText, onOpenFont }) {
  const items = Array.isArray(collection?.items) ? collection.items : [];
  const seen = new Set();
  const fonts = [];

  for (const item of items) {
    const idStr = String(item?.fontId);
    if (seen.has(idStr)) continue;
    seen.add(idStr);
    const font = fontsById.get(idStr);
    if (font) fonts.push(font);
  }

  const [openSaveId, setOpenSaveId] = React.useState(null);

  if (fonts.length === 0) {
    return (
      <p style={{ fontFamily: "roboto regular", color: "var(--darker-grey)" }}>
        No fonts in this collection yet.
      </p>
    );
  }

  return (
    <>
      {fonts.map((font) => (
        <ListItem
          key={String(font._id)}
          font={font}
          globalText={globalText}
          setGlobalText={setGlobalText}
          onOpenFont={onOpenFont}
          openSaveId={openSaveId}
          setOpenSaveId={setOpenSaveId}
        />
      ))}
    </>
  );
}
