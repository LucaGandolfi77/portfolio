/**
 * styles.js — registry dati degli stili artistici di RAVE (puro).
 */

export const STYLES = [
  { id: 'none', name: 'Originale', nameEn: 'Original', icon: '📷', gradient: 'linear-gradient(135deg,#334155,#0f172a)', group: 'base' },
  { id: 'vangogh', name: 'Van Gogh', nameEn: 'Van Gogh', icon: '🌻', gradient: 'linear-gradient(135deg,#f59e0b,#1d4ed8)', group: 'classic' },
  { id: 'picasso', name: 'Picasso', nameEn: 'Picasso', icon: '🎨', gradient: 'linear-gradient(135deg,#ef4444,#3b82f6)', group: 'classic' },
  { id: 'monet', name: 'Monet', nameEn: 'Monet', icon: '🌸', gradient: 'linear-gradient(135deg,#a7f3d0,#93c5fd)', group: 'classic' },
  { id: 'hokusai', name: 'Hokusai', nameEn: 'Hokusai', icon: '🌊', gradient: 'linear-gradient(135deg,#1e3a8a,#e0f2fe)', group: 'classic' },
  { id: 'warhol', name: 'Warhol', nameEn: 'Warhol', icon: '🟡', gradient: 'linear-gradient(135deg,#facc15,#ec4899,#22d3ee)', group: 'pop' },
  { id: 'klimt', name: 'Klimt', nameEn: 'Klimt', icon: '✨', gradient: 'linear-gradient(135deg,#fbbf24,#92400e)', group: 'classic' },
  { id: 'matisse', name: 'Matisse', nameEn: 'Matisse', icon: '🔷', gradient: 'linear-gradient(135deg,#0ea5e9,#ef4444)', group: 'classic' },
  { id: 'sketch', name: 'Matita', nameEn: 'Pencil sketch', icon: '✏️', gradient: 'linear-gradient(135deg,#f8fafc,#64748b)', group: 'mono' },
  { id: 'cyber', name: 'Cyberpunk', nameEn: 'Cyberpunk', icon: '👾', gradient: 'linear-gradient(135deg,#22d3ee,#a855f7)', group: 'digital' },
  { id: 'watercolor', name: 'Acquerello', nameEn: 'Watercolor', icon: '💧', gradient: 'linear-gradient(135deg,#bae6fd,#fbcfe8)', group: 'classic' }
];

export const GROUPS = [
  { id: 'base', label: 'Base', labelEn: 'Base' },
  { id: 'classic', label: 'Classici', labelEn: 'Classics' },
  { id: 'pop', label: 'Pop', labelEn: 'Pop' },
  { id: 'mono', label: 'Monocromo', labelEn: 'Monochrome' },
  { id: 'digital', label: 'Digitale', labelEn: 'Digital' }
];

export function findStyle(id) {
  return STYLES.find((style) => style.id === id) || STYLES[0];
}

export function stylesByGroup(groupId) {
  return STYLES.filter((style) => style.group === groupId);
}

export function styleLabel(id, english = false) {
  const style = findStyle(id);
  return english ? style.nameEn : style.name;
}

export function isValidStyle(id) {
  return STYLES.some((style) => style.id === id);
}
