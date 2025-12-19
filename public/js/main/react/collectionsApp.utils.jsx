function ensureCollectionsCapsLockTracking() {
  if (window.__collectionsCapsLockTrackingAttached) return;
  window.__collectionsCapsLockTrackingAttached = true;

  window.__collectionsIsCapsLockOn = false;

  document.addEventListener("keydown", (e) => {
    window.__collectionsIsCapsLockOn = e.getModifierState("CapsLock");
  });
  document.addEventListener("keyup", (e) => {
    window.__collectionsIsCapsLockOn = e.getModifierState("CapsLock");
  });
}

function ensureFontFaceInline(font) {
  const weights = Array.isArray(font?.weights) ? font.weights : [];
  const defaultWeight = weights.find((w) => w?.default) || weights[0];
  if (!defaultWeight?.file) return;

  const id = font?._id;
  if (id === null || id === undefined) return;

  const fontPath = `../assets/fonts/${defaultWeight.file}`;
  const styleId = `font-face-${id}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `\n    @font-face {\n      font-family:'${id}-font';\n      src:url('${fontPath}');\n    }\n  `;
  document.head.appendChild(style);
}
