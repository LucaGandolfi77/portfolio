/**
 * Sunset Compass — NOAA solar calculator (ES module)
 * Based on https://gml.noaa.gov/grad/solcalc/ — algorithm unchanged.
 * Adds timestamp helpers so countdowns remain correct across midnight.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function toJulianDay(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
  let yr = y, mo = m;
  if (mo <= 2) { yr -= 1; mo += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

function toJulianCentury(jd) { return (jd - 2451545.0) / 36525.0; }

function geomMeanLongSun(tc) {
  let L0 = 280.46646 + tc * (36000.76983 + tc * 0.0003032);
  while (L0 > 360) L0 -= 360;
  while (L0 < 0) L0 += 360;
  return L0;
}

function geomMeanAnomalySun(tc) {
  return 357.52911 + tc * (35999.05029 - tc * 0.0001537);
}

function eccentricityEarthOrbit(tc) {
  return 0.016708634 - tc * (0.000042037 + tc * 0.0000001267);
}

function sunEqOfCenter(tc) {
  const M = geomMeanAnomalySun(tc) * RAD;
  return Math.sin(M) * (1.914602 - tc * (0.004817 + tc * 0.000014))
       + Math.sin(2 * M) * (0.019993 - tc * 0.000101)
       + Math.sin(3 * M) * 0.000289;
}

function sunTrueLong(tc) { return geomMeanLongSun(tc) + sunEqOfCenter(tc); }
function sunTrueAnomaly(tc) { return geomMeanAnomalySun(tc) + sunEqOfCenter(tc); }

function sunRadVector(tc) {
  const v = sunTrueAnomaly(tc) * RAD;
  const e = eccentricityEarthOrbit(tc);
  return (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(v));
}

function sunApparentLong(tc) {
  const o = sunTrueLong(tc);
  const omega = 125.04 - 1934.136 * tc;
  return o - 0.00569 - 0.00478 * Math.sin(omega * RAD);
}

function meanObliquityOfEcliptic(tc) {
  const seconds = 21.448 - tc * (46.8150 + tc * (0.00059 - tc * 0.001813));
  return 23.0 + (26.0 + seconds / 60.0) / 60.0;
}

function obliquityCorrection(tc) {
  return meanObliquityOfEcliptic(tc) + 0.00256 * Math.cos((125.04 - 1934.136 * tc) * RAD);
}

function sunRightAscension(tc) {
  const e = obliquityCorrection(tc) * RAD;
  const L = sunApparentLong(tc) * RAD;
  return Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) * DEG;
}

function sunDeclination(tc) {
  const e = obliquityCorrection(tc) * RAD;
  const L = sunApparentLong(tc) * RAD;
  return Math.asin(Math.sin(e) * Math.sin(L)) * DEG;
}

function equationOfTime(tc) {
  const epsilon = obliquityCorrection(tc) * RAD;
  const l0 = geomMeanLongSun(tc) * RAD;
  const e = eccentricityEarthOrbit(tc);
  const m = geomMeanAnomalySun(tc) * RAD;
  let y = Math.tan(epsilon / 2);
  y *= y;
  const Etime = y * Math.sin(2 * l0)
    - 2 * e * Math.sin(m)
    + 4 * e * y * Math.sin(m) * Math.cos(2 * l0)
    - 0.5 * y * y * Math.sin(4 * l0)
    - 1.25 * e * e * Math.sin(2 * m);
  return Etime * 4 * DEG;
}

function hourAngleSunrise(lat, declination) {
  const latRad = lat * RAD;
  const declRad = declination * RAD;
  const cosHA = (Math.cos(90.833 * RAD) / (Math.cos(latRad) * Math.cos(declRad)))
              - Math.tan(latRad) * Math.tan(declRad);
  if (cosHA > 1) return 0;
  if (cosHA < -1) return 180;
  return Math.acos(cosHA) * DEG;
}

export function calcSunPosition(lat, lon, date) {
  const tc = toJulianCentury(toJulianDay(date));
  const eqTime = equationOfTime(tc);
  const decl = sunDeclination(tc);
  const ha = hourAngleSunrise(lat, decl);
  const solarNoonUTC = 720 - 4 * lon - eqTime;
  const sunriseUTC = solarNoonUTC - ha * 4;
  const sunsetUTC = solarNoonUTC + ha * 4;
  return {
    declination: decl,
    equationOfTime: eqTime,
    solarNoonUTC,
    sunriseUTC,
    sunsetUTC,
    goldenHourRiseUTC: solarNoonUTC - (ha + 7.5) * 4,
    goldenHourSetUTC: solarNoonUTC + (ha + 7.5) * 4,
    blueHourRiseUTC: solarNoonUTC - (ha + 10) * 4,
    blueHourSetUTC: solarNoonUTC + (ha + 10) * 4
  };
}

export function calcSunAzAlt(lat, lon, date) {
  const tc = toJulianCentury(toJulianDay(date));
  const eqTime = equationOfTime(tc);
  const decl = sunDeclination(tc);
  const timeUTC = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const trueSolarTime = timeUTC * 60 + eqTime + 4 * lon;
  const hourAngle = trueSolarTime / 4 - 180;

  const latRad = lat * RAD;
  const declRad = decl * RAD;
  const haRad = hourAngle * RAD;
  const csz = Math.sin(latRad) * Math.sin(declRad)
            + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const zenith = Math.acos(Math.min(1, Math.max(-1, csz))) * DEG;
  const altitude = 90 - zenith;

  const sinAz = -Math.cos(declRad) * Math.sin(haRad) / Math.cos(latRad);
  const cosAz = (Math.sin(declRad) - Math.sin(latRad) * Math.cos(zenith * RAD))
              / (Math.sin(zenith * RAD) * Math.cos(latRad));
  // NOAA conventions: atan2 already yields north-clockwise azimuth.
  let azimuth = Math.atan2(sinAz, cosAz) * DEG;
  azimuth = ((azimuth % 360) + 360) % 360;
  return { azimuth, altitude, zenith };
}

function formatLocal(minutesUTC, date) {
  const tzOffset = -date.getTimezoneOffset() / 60;
  const h = Math.floor(minutesUTC / 60);
  const m = Math.floor(minutesUTC % 60);
  const localH = ((h + tzOffset) % 24 + 24) % 24;
  const string = `${String(localH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return { hours: localH, minutes: m, string };
}

export function getSunTimes(lat, lon, date) {
  const pos = calcSunPosition(lat, lon, date);
  return {
    sunrise: formatLocal(pos.sunriseUTC, date),
    sunset: formatLocal(pos.sunsetUTC, date),
    goldenRise: formatLocal(pos.goldenHourRiseUTC, date),
    goldenSet: formatLocal(pos.goldenHourSetUTC, date),
    blueRise: formatLocal(pos.blueHourRiseUTC, date),
    blueSet: formatLocal(pos.blueHourSetUTC, date),
    declination: pos.declination,
    equationOfTime: pos.equationOfTime
  };
}

export function getSunAtTime(lat, lon, date, hoursUTC) {
  const d = new Date(date);
  d.setUTCHours(Math.floor(hoursUTC), Math.floor((hoursUTC % 1) * 60), 0, 0);
  return calcSunAzAlt(lat, lon, d);
}

/* Convert NOAA UTC-minutes into a real timestamp for a given local day. */
function eventDate(date, minutesUTC) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCMinutes(Math.round(minutesUTC));
  return d.getTime();
}

/** All solar events as timestamps for today and tomorrow. */
export function getEventDates(lat, lon, date) {
  const today = calcSunPosition(lat, lon, date);
  const tomorrowDate = new Date(date.getTime() + 86400000);
  const tomorrow = calcSunPosition(lat, lon, tomorrowDate);
  const keys = [
    ['sunrise', 'sunriseUTC'], ['sunset', 'sunsetUTC'],
    ['goldenRise', 'goldenHourRiseUTC'], ['goldenSet', 'goldenHourSetUTC'],
    ['blueRise', 'blueHourRiseUTC'], ['blueSet', 'blueHourSetUTC']
  ];
  const out = { today: {}, tomorrow: {}, all: [] };
  for (const [name, field] of keys) {
    out.today[name] = eventDate(date, today[field]);
    out.tomorrow[name] = eventDate(tomorrowDate, tomorrow[field]);
    out.all.push({ name, time: out.today[name] }, { name, time: out.tomorrow[name] });
  }
  out.all.sort((a, b) => a.time - b.time);
  return out;
}

/** Next event of a given name after `now`. */
export function nextEvent(events, name, now = Date.now()) {
  return events.all.find(e => e.name === name && e.time > now) || null;
}

/** Day / golden / blue / night from the current solar altitude. */
export function phaseOf(altitude) {
  if (altitude > 15) return 'day';
  if (altitude > 0) return 'golden';
  if (altitude > -6) return 'blue';
  return 'night';
}

export { RAD, DEG };
