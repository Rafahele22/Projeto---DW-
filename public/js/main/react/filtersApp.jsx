const FAMILY_SIZES = [
  { key: "single", label: "Single (1 style)" },
  { key: "small", label: "Small (2-6 styles)" },
  { key: "medium", label: "Medium (7-10 styles)" },
  { key: "large", label: "Large (11-20 styles)" },
  { key: "xlarge", label: "Extra Large (21+ styles)" },
];

const VARIABLE_OPTIONS = [
  { key: "Variable", label: "Variable" },
  { key: "Static", label: "Static" },
];

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

  const toggleSelection = (key, currentValue, newValue) => {
    onSelectionsChange({
      ...selections,
      [key]: currentValue === newValue ? null : newValue,
    });
  };

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
            onClick={() => toggleSelection("selectedFoundry", selectedFoundry, f)}
          />
        ))}
      </section>

      <section className="filters_section">
        <h2>Family Size</h2>
        {FAMILY_SIZES.map(({ key, label }) => (
          <ToggleOption
            key={key}
            label={label}
            selected={selectedFamilySize === key}
            dataAttrs={{ "data-family-size": key }}
            onClick={() => toggleSelection("selectedFamilySize", selectedFamilySize, key)}
          />
        ))}
      </section>

      <section className="filters_section">
        <h2>Variable</h2>
        {VARIABLE_OPTIONS.map(({ key, label }) => (
          <ToggleOption
            key={key}
            label={label}
            selected={selectedVariable === key}
            onClick={() => toggleSelection("selectedVariable", selectedVariable, key)}
          />
        ))}
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
