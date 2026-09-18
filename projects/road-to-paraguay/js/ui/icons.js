/**
 * icons.js — piccole icone SVG in linea.
 *
 * Stessi simboli che prima arrivavano da una libreria React, ma scritti a mano:
 * l'app non ha dipendenze e resta un singolo insieme di file statici.
 */
const wrap = (body, size = 12) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  lock: (size) => wrap('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', size),
  star: (size) => wrap('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" stroke-width="2.4"/>', size),
  sparkles: (size) => wrap('<path d="M12 4l1.7 3.8L17.5 9.5l-3.8 1.7L12 15l-1.7-3.8L6.5 9.5l3.8-1.7z"/><path d="M18.5 15.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/>', size),
  feather: (size) => wrap('<path d="M20.2 3.8a5.5 5.5 0 0 0-7.8 0L4 12.2V20h7.8l8.4-8.4a5.5 5.5 0 0 0 0-7.8z"/><path d="M16 8 4.5 19.5M14 10H9"/>', size),
  heart: (size) => wrap('<path d="M12 20.3S3.8 15.2 3.8 9.4a4.4 4.4 0 0 1 8.2-2.1 4.4 4.4 0 0 1 8.2 2.1c0 5.8-8.2 10.9-8.2 10.9z"/>', size),
  smile: (size) => wrap('<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>', size),
  check: (size) => wrap('<path d="M20 6 9 17l-5-5" stroke-width="3"/>', size),
  music: (size) => wrap('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', size),
  calendarHeart: (size) => wrap('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14.5c-.9-1.2-2.6-1-2.6.5 0 1.1 1.4 2 2.6 2.9 1.2-.9 2.6-1.8 2.6-2.9 0-1.5-1.7-1.7-2.6-.5z"/>', size),
  heartSmall: (size) => wrap('<path d="M12 20.3S3.8 15.2 3.8 9.4a4.4 4.4 0 0 1 8.2-2.1 4.4 4.4 0 0 1 8.2 2.1c0 5.8-8.2 10.9-8.2 10.9z"/>', size),
  sparkle: (size) => wrap('<path d="M12 3l2.2 5.3L19.5 10l-5.3 2.2L12 17l-2.2-4.8L4.5 10l5.3-1.7z"/>', size),
  close: (size) => wrap('<path d="M18 6 6 18M6 6l12 12"/>', size),
  rotate: (size) => wrap('<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>', size),
  party: (size = 26) => wrap('<path d="M3.5 20.5 9 9l6 6-11.5 5.5z"/><path d="M14 4.5c2 0 3.5 1.5 3.5 3.5M17 2c3 0 5 2 5 5M13 8.5 8.5 4"/>', size),
  trophy: () => wrap('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H5.5a2.5 2.5 0 0 0 2.5 5M16 5h2.5a2.5 2.5 0 0 1-2.5 5M10 17h4M12 13v4M9 21h6"/>', 30),
};
