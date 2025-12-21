function mountCollectionsImpl({
  mountEl,
  getGlobalSampleText,
  setGlobalSampleText,
  onSelectCollection,
  onOpenFont,
}) {
  if (!mountEl) throw new Error("Missing mountEl");
  if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
    throw new Error("React/ReactDOM not found. Ensure scripts are loaded.");
  }

  ensureCollectionsCapsLockTracking();

  const host = document.createElement("div");
  host.style.display = "none";
  document.body.appendChild(host);

  const root = ReactDOM.createRoot(host);

  const api = {
    update: null,
    unmount: null,
  };

  let pendingUpdate = null;

  api.update = (next) => {
    if (!next) return;
    pendingUpdate = { ...(pendingUpdate || {}), ...next };
  };

  function App() {
    const [state, setState] = React.useState(() => ({
      view: "albums",
      collections: [],
      fonts: [],
      activeTab: "albums",
      openedCollectionId: null,
      collectionViewMode: "list",
      ...(pendingUpdate || {}),
    }));

    const [globalText, setGlobalText] = React.useState(
      typeof getGlobalSampleText === "function"
        ? getGlobalSampleText()
        : "The quick brown fox jumps over the lazy dog."
    );

    React.useEffect(() => {
      api.update = (next) => {
        setState((prev) => ({ ...prev, ...(next || {}) }));
      };

      if (pendingUpdate) {
        const toApply = pendingUpdate;
        pendingUpdate = null;
        setState((prev) => ({ ...prev, ...toApply }));
      }
    }, []);

    React.useEffect(() => {
      if (typeof setGlobalSampleText === "function") {
        setGlobalSampleText(globalText);
      }
    }, [globalText]);

    const fontsById = React.useMemo(() => {
      const map = new Map();
      (Array.isArray(state.fonts) ? state.fonts : []).forEach((f) => {
        map.set(String(f?._id ?? f?.id), f);
      });
      return map;
    }, [state.fonts]);

    const visibleCollections = React.useMemo(() => {
      const all = Array.isArray(state.collections) ? state.collections : [];
      if (state.view === "pairs" || state.activeTab === "pairs") {
        return all.filter((c) => c?.type === "pairs");
      }
      return all.filter((c) => c?.type === "fonts");
    }, [state.collections, state.view, state.activeTab]);

    const pairsCollection = React.useMemo(() => {
      const all = Array.isArray(state.collections) ? state.collections : [];
      return all.find((c) => c?.type === "pairs") || null;
    }, [state.collections]);

    const openedCollection = React.useMemo(() => {
      if (!state.openedCollectionId) return null;
      const all = Array.isArray(state.collections) ? state.collections : [];
      return all.find((c) => String(c?._id) === String(state.openedCollectionId)) || null;
    }, [state.collections, state.openedCollectionId]);

    const setViewMode = (mode) => {
  setState((prev) => ({ ...prev, collectionViewMode: mode }));
};


    const content = (() => {
      if (state.view === "collection") {
  if (state.collectionViewMode === "grid") {
    return (
      <CollectionGrid
        collection={openedCollection}
        fontsById={fontsById}
        onOpenFont={onOpenFont}
        currentViewMode={state.collectionViewMode}
        onSetViewMode={setViewMode}
      />
    );
  }

  return (
    <CollectionList
      collection={openedCollection}
      fontsById={fontsById}
      globalText={globalText}
      setGlobalText={setGlobalText}
      onOpenFont={onOpenFont}
      currentViewMode={state.collectionViewMode}
      onSetViewMode={setViewMode}
    />
  );
}


      if (state.view === "pairs") {
  return (
    <PairsGrid
      collection={pairsCollection}
      fontsById={fontsById}
      onOpenFont={onOpenFont}
      forceFavSelected={true} 
    />
  );
}


      const refreshCollections = async () => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || !user._id) return;
        try {
          const res = await fetch(`http://web-dev-grupo05.dei.uc.pt/api/collections?userId=${encodeURIComponent(user._id)}`);
          if (res.ok) {
            const data = await res.json();
            setState((prev) => ({ ...prev, collections: data }));
          }
        } catch (e) {
          console.error("Failed to refresh collections:", e);
        }
      };

      return (
        <AlbumsGrid
          collections={visibleCollections}
          fontsById={fontsById}
          onSelectCollection={(id) => onSelectCollection?.(id)}
          onCreateCollection={refreshCollections}
        />
      );
    })();

    return ReactDOM.createPortal(content, mountEl);
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  api.unmount = () => {
    root.unmount();
    host.remove();
  };

  return api;
}

window.mountCollections = mountCollectionsImpl;
