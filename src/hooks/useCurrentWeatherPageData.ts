import { useEffect, useState } from 'react';
import { getCurrentWeather, getDailyForecast, getDailyHistory } from '@/lib/http';
import type { CurrentWeatherResponse } from '@/schemas/currentWeatherSchemas';
import type { DailyForecastResponse } from '@/schemas/dailyForecastSchemas';
import type { DailyHistoryResponse } from '@/schemas/dailyHistorySchemas';
import type { CurrentWeatherPageCache } from '@/components/custom/current-weather/types';
import { currentWeatherPageCacheKey } from '@/components/custom/current-weather/utils';
import { toaster } from '@/components/ui/toaster';

type Args = {
  city: string;
  country: string;
};

export function useCurrentWeatherPageData({ city, country }: Args) {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherResponse | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastResponse | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailyHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWeatherData = (forceRefresh = false) => {
    const normalizedCity = city.trim();
    const normalizedCountry = country.trim().toUpperCase();
    if (!normalizedCity || !normalizedCountry) return Promise.resolve();

    setIsRefreshing(forceRefresh);
    if (!currentWeather) setError(null);
    if (!dailyForecast) setForecastError(null);
    if (!dailyHistory) setHistoryError(null);

    return Promise.allSettled([
      getCurrentWeather(normalizedCity, normalizedCountry, { forceRefresh }),
      getDailyForecast(normalizedCity, normalizedCountry, { forceRefresh, days: 3 }),
      getDailyHistory(normalizedCity, normalizedCountry, { forceRefresh }),
    ])
      .then(([currentResult, forecastResult, historyResult]) => {
        let nextCurrent: CurrentWeatherResponse | null = null;
        let nextForecast: DailyForecastResponse | null = null;
        let nextHistory: DailyHistoryResponse | null = null;

        if (currentResult.status === 'fulfilled') {
          nextCurrent = currentResult.value;
          setCurrentWeather(currentResult.value);
          setError(null);
        } else {
          setError(
            currentResult.reason instanceof Error
              ? currentResult.reason.message
              : 'Failed to load current weather.',
          );
        }

        if (forecastResult.status === 'fulfilled') {
          nextForecast = forecastResult.value;
          setDailyForecast(forecastResult.value);
          setForecastError(null);
        } else {
          setForecastError(
            forecastResult.reason instanceof Error
              ? forecastResult.reason.message
              : 'Failed to load daily forecast.',
          );
        }

        if (historyResult.status === 'fulfilled') {
          nextHistory = historyResult.value;
          setDailyHistory(historyResult.value);
          setHistoryError(null);
        } else {
          setHistoryError(
            historyResult.reason instanceof Error
              ? historyResult.reason.message
              : 'Failed to load daily history.',
          );
        }

        if (nextCurrent || nextForecast || nextHistory) {
          const payload: CurrentWeatherPageCache = {
            currentWeather: nextCurrent ?? currentWeather,
            dailyForecast: nextForecast ?? dailyForecast,
            dailyHistory: nextHistory ?? dailyHistory,
          };
          try {
            window.localStorage.setItem(
              currentWeatherPageCacheKey(normalizedCity, normalizedCountry),
              JSON.stringify(payload),
            );
          } catch {
            // Ignore cache write failures.
          }
        }

        toaster.create({
          title: `Weather data loaded successfully`,
          type: "success",
        });
      })
      .catch((error) => {
        toaster.create({
          title: `Failed to load weather data`,
          description: (error as Error).message,
          type: "error",
        });
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    const normalizedCity = city.trim();
    const normalizedCountry = country.trim().toUpperCase();
    if (!normalizedCity || !normalizedCountry) return;

    try {
      const raw = window.localStorage.getItem(
        currentWeatherPageCacheKey(normalizedCity, normalizedCountry),
      );
      if (raw) {
        const cached = JSON.parse(raw) as CurrentWeatherPageCache;
        if (cached.currentWeather) setCurrentWeather(cached.currentWeather);
        if (cached.dailyForecast) setDailyForecast(cached.dailyForecast);
        if (cached.dailyHistory) setDailyHistory(cached.dailyHistory);
        setError(null);
        setForecastError(null);
        setHistoryError(null);
        return;
      }
    } catch {
      // Ignore cache read failures.
    }

    void loadWeatherData(false);
  }, [city, country]);

  return {
    currentWeather,
    dailyForecast,
    dailyHistory,
    error,
    forecastError,
    historyError,
    isRefreshing,
    loadWeatherData,
  };
}
