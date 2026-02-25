import type { CurrentWeatherResponse } from '@/schemas/currentWeatherSchemas';
import type { DailyForecastDay, DailyForecastResponse } from '@/schemas/dailyForecastSchemas';
import type { DailyHistoryDay, DailyHistoryResponse } from '@/schemas/dailyHistorySchemas';

export type MetricItem = {
  label: string;
  value: string;
  subtext?: string;
};

export type CurrentObservation = CurrentWeatherResponse['data'][number];

export type SnapshotSelection =
  | { kind: 'current' }
  | { kind: 'forecast'; day: DailyForecastDay }
  | { kind: 'history'; day: DailyHistoryDay };

export type CurrentWeatherPageCache = {
  currentWeather: CurrentWeatherResponse | null;
  dailyForecast: DailyForecastResponse | null;
  dailyHistory: DailyHistoryResponse | null;
};

export type ActiveSnapshotView = {
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
  metrics: MetricItem[];
};
