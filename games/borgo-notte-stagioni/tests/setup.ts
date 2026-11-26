import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setFidenza, type FidenzaData } from '../src/data/fidenza';

/* In the browser the map is fetched; in the tests it is read from disk. */
const file = fileURLToPath(new URL('../public/data/fidenza.json', import.meta.url));
setFidenza(JSON.parse(readFileSync(file, 'utf8')) as FidenzaData);
