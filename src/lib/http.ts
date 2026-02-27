import { currentWeatherResponseSchema } from '@/schemas/currentWeatherSchemas';
import { dailyForecastResponseSchema } from '@/schemas/dailyForecastSchemas';
import { dailyHistoryResponseSchema } from '@/schemas/dailyHistorySchemas';
import { weatherAlertsResponseSchema } from '../schemas/weatherAlertSchemas';
import type { CurrentWeatherRequestOptions } from './types';

export function getCurrentWeather(
  city: string,
  country: string,
  options?: CurrentWeatherRequestOptions,
) {
  const forceRefresh = options?.forceRefresh === true;
  const url = new URL('/api/weather/currentWeather', window.location.origin);

  if (forceRefresh) {
    url.searchParams.set('refresh', '1');
    url.searchParams.set('ts', String(Date.now()));
  }

  return fetch(url.pathname + url.search, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, country }),
    credentials: "include",
    cache: forceRefresh ? 'no-store' : 'default',
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json().then((data) => currentWeatherResponseSchema.parse(data));
  });
}

export function getWeatherAlerts(city: string, country: string) {
  return fetch('/api/weather/weatherAlerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, country }),
    credentials: "include",
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json().then((data) => weatherAlertsResponseSchema.parse(data));
  });
}

type DailyForecastRequestOptions = {
  forceRefresh?: boolean;
  days?: number;
};

export function getDailyForecast(
  city: string,
  country: string,
  options?: DailyForecastRequestOptions,
) {
  const forceRefresh = options?.forceRefresh === true;
  const url = new URL('/api/weather/dailyForecast', window.location.origin);

  if (typeof options?.days === 'number' && Number.isFinite(options.days)) {
    url.searchParams.set('days', String(options.days));
  }

  if (forceRefresh) {
    url.searchParams.set('refresh', '1');
    url.searchParams.set('ts', String(Date.now()));
  }

  return fetch(url.pathname + url.search, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, country }),
    credentials: 'include',
    cache: forceRefresh ? 'no-store' : 'default',
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json().then((data) => dailyForecastResponseSchema.parse(data));
  });
}

type DailyHistoryRequestOptions = {
  forceRefresh?: boolean;
};

export function getDailyHistory(
  city: string,
  country: string,
  options?: DailyHistoryRequestOptions,
) {
  const forceRefresh = options?.forceRefresh === true;
  const url = new URL('/api/weather/dailyHistory', window.location.origin);

  if (forceRefresh) {
    url.searchParams.set('refresh', '1');
    url.searchParams.set('ts', String(Date.now()));
  }

  return fetch(url.pathname + url.search, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, country }),
    credentials: 'include',
    cache: forceRefresh ? 'no-store' : 'default',
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json().then((data) => dailyHistoryResponseSchema.parse(data));
  });
}
