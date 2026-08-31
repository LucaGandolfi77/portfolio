/**
 * Sunset Compass — Sun Position Calculator
 * NOAA Solar Calculator algorithm
 * https://gml.noaa.gov/grad/solcalc/
 */
window.SunCalc = (function() {
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

  function toJulianCentury(jd) {
    return (jd - 2451545.0) / 36525.0;
  }

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
    const M = geomMeanAnomalySun(tc);
    const Mrad = M * RAD;
    return Math.sin(Mrad) * (1.914602 - tc * (0.004817 + tc * 0.000014))
         + Math.sin(2 * Mrad) * (0.019993 - tc * 0.000101)
         + Math.sin(3 * Mrad) * 0.000289;
  }

  function sunTrueLong(tc) {
    return geomMeanLongSun(tc) + sunEqOfCenter(tc);
  }

  function sunTrueAnomaly(tc) {
    return geomMeanAnomalySun(tc) + sunEqOfCenter(tc);
  }

  function sunRadVector(tc) {
    const v = sunTrueAnomaly(tc);
    const e = eccentricityEarthOrbit(tc);
    const vrad = v * RAD;
    return (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(vrad));
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
    return meanObliquityOfEcliptic(tc) + 0.00256 * Math.cos(125.04 - 1934.136 * tc * RAD);
  }

  function sunRightAscension(tc) {
    const e = obliquityCorrection(tc);
    const L = sunApparentLong(tc) * RAD;
    const tananum = Math.cos(e) * Math.sin(L);
    const tanadenom = Math.cos(L);
    return Math.atan2(tananum, tanadenom) * DEG;
  }

  function sunDeclination(tc) {
    const e = obliquityCorrection(tc);
    const L = sunApparentLong(tc) * RAD;
    return Math.asin(Math.sin(e) * Math.sin(L)) * DEG;
  }

  function equationOfTime(tc) {
    const epsilon = obliquityCorrection(tc);
    const l0 = geomMeanLongSun(tc);
    const e = eccentricityEarthOrbit(tc);
    const m = geomMeanAnomalySun(tc);

    let y = Math.tan(epsilon * RAD / 2.0);
    y *= y;

    const sin2l0 = Math.sin(2.0 * l0 * RAD);
    const sinm   = Math.sin(m * RAD);
    const cos2l0 = Math.cos(2.0 * l0 * RAD);
    const sin4l0 = Math.sin(4.0 * l0 * RAD);
    const sin2m  = Math.sin(2.0 * m * RAD);

    const Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0
                - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
    return Etime * 4.0 * DEG;
  }

  function hourAngleSunrise(lat, declination) {
    const latRad = lat * RAD;
    const declRad = declination * RAD;
    const cosHA = (Math.cos(90.833 * RAD) / (Math.cos(latRad) * Math.cos(declRad)))
                - Math.tan(latRad) * Math.tan(declRad);
    if (cosHA > 1) return 0;   // never rises
    if (cosHA < -1) return 180; // never sets
    return Math.acos(cosHA) * DEG;
  }

  function calcSunPosition(lat, lon, date) {
    const jd = toJulianDay(date);
    const tc = toJulianCentury(jd);
    const eqTime = equationOfTime(tc);
    const decl = sunDeclination(tc);
    const ha = hourAngleSunrise(lat, decl);

    // Solar noon
    const solarNoonDec = decl;
    const solarNoonEqT = eqTime;
    const solarNoonUTC = (720 - 4 * lon - solarNoonEqT) / 1440 * 1440;

    // Sunrise/sunset
    const sunriseUTC = solarNoonUTC - ha * 4;
    const sunsetUTC  = solarNoonUTC + ha * 4;

    // Golden hour (30 min before sunset, after sunrise)
    const goldenSunriseUTC = solarNoonUTC - (ha + 7.5) * 4;
    const goldenSunsetUTC  = solarNoonUTC + (ha + 7.5) * 4;

    // Blue hour (20 min before sunrise, after sunset)
    const blueSunriseUTC = solarNoonUTC - (ha + 10) * 4;
    const blueSunsetUTC  = solarNoonUTC + (ha + 10) * 4;

    return {
      declination: decl,
      equationOfTime: eqTime,
      solarNoonUTC,
      sunriseUTC,
      sunsetUTC,
      goldenHourRiseUTC: goldenSunriseUTC,
      goldenHourSetUTC: goldenSunsetUTC,
      blueHourRiseUTC: blueSunriseUTC,
      blueHourSetUTC: blueSunsetUTC
    };
  }

  function calcSunAzAlt(lat, lon, date) {
    const jd = toJulianDay(date);
    const tc = toJulianCentury(jd);

    const eqTime = equationOfTime(tc);
    const decl = sunDeclination(tc);

    // Solar time
    const timeUTC = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const solarTimeFix = eqTime + 4 * lon;
    const trueSolarTime = timeUTC * 60 + solarTimeFix;
    const hourAngle = (trueSolarTime / 4) - 180;

    // Zenith angle
    const latRad = lat * RAD;
    const declRad = decl * RAD;
    const haRad = hourAngle * RAD;

    const csz = Math.sin(latRad) * Math.sin(declRad)
              + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
    const zenith = Math.acos(Math.min(1, Math.max(-1, csz))) * DEG;

    const altitude = 90 - zenith;

    // Azimuth
    const sinAz = -Math.cos(declRad) * Math.sin(haRad) / Math.cos(latRad * RAD);
    const cosAz = (Math.sin(declRad) - Math.sin(latRad) * Math.cos(zenith * RAD))
                / (Math.sin(zenith * RAD) * Math.cos(latRad));
    let azimuth = Math.atan2(sinAz, cosAz) * DEG + 180;
    if (azimuth >= 360) azimuth -= 360;

    return { azimuth, altitude, zenith };
  }

  function getSunTimes(lat, lon, date) {
    const times = calcSunPosition(lat, lon, date);
    const tzOffset = -date.getTimezoneOffset() / 60;

    function utcToTime(utcMin) {
      const h = Math.floor(utcMin / 60);
      const m = Math.floor(utcMin % 60);
      const localH = (h + tzOffset + 24) % 24;
      return { hours: localH, minutes: m, string: `${String(localH).padStart(2,'0')}:${String(m).padStart(2,'0')}` };
    }

    return {
      sunrise: utcToTime(times.sunriseUTC),
      sunset: utcToTime(times.sunsetUTC),
      goldenRise: utcToTime(times.goldenHourRiseUTC),
      goldenSet: utcToTime(times.goldenHourSetUTC),
      blueRise: utcToTime(times.blueHourRiseUTC),
      blueSet: utcToTime(times.blueHourSetUTC),
      declination: times.declination,
      equationOfTime: times.equationOfTime
    };
  }

  function getSunAtTime(lat, lon, date, hoursUTC) {
    const d = new Date(date);
    d.setUTCHours(Math.floor(hoursUTC), Math.floor((hoursUTC % 1) * 60), 0, 0);
    return calcSunAzAlt(lat, lon, d);
  }

  return {
    calcSunPosition,
    calcSunAzAlt,
    getSunTimes,
    getSunAtTime,
    DEG,
    RAD
  };
})();
