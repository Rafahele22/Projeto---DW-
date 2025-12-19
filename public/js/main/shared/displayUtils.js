export function hide(...elements) {
  for (const el of elements) {
    if (el) el.style.display = "none";
  }
}

export function show(...elements) {
  for (const el of elements) {
    if (el) el.style.display = "";
  }
}

export function showFlex(...elements) {
  for (const el of elements) {
    if (el) el.style.display = "flex";
  }
}

export function showBlock(...elements) {
  for (const el of elements) {
    if (el) el.style.display = "block";
  }
}

export function showGrid(...elements) {
  for (const el of elements) {
    if (el) el.style.display = "grid";
  }
}

export function stashDisplayState(elements) {
  const stash = new Map();
  for (const el of elements) {
    if (el) stash.set(el, el.style.display);
  }
  return stash;
}

export function restoreDisplayState(stash) {
  for (const [el, display] of stash) {
    if (el) el.style.display = display ?? "";
  }
}

export function isVisible(el) {
  return el && el.style.display !== "none";
}
