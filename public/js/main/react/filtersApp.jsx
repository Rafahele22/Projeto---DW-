function ToggleOption({ label, selected, onClick, className = "option", dataAttrs = {} }) {
  return (
    <a
      href="#"
      className={className}
      onClick={(evt) => {
        evt.preventDefault();
        onClick?.();
      }}
      {...dataAttrs}
    >
      <div className={`option_selected${selected ? " selected" : ""}`} />
      <h5>{label}</h5>
    </a>
  );
}

function TagButton({ tag, selected, onToggle }) {
  return (
    <a
      href="#"
      className={`button tag-btn${selected ? " selected" : ""}`}
      onClick={(evt) => {
        evt.preventDefault();
        onToggle?.();
      }}
    >
      <h4>{tag}</h4>
    </a>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <>
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(evt) => onChange?.(evt.target.value)}
        aria-label="Search"
      />
      <img src="../assets/imgs/search.svg" alt="icon search" />
    </>
  );
}

function FiltersContent({ allTags, foundries, selections, onSelectionsChange }) {
  const { selectedTags, selectedFoundry, selectedFamilySize, selectedVariable } = selections;

  return (
    <>
      <section id="tags">
        {allTags.map((tag) => (
          <TagButton
            key={tag}
            tag={tag}
            selected={selectedTags.has(tag)}
            onToggle={() => {
              const next = new Set(selectedTags);
              if (next.has(tag)) next.delete(tag);
              else next.add(tag);
              onSelectionsChange({ ...selections, selectedTags: next });
            }}
          />
        ))}
      </section>

      <section className="filters_section">
        <h2>Foundry</h2>
        {foundries.map((f) => (
          <ToggleOption
            key={f}
            label={f}
            selected={selectedFoundry === f}
            className="option foundry-option"
            dataAttrs={{ "data-foundry": f }}
            onClick={() => {
              onSelectionsChange({
                ...selections,
                selectedFoundry: selectedFoundry === f ? null : f,
              });
            }}
          />
        ))}
      </section>

      <section className="filters_section">
        <h2>Family Size</h2>
        <ToggleOption
          label="Single (1 style)"
          selected={selectedFamilySize === "single"}
          dataAttrs={{ "data-family-size": "single" }}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedFamilySize: selectedFamilySize === "single" ? null : "single",
            })
          }
        />
        <ToggleOption
          label="Small (2-6 styles)"
          selected={selectedFamilySize === "small"}
          dataAttrs={{ "data-family-size": "small" }}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedFamilySize: selectedFamilySize === "small" ? null : "small",
            })
          }
        />
        <ToggleOption
          label="Medium (7-10 styles)"
          selected={selectedFamilySize === "medium"}
          dataAttrs={{ "data-family-size": "medium" }}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedFamilySize: selectedFamilySize === "medium" ? null : "medium",
            })
          }
        />
        <ToggleOption
          label="Large (11-20 styles)"
          selected={selectedFamilySize === "large"}
          dataAttrs={{ "data-family-size": "large" }}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedFamilySize: selectedFamilySize === "large" ? null : "large",
            })
          }
        />
        <ToggleOption
          label="Extra Large (21+ styles)"
          selected={selectedFamilySize === "xlarge"}
          dataAttrs={{ "data-family-size": "xlarge" }}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedFamilySize: selectedFamilySize === "xlarge" ? null : "xlarge",
            })
          }
        />
      </section>

      <section className="filters_section">
        <h2>Variable</h2>
        <ToggleOption
          label="Variable"
          selected={selectedVariable === "Variable"}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedVariable: selectedVariable === "Variable" ? null : "Variable",
            })
          }
        />
        <ToggleOption
          label="Static"
          selected={selectedVariable === "Static"}
          onClick={() =>
            onSelectionsChange({
              ...selections,
              selectedVariable: selectedVariable === "Static" ? null : "Static",
            })
          }
        />
      </section>
    </>
  );
}

function mountFiltersAndSearchImpl({ searchMountEl, filtersMountEl, allTags, foundries, onChange }) {
  if (!searchMountEl || !filtersMountEl) throw new Error("Missing React mount element(s)");
  if (typeof React === "undefined" || typeof ReactDOM === "undefined") {
    throw new Error("React/ReactDOM not found. Ensure scripts are loaded.");
  }

  
  const host = document.createElement("div");
  host.id = "react_root";
  host.style.display = "none";
  document.body.appendChild(host);

  const root = ReactDOM.createRoot(host);

  const api = {
    clearAll: null,
    unmount: null,
  };

  function App() {
    const [query, setQuery] = React.useState("");
    const [selections, setSelections] = React.useState({
      selectedTags: new Set(),
      selectedFoundry: null,
      selectedFamilySize: null,
      selectedVariable: null,
    });

    React.useEffect(() => {
      onChange?.({
        searchQuery: query,
        selectedTags: Array.from(selections.selectedTags),
        selectedFoundries: selections.selectedFoundry ? [selections.selectedFoundry] : [],
        selectedFamilySizes: selections.selectedFamilySize ? [selections.selectedFamilySize] : [],
        selectedVariables: selections.selectedVariable ? [selections.selectedVariable] : [],
      });
    }, [query, selections]);

    api.clearAll = () => {
      setQuery("");
      setSelections({
        selectedTags: new Set(),
        selectedFoundry: null,
        selectedFamilySize: null,
        selectedVariable: null,
      });
    };

    return (
      <>
        {ReactDOM.createPortal(<SearchBar value={query} onChange={setQuery} />, searchMountEl)}
        {ReactDOM.createPortal(
          <FiltersContent
            allTags={allTags}
            foundries={foundries}
            selections={selections}
            onSelectionsChange={setSelections}
          />,
          filtersMountEl
        )}
      </>
    );
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

window.mountFiltersAndSearch = mountFiltersAndSearchImpl;
