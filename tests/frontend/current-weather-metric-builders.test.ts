import type { CurrentWeatherResponse } from '@/schemas/currentWeatherSchemas';
import type { DailyForecastResponse } from '@/schemas/dailyForecastSchemas';
import type { DailyHistoryResponse } from '@/schemas/dailyHistorySchemas';
import {
  buildActiveSnapshotView,
  buildCurrentMetrics,
  buildForecastMetrics,
  buildHistoryMetrics,
} from '../../src/components/custom/current-weather/metric-builders';

const currentWeather: CurrentWeatherResponse = {
  data: [
    {
      wind_cdir: 'NE',
      rh: 59,
      pod: 'd',
      lon: -78.63861,
      pres: 1006.6,
      timezone: 'America/New_York',
      ob_time: '2017-08-28 16:45',
      country_code: 'US',
      clouds: 75,
      vis: 10,
      wind_spd: 6.17,
      gust: 8,
      wind_cdir_full: 'northeast',
      app_temp: 24.25,
      state_code: 'NC',
      ts: 1503936000,
      h_angle: 0,
      dewpt: 15.65,
      weather: {
        icon: 'c03d',
        code: 803,
        description: 'Broken clouds',
      },
      uv: 2,
      aqi: 45,
      station: 'CMVN7',
      sources: ['rtma', 'CMVN7'],
      wind_dir: 50,
      elev_angle: 63,
      datetime: '2017-08-28:17',
      precip: 0,
      ghi: 444.4,
      dni: 500,
      dhi: 120,
      solar_rad: 350,
      city_name: 'Raleigh',
      sunrise: '10:44',
      sunset: '23:47',
      temp: 24.19,
      lat: 35.7721,
      slp: 1022.2,
    },
  ],
  minutely: [],
  count: 1,
};

const dailyForecast: DailyForecastResponse = {
  city_name: 'Seattle',
  country_code: 'US',
  lat: 47.6061,
  lon: -122.3328,
  state_code: 'WA',
  timezone: 'America/Los_Angeles',
  data: [
    {
      app_max_temp: 21.9,
      app_min_temp: 15,
      clouds: 57,
      clouds_hi: 29,
      clouds_low: 53,
      clouds_mid: 33,
      datetime: '2025-09-12',
      dewpt: 14.3,
      high_temp: 22.4,
      low_temp: 13.9,
      max_dhi: null,
      max_temp: 22.4,
      min_temp: 14.7,
      moon_phase: 0.56,
      moon_phase_lunation: 0.7,
      moonrise_ts: 1757736159,
      moonset_ts: 1757713575,
      ozone: 280,
      pop: 0,
      precip: 0,
      pres: 1012,
      rh: 80,
      slp: 1016,
      snow: 0,
      snow_depth: 0,
      sunrise_ts: 1757684620,
      sunset_ts: 1757730455,
      temp: 17.8,
      ts: 1757660460,
      uv: 5,
      valid_date: '2025-09-12',
      vis: 17,
      weather: {
        code: 803,
        description: 'Broken clouds',
        icon: 'c03d',
      },
      wind_cdir: 'SW',
      wind_cdir_full: 'southwest',
      wind_dir: 228,
      wind_gust_spd: 1.9,
      wind_spd: 1.1,
    },
  ],
};

const dailyHistory: DailyHistoryResponse = {
  timezone: 'America/New_York',
  state_code: 'NC',
  lat: 35.7721,
  lon: -78.63861,
  country_code: 'US',
  station_id: '723060-13722',
  sources: ['723060-13722'],
  city_name: 'Raleigh',
  city_id: '4487042',
  data: [
    {
      rh: 70.2,
      wind_spd: 3.8,
      slp: 1022,
      max_wind_spd: 6.7,
      max_wind_dir: 220,
      max_wind_spd_ts: 1483232400,
      wind_gust_spd: 12.7,
      min_temp_ts: 1483272000,
      max_temp_ts: 1483308000,
      dewpt: 1.8,
      snow: 0,
      snow_depth: 1,
      precip: 10.5,
      precip_gpm: 13.5,
      wind_dir: 189,
      max_dhi: 736.3,
      dhi: 88,
      max_temp: 10,
      pres: 1006.4,
      max_uv: 5,
      t_dhi: 2023.6,
      datetime: '2026-02-20',
      temp: 7.86,
      min_temp: 5,
      clouds: 43,
      ts: 1483228800,
      revision_status: 'final',
      revision_version: '1.0',
    },
  ],
};

describe('current weather metric builders', () => {
  it('maps current weather into metric cards', () => {
    const metrics = buildCurrentMetrics(currentWeather.data[0]);
    expect(metrics).toHaveLength(9);
    expect(metrics[0]?.label).toBe('Temperature');
    expect(metrics[2]?.subtext).toContain('Gust');
  });

  it('maps forecast day into forecast metrics', () => {
    const metrics = buildForecastMetrics(dailyForecast.data[0]);
    expect(metrics).toHaveLength(12);
    expect(metrics[2]?.value).toBe('Broken clouds');
  });

  it('maps history day into history metrics', () => {
    const metrics = buildHistoryMetrics(dailyHistory.data[0]);
    expect(metrics).toHaveLength(9);
    expect(metrics[0]?.label).toBe('Average Temperature');
  });

  it('builds active view for forecast and history selections', () => {
    const forecastView = buildActiveSnapshotView({
      selection: { kind: 'forecast', day: dailyForecast.data[0] },
      location: { city: 'Seattle', country: 'US' },
      weather: currentWeather.data[0],
      dailyForecast,
      dailyHistory,
    });

    expect(forecastView.title).toContain('Forecast Snapshot');
    expect(forecastView.badge).toBe('Broken clouds');
    expect(forecastView.metrics.length).toBeGreaterThan(0);

    const historyView = buildActiveSnapshotView({
      selection: { kind: 'history', day: dailyHistory.data[0] },
      location: { city: 'Raleigh', country: 'US' },
      weather: currentWeather.data[0],
      dailyForecast,
      dailyHistory,
    });

    expect(historyView.title).toContain('History Snapshot');
    expect(historyView.badge).toBe('Historical');
    expect(historyView.metrics.length).toBeGreaterThan(0);
  });
});
