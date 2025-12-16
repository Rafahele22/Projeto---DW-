export async function fetchFonts() {
  const response = await fetch("../assets/data.json");
  if (!response.ok) {
    throw new Error(`Failed to load fonts: ${response.status} ${response.statusText}`);
  }
  const fonts = await response.json();
  return Array.isArray(fonts) ? fonts : [];
}
