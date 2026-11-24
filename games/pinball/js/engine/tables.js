/* Table catalogue helpers */
import { TABLES } from '../config.js';
export { TABLES };
export const count = () => TABLES.length;
export const featuresOf = table => table.features || [];
export const paletteOf = table => table.palette;
