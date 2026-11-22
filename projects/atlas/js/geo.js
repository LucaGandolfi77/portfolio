/**
 * geo.js — calcoli geografici, unità e normalizzazione dei dati meteo.
 * Nessuna dipendenza dal DOM: tutto testabile in Node.
 */

export const EARTH_RADIUS_KM = 6371.0088;
export const MILES_PER_KM = 0.621371;
export const WEATHER_CACHE_TTL = 45 * 60 * 1000;

const WEATHER_CODES = {
  0: { key: 'clear', group: 'clear' },
  1: { key: 'mainlyClear', group: 'clear' },
  2: { key: 'partly', group: 'clouds' },
  3: { key: 'overcast', group: 'clouds' },
  45: { key: 'fog', group: 'fog' },
  48: { key: 'rimeFog', group: 'fog' },
  51: { key: 'drizzle', group: 'rain' },
  53: { key: 'drizzle', group: 'rain' },
  55: { key: 'drizzle', group: 'rain' },
  56: { key: 'freezingDrizzle', group: 'rain' },
  57: { key: 'freezingDrizzle', group: 'rain' },
  61: { key: 'rain', group: 'rain' },
  63: { key: 'rain', group: 'rain' },
  65: { key: 'rain', group: 'rain' },
  66: { key: 'freezingRain', group: 'rain' },
  67: { key: 'freezingRain', group: 'rain' },
  71: { key: 'snow', group: 'snow' },
  73: { key: 'snow', group: 'snow' },
  75: { key: 'snow', group: 'snow' },
  77: { key: 'snowGrains', group: 'snow' },
  80: { key: 'showers', group: 'rain' },
  81: { key: 'showers', group: 'rain' },
  82: { key: 'showers', group: 'rain' },
  85: { key: 'snowShowers', group: 'snow' },
  86: { key: 'snowShowers', group: 'snow' },
  95: { key: 'storm', group: 'storm' },
  96: { key: 'stormHail', group: 'storm' },
  99: { key: 'stormHail', group: 'storm' }
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

export function normalizeLatLng(lat, lng) {
  const rawLat = String(lat ?? '').trim();
  const rawLng = String(lng ?? '').trim();
  if (!rawLat || !rawLng) return null;
  const latitude = Number(rawLat.replace(',', '.'));
  const longitude = Number(rawLng.replace(',', '.'));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { lat: round(latitude, 6), lng: round(longitude, 6) };
}

export function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

export function toDegrees(radians) {
  return (Number(radians) * 180) / Math.PI;
}

/** Distanza great-circle in km (formula haversine). */
export function distanceKm(a, b) {
  const first = normalizeLatLng(a && a.lat, a && a.lng);
  const second = normalizeLatLng(b && b.lat, b && b.lng);
  if (!first || !second) return 0;
  const dLat = toRadians(second.lat - first.lat);
  const dLng = toRadians(second.lng - first.lng);
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Direzione iniziale in gradi (0 = nord, 90 = est). */
export function bearingDeg(a, b) {
  const first = normalizeLatLng(a && a.lat, a && a.lng);
  const second = normalizeLatLng(b && b.lat, b && b.lng);
  if (!first || !second) return 0;
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const dLng = toRadians(second.lng - first.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function midpoint(a, b) {
  const first = normalizeLatLng(a && a.lat, a && a.lng);
  const second = normalizeLatLng(b && b.lat, b && b.lng);
  if (!first || !second) return null;
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const dLng = toRadians(second.lng - first.lng);
  const bx = Math.cos(lat2) * Math.cos(dLng);
  const by = Math.cos(lat2) * Math.sin(dLng);
  const lat = toDegrees(Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) ** 2 + by ** 2)));
  const lng = first.lng + toDegrees(Math.atan2(by, Math.cos(lat1) + bx));
  return { lat: round(lat, 6), lng: round(((lng + 540) % 360) - 180, 6) };
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function compassPoint(bearing) {
  const value = ((Number(bearing) % 360) + 360) % 360;
  return COMPASS[Math.round(value / 45) % 8];
}

export function formatDistance(km, units = 'metric') {
  const metric = Number(km) || 0;
  const value = units === 'imperial' ? metric * MILES_PER_KM : metric;
  const digits = value < 10 ? 2 : value < 100 ? 1 : 0;
  return {
    value: value.toFixed(digits),
    unit: units === 'imperial' ? 'mi' : 'km',
    numeric: value
  };
}

export function formatCoord(value, digits = 4) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : '';
}

export function weatherInfo(code, isDay = true) {
  const numericCode = code === null || code === undefined || code === '' ? NaN : Number(code);
  const info = WEATHER_CODES[numericCode] || { key: 'unknown', group: 'clouds' };
  return { ...info, isDay: Boolean(isDay), icon: weatherIcon(info.key, isDay) };
}

export function weatherIcon(key, isDay = true) {
  switch (key) {
    case 'clear':
    case 'mainlyClear':
      return isDay ? 'sun' : 'moon';
    case 'partly':
      return isDay ? 'cloud-sun' : 'cloud-moon';
    case 'overcast':
      return 'cloud';
    case 'fog':
    case 'rimeFog':
      return 'fog';
    case 'drizzle':
    case 'freezingDrizzle':
      return 'drizzle';
    case 'rain':
    case 'freezingRain':
    case 'showers':
      return 'rain';
    case 'snow':
    case 'snowGrains':
    case 'snowShowers':
      return 'snow';
    case 'storm':
    case 'stormHail':
      return 'storm';
    default:
      return 'cloud';
  }
}

export function temperatureFromCelsius(value, units = 'metric') {
  if (value === null || value === undefined || value === '') return null;
  const celsius = Number(value);
  if (!Number.isFinite(celsius)) return null;
  return units === 'imperial' ? (celsius * 9) / 5 + 32 : celsius;
}

export function windFromKmh(value, units = 'metric') {
  if (value === null || value === undefined || value === '') return null;
  const kmh = Number(value);
  if (!Number.isFinite(kmh)) return null;
  return units === 'imperial' ? kmh * MILES_PER_KM : kmh;
}

export function precipitationFromMm(value, units = 'metric') {
  if (value === null || value === undefined || value === '') return null;
  const mm = Number(value);
  if (!Number.isFinite(mm)) return null;
  return units === 'imperial' ? mm / 25.4 : mm;
}

export function formatTemperature(valueCelsius, units = 'metric', digits = 0) {
  const value = temperatureFromCelsius(valueCelsius, units);
  if (value === null) return '—';
  return `${value.toFixed(digits)}°${units === 'imperial' ? 'F' : 'C'}`;
}

export function formatWind(valueKmh, units = 'metric') {
  const value = windFromKmh(valueKmh, units);
  if (value === null) return '—';
  return `${Math.round(value)} ${units === 'imperial' ? 'mph' : 'km/h'}`;
}

export function formatPrecipitation(valueMm, units = 'metric') {
  const value = precipitationFromMm(valueMm, units);
  if (value === null) return '—';
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units === 'imperial' ? 'in' : 'mm'}`;
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Converte la risposta Open-Meteo in una struttura stabile e serializzabile.
 * Lancia se manca il blocco `current`.
 */
export function normalizeWeather(payload) {
  if (!payload || typeof payload !== 'object' || !payload.current) {
    throw new Error('Risposta meteo non valida');
  }
  const current = payload.current;
  const temperature = numeric(current.temperature_2m);
  if (temperature === null) throw new Error('Temperatura assente');

  const daily = payload.daily || {};
  const hourly = payload.hourly || {};

  const dailyItems = Array.isArray(daily.time)
    ? daily.time.map((date, index) => ({
        date: String(date),
        code: numeric(daily.weather_code ? daily.weather_code[index] : null),
        max: numeric(daily.temperature_2m_max ? daily.temperature_2m_max[index] : null),
        min: numeric(daily.temperature_2m_min ? daily.temperature_2m_min[index] : null),
        precipProbability: numeric(
          daily.precipitation_probability_max ? daily.precipitation_probability_max[index] : null
        ),
        sunrise: daily.sunrise ? String(daily.sunrise[index] || '') : '',
        sunset: daily.sunset ? String(daily.sunset[index] || '') : ''
      }))
    : [];

  const hourlyItems = Array.isArray(hourly.time)
    ? hourly.time.map((time, index) => ({
        time: String(time),
        temp: numeric(hourly.temperature_2m ? hourly.temperature_2m[index] : null),
        code: numeric(hourly.weather_code ? hourly.weather_code[index] : null),
        precipProbability: numeric(
          hourly.precipitation_probability ? hourly.precipitation_probability[index] : null
        )
      }))
    : [];

  return {
    timezone: typeof payload.timezone === 'string' ? payload.timezone : 'UTC',
    current: {
      time: String(current.time || ''),
      temp: temperature,
      feels: numeric(current.apparent_temperature) ?? temperature,
      humidity: numeric(current.relative_humidity_2m),
      precip: numeric(current.precipitation),
      code: numeric(current.weather_code),
      wind: numeric(current.wind_speed_10m),
      isDay: Number(current.is_day) !== 0
    },
    daily: dailyItems,
    hourly: hourlyItems
  };
}

/** Le prossime `count` ore a partire dal timestamp corrente (stringhe ISO). */
export function nextHours(hourly, currentTime, count = 12) {
  const list = Array.isArray(hourly) ? hourly : [];
  if (!list.length) return [];
  const from = String(currentTime || '');
  let start = from ? list.findIndex((item) => item.time >= from) : 0;
  if (start < 0) start = 0;
  return list.slice(start, start + count);
}

function placeFromAddress(item) {
  const address = item && typeof item.address === 'object' ? item.address : {};
  const name =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    address.county ||
    address.state ||
    item.name ||
    String(item.display_name || '').split(',')[0] ||
    '';
  const country = address.country || '';
  const countryCode = address.country_code ? String(address.country_code).toUpperCase() : '';
  const detail = [address.state && address.state !== name ? address.state : '', country]
    .filter(Boolean)
    .join(' · ');
  return { name: String(name).trim(), detail, country, countryCode };
}

/** Normalizza i risultati Nominatim in voci stabili per la UI. */
export function normalizeSearchResults(json, limit = 6) {
  if (!Array.isArray(json)) return [];
  const out = [];
  const seen = new Set();
  for (const item of json) {
    const coords = normalizeLatLng(item && item.lat, item && item.lon);
    if (!coords) continue;
    const key = `${round(coords.lat, 3)},${round(coords.lng, 3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const place = placeFromAddress(item);
    if (!place.name) continue;
    out.push({
      id: key,
      ...place,
      lat: coords.lat,
      lng: coords.lng,
      type: String((item && item.type) || 'place')
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function reversePlaceName(json) {
  if (!json || typeof json !== 'object') return null;
  const place = placeFromAddress(json);
  return place.name ? place : null;
}

export function cacheKey(lat, lng) {
  const coords = normalizeLatLng(lat, lng);
  if (!coords) return '';
  return `${round(coords.lat, 3)},${round(coords.lng, 3)}`;
}

export function distanceSummary(a, b, units = 'metric') {
  if (!a || !b) return { distance: formatDistance(0, units), bearing: 0, compass: 'N', midpoint: null };
  const km = distanceKm(a, b);
  const bearing = bearingDeg(a, b);
  return {
    distance: formatDistance(km, units),
    bearing,
    compass: compassPoint(bearing),
    midpoint: midpoint(a, b)
  };
}
