let cachedFontsById = null;
let cachedFontsArray = null;

export function getFontsById(allFonts) {
  if (cachedFontsArray !== allFonts) {
    cachedFontsArray = allFonts;
    cachedFontsById = new Map(allFonts.map((f) => [String(f._id), f]));
  }
  return cachedFontsById;
}

export function invalidateFontCache() {
  cachedFontsById = null;
  cachedFontsArray = null;
}
