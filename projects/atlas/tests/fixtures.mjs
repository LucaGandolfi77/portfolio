/**
 * Fixture deterministiche per test Node e Playwright di Atlas.
 */

export function weatherFixture(overrides = {}) {
  const days = 7;
  const hours = 24;
  const dailyTime = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(2026, 10, 20 + index));
    return date.toISOString().slice(0, 10);
  });
  const hourlyTime = Array.from({ length: hours }, (_, index) => {
    return `2026-11-20T${String(index).padStart(2, '0')}:00`;
  });

  return {
    latitude: 45.4642,
    longitude: 9.19,
    timezone: 'Europe/Rome',
    current: {
      time: '2026-11-20T14:30',
      temperature_2m: 12.4,
      relative_humidity_2m: 68,
      apparent_temperature: 10.8,
      is_day: 1,
      precipitation: 0.2,
      weather_code: 2,
      wind_speed_10m: 8.5
    },
    current_units: {
      temperature_2m: '°C',
      apparent_temperature: '°C',
      relative_humidity_2m: '%',
      precipitation: 'mm',
      wind_speed_10m: 'km/h'
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: hourlyTime.map((_, index) => 8 + (index % 8)),
      weather_code: hourlyTime.map((_, index) => (index % 3 === 0 ? 2 : index % 5 === 0 ? 61 : 0)),
      precipitation_probability: hourlyTime.map((_, index) => (index % 4 === 0 ? 20 : 5))
    },
    daily: {
      time: dailyTime,
      weather_code: dailyTime.map((_, index) => [2, 61, 0, 3, 71, 95, 1][index]),
      temperature_2m_max: dailyTime.map((_, index) => 15 + index),
      temperature_2m_min: dailyTime.map((_, index) => 7 + index),
      precipitation_probability_max: dailyTime.map((_, index) => 10 + index * 5),
      sunrise: dailyTime.map((date) => `${date}T07:2${0}`),
      sunset: dailyTime.map((date) => `${date}T17:0${0}`)
    },
    ...overrides
  };
}

export const SEARCH_FIXTURE = [
  {
    place_id: 1,
    lat: '45.4642',
    lon: '9.1900',
    name: 'Milano',
    display_name: 'Milano, Lombardia, Italia',
    type: 'city',
    address: {
      city: 'Milano',
      state: 'Lombardia',
      country: 'Italia',
      country_code: 'it'
    }
  },
  {
    place_id: 2,
    lat: '48.8566',
    lon: '2.3522',
    name: 'Paris',
    display_name: 'Paris, Île-de-France, France',
    type: 'city',
    address: {
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      country_code: 'fr'
    }
  }
];

export const REVERSE_FIXTURE = {
  place_id: 3,
  lat: '45.4642',
  lon: '9.1900',
  name: 'Milano',
  display_name: 'Milano, Lombardia, Italia',
  address: {
    city: 'Milano',
    state: 'Lombardia',
    country: 'Italia',
    country_code: 'it'
  }
};
