export async function fetchFonts() {
  const response = await fetch("http://localhost:4000/api/fonts");
  if (!response.ok) {
    throw new Error(`Failed to load fonts: ${response.status} ${response.statusText}`);
  }
  const fonts = await response.json();
  return Array.isArray(fonts) ? fonts : [];
}
