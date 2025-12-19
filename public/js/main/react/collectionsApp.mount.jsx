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

    const openedCollection = React.useMemo(() => {
      if (!state.openedCollectionId) return null;
      const all = Array.isArray(state.collections) ? state.collections : [];
      return all.find((c) => String(c?._id) === String(state.openedCollectionId)) || null;
    }, [state.collections, state.openedCollectionId]);

    const content = (() => {
      if (state.view === "collection") {
        return (
          <CollectionList
            collection={openedCollection}
            fontsById={fontsById}
            globalText={globalText}
            setGlobalText={setGlobalText}
            onOpenFont={onOpenFont}
          />
        );
      }

      if (state.view === "pairs") {
        return (
          <AlbumsGrid
            collections={visibleCollections}
            fontsById={fontsById}
            onSelectCollection={(id) => onSelectCollection?.(id)}
          />
        );
      }

      return (
        <AlbumsGrid
          collections={visibleCollections}
          fontsById={fontsById}
          onSelectCollection={(id) => onSelectCollection?.(id)}
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
