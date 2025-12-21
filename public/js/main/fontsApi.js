export async function fetchFonts() {
  const response = await fetch("http://web-dev-grupo05.dei.uc.pt/api/fonts");
  if (!response.ok) {
    throw new Error(`Failed to load fonts: ${response.status} ${response.statusText}`);
  }
  const fonts = await response.json();
  return Array.isArray(fonts) ? fonts : [];
}
