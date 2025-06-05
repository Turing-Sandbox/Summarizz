/**
 * Generates a consistent color based on a string input
 * @param text Any string to generate a color from
 * @returns A CSS-compatible color string
 */
export function generateColorFromText(text: string): string {
  // Default color if text is empty
  if (!text) return '#6366F1';
  
  // Use the string to generate a hash code
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Define a palette of pleasing colors
  const colorPalette = [
    '#4F46E5', // Indigo
    '#7C3AED', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo Light
  ];
  
  // Use the hash to select a color from the palette
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}
