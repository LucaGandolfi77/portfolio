import type { WorldBounds } from './types';

export interface FidenzaMeta {
  id: string;
  name: string;
  source: string;
  attribution: string;
  license: string;
  generated: string;
  origin: { lat: number; lon: number };
  bounds: WorldBounds;
  view: WorldBounds;
  counts: {
    buildings: number;
    roads: number;
    areas: number;
    trees: number;
    furniture: number;
    places: number;
    railways: number;
    waterways?: number;
  };
  /** Measured heights (DBTR Regione Emilia-Romagna), see scripts/dbtr-heights.mjs. */
  heights?: {
    source: string;
    attribution: string;
    license: string;
    measured: number;
    inferred: number;
  };
}

export interface FidenzaBuilding {
  id: string;
  kind: string;
  name: string;
  x: number;
  z: number;
  h: number;
  area: number;
  landmark: string | null;
  /** Flat [x,z,x,z,…] ring, local metres. */
  poly: number[];
  /** Roof colour sampled from the AGEA 2023 orthophoto (0xRRGGBB). */
  roof?: number;
}

export interface FidenzaRoad {
  id: string;
  kind: string;
  name: string;
  w: number;
  /** Flat [x,z,x,z,…] polyline. */
  pts: number[];
  /** Width from OpenStreetMap before the DBTR measurement (scripts/street-widths.mjs). */
  wOsm?: number;
}

export interface FidenzaArea {
  id: string;
  kind: string;
  name: string;
  color: number;
  /** Flat [x,z,x,z,…] ring. */
  poly: number[];
}

export interface FidenzaTree {
  x: number;
  z: number;
  h: number;
  leaf: string;
  /** 'osm' (natural=tree), 'osm-row' (natural=tree_row), 'ortho' (canopy in the AGEA 2023 orthophoto). */
  source?: 'osm' | 'osm-row' | 'ortho';
}

export interface FidenzaFurniture {
  type: string;
  x: number;
  z: number;
}

export interface FidenzaWaterway {
  id: string;
  kind: string;
  name: string;
  w: number;
  /** Flat [x,z,x,z,…] polyline. */
  pts: number[];
}

export interface FidenzaRailway {
  id: string;
  name: string;
  /** Flat [x,z,x,z,…] polyline. */
  pts: number[];
}

export interface FidenzaPlace {
  id: string;
  name: string;
  category: string;
  x: number;
  z: number;
  radius: number;
}

export interface FidenzaData {
  meta: FidenzaMeta;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  buildings: FidenzaBuilding[];
  roads: FidenzaRoad[];
  areas: FidenzaArea[];
  waterways: FidenzaWaterway[];
  railways: FidenzaRailway[];
  trees: FidenzaTree[];
  furniture: FidenzaFurniture[];
  places: FidenzaPlace[];
}

/*
 * The map data (~1 MB) is not bundled: it is fetched at start-up from
 * ./data/fidenza.json (cached offline by the service worker). Modules read
 * these live bindings when they build, after loadFidenza() has resolved.
 */
export let FIDENZA = null as unknown as FidenzaData;
export let FIDENZA_WORLD = null as unknown as WorldBounds;
export let FIDENZA_VIEW = null as unknown as WorldBounds;

export function setFidenza(data: FidenzaData): void {
  FIDENZA = data;
  FIDENZA_WORLD = data.meta.bounds;
  FIDENZA_VIEW = data.meta.view;
}

/** Downloads the map, reporting progress (0..1) when the size is known. */
export async function loadFidenza(url: string, progress?: (value: number) => void): Promise<FidenzaData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`map data ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  let text: string;
  if (res.body && total && progress) {
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
      progress(Math.min(1, got / total));
    }
    const all = new Uint8Array(got);
    let o = 0;
    for (const c of chunks) {
      all.set(c, o);
      o += c.length;
    }
    text = new TextDecoder().decode(all);
  } else {
    text = await res.text();
  }
  const data = JSON.parse(text) as FidenzaData;
  setFidenza(data);
  return data;
}
