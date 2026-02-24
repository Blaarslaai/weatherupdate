import { z } from 'zod';

const dailyForecastWeatherSchema = z.object({
  code: z.number(),
  description: z.string(),
  icon: z.string(),
});

export const dailyForecastDaySchema = z.object({
  app_max_temp: z.number(),
  app_min_temp: z.number(),
  clouds: z.number(),
  clouds_hi: z.number().optional(),
  clouds_low: z.number().optional(),
  clouds_mid: z.number().optional(),
  datetime: z.string(),
  dewpt: z.number(),
  high_temp: z.number(),
  low_temp: z.number(),
  max_dhi: z.number().nullable().optional(),
  max_temp: z.number(),
  min_temp: z.number(),
  moon_phase: z.number(),
  moon_phase_lunation: z.number().optional(),
  moonrise_ts: z.number().optional(),
  moonset_ts: z.number().optional(),
  ozone: z.number().optional(),
  pop: z.number(),
  precip: z.number(),
  pres: z.number(),
  rh: z.number(),
  slp: z.number().optional(),
  snow: z.number().optional(),
  snow_depth: z.number().optional(),
  sunrise_ts: z.number().optional(),
  sunset_ts: z.number().optional(),
  temp: z.number(),
  ts: z.number(),
  uv: z.number(),
  valid_date: z.string(),
  vis: z.number(),
  weather: dailyForecastWeatherSchema,
  wind_cdir: z.string(),
  wind_cdir_full: z.string(),
  wind_dir: z.number(),
  wind_gust_spd: z.number().optional(),
  wind_spd: z.number(),
});

export const dailyForecastResponseSchema = z.object({
  city_name: z.string(),
  country_code: z.string(),
  data: z.array(dailyForecastDaySchema),
  lat: z.number(),
  lon: z.number(),
  state_code: z.string().optional(),
  timezone: z.string(),
});

export type DailyForecastDay = z.infer<typeof dailyForecastDaySchema>;
export type DailyForecastResponse = z.infer<typeof dailyForecastResponseSchema>;
