function AlbumPreview({ families }) {
  const sampleLetter = "Aa";
  const safeFamilies = Array.isArray(families) ? families.filter(Boolean) : [];
  
  const getFamily = (index) => safeFamilies[index] || safeFamilies[0] || "inherit";

  return (
    <>
      <h1 style={{ fontFamily: getFamily(0) }}>{sampleLetter}</h1>
      <section>
        <h1 style={{ fontFamily: getFamily(1) }}>{sampleLetter}</h1>
        <h1 style={{ fontFamily: getFamily(2) || getFamily(0) }}>{sampleLetter}</h1>
      </section>
    </>
  );
}

function useFontsFromCollection(collection, fontsById) {
  return React.useMemo(() => {
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

    return fonts;
  }, [collection, fontsById]);
}

function useFavorite() {
  const [favSelected, setFavSelected] = React.useState(false);
  const toggle = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setFavSelected((v) => !v);
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
      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <div><h4>Aa</h4><h4>Web</h4></div>
        <h5 className="add-text">add</h5>
        <img src="../assets/imgs/check.svg" className="check-icon" alt="check icon" />
      </a>
      <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <div><h4>Aa</h4><h4>Print</h4></div>
        <h5 className="add-text">add</h5>
        <img src="../assets/imgs/check.svg" className="check-icon" alt="check icon" />
      </a>
    </section>
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
  const { favSelected, toggle: toggleFav } = useFavorite();
  const { isOpen: isSaveOpen, toggle: toggleSave } = useSaveMenu(font?._id, openSaveId, setOpenSaveId);
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
    if (el.innerText !== desiredText) {
      el.innerText = desiredText;
    }
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
          <FavButton selected={favSelected} onToggle={toggleFav} />
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
      />
    </div>
  );
}

function GridItem({ font, onOpenFont }) {
  const { favSelected, toggle: toggleFav } = useFavorite();
  const [saveOpen, setSaveOpen] = React.useState(false);

  React.useEffect(() => {
    ensureFontFaceInline(font);
  }, [font?._id]);

  const numStyles = Array.isArray(font?.weights) ? font.weights.length : 0;
  const sampleLetter = Array.isArray(font?.tags) && font.tags.includes("All Caps") ? "AA" : "Aa";

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
        <FavButton selected={favSelected} onToggle={toggleFav} />
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
        <h3>{numStyles} {numStyles === 1 ? "style" : "styles"}</h3>
      </section>
    </article>
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
      <div><h4>Aa</h4><h4>{label}</h4></div>
      <h5 className="add-text">add</h5>
      <img src="../assets/imgs/check.svg" className="check-icon" alt="check icon" />
    </a>
  );
}

function CollectionList({ collection, fontsById, globalText, setGlobalText, onOpenFont }) {
  const fonts = useFontsFromCollection(collection, fontsById);
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

function CollectionGrid({ collection, fontsById, onOpenFont }) {
  const fonts = useFontsFromCollection(collection, fontsById);

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
        <GridItem key={String(font._id)} font={font} onOpenFont={onOpenFont} />
      ))}
    </>
  );
}

function PairsCard({ headingFont, bodyFont, onOpenFont }) {
  const { favSelected, toggle: toggleFav } = useFavorite();

  React.useEffect(() => {
    ensureFontFaceInline(headingFont);
    ensureFontFaceInline(bodyFont);
  }, [headingFont?._id, bodyFont?._id]);

  const numStyles = Array.isArray(bodyFont?.weights) ? bodyFont.weights.length : 0;
  const headingBase = "Sample Heading";
  const isAllCaps = Array.isArray(headingFont?.tags) && headingFont.tags.includes("All Caps");
  const headingText = isAllCaps ? headingBase.toUpperCase() : headingBase;

  const bodyText =
    "This is sample text used to demonstrate how typefaces work together. It allows designers to focus on form, spacing, hierarchy, and contrast. By removing meaning from the content, attention shifts to structure, rhythm, and the relationship between headline and body text.";

  return (
    <article
      data-font-id={String(bodyFont?._id)}
      onClick={(e) => {
        if (e.target.closest("a") || e.target.closest("button")) return;
        onOpenFont?.(bodyFont);
      }}
    >
      <section className="grid_information_pairs">
        <FavButton selected={favSelected} onToggle={toggleFav} />
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

function PairsGrid({ collection, fontsById, onOpenFont }) {
  const items = Array.isArray(collection?.items) ? collection.items : [];
  const ids = items.map((it) => String(it?.fontId)).filter(Boolean);
  const fonts = ids.map((id) => fontsById.get(id)).filter(Boolean);

  if (fonts.length === 0) {
    return (
      <p style={{ fontFamily: "roboto regular", color: "var(--darker-grey)" }}>
        No pairs yet.
      </p>
    );
  }

  if (fonts.length === 1) {
    const only = fonts[0];
    return <PairsCard headingFont={only} bodyFont={only} onOpenFont={onOpenFont} />;
  }

  // If the data doesn't store explicit pairs, use a simple deterministic rule:
  // each item becomes a card where the heading is that font and the body is the next font.
  return (
    <>
      {fonts.map((headingFont, idx) => {
        const bodyFont = fonts[(idx + 1) % fonts.length];
        return (
          <PairsCard
            key={String(headingFont._id) + "-" + String(bodyFont?._id)}
            headingFont={headingFont}
            bodyFont={bodyFont}
            onOpenFont={onOpenFont}
          />
        );
      })}
    </>
  );
}
