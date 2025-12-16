let globalSampleText = "The quick brown fox jumps over the lazy dog.";
let allFonts = [];

export function getGlobalSampleText() {
  return globalSampleText;
}

export function setGlobalSampleText(value) {
  globalSampleText = String(value ?? "");
}

export function getAllFonts() {
  return allFonts;
}

export function setAllFonts(fonts) {
  allFonts = Array.isArray(fonts) ? fonts : [];
}
