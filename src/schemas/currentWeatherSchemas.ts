import { z } from 'zod';

const currentWeatherConditionSchema = z.object({
  icon: z.string(),
  code: z.number(),
  description: z.string(),
});

const currentWeatherObservationSchema = z.object({
  wind_cdir: z.string(),
  rh: z.number(),
  pod: z.string(),
  lon: z.number(),
  pres: z.number(),
  timezone: z.string(),
  ob_time: z.string(),
  country_code: z.string(),
  clouds: z.number(),
  vis: z.number(),
  wind_spd: z.number(),
  gust: z.number().optional(),
  wind_cdir_full: z.string(),
  app_temp: z.number(),
  state_code: z.string().optional(),
  ts: z.number(),
  h_angle: z.number(),
  dewpt: z.number(),
  weather: currentWeatherConditionSchema,
  uv: z.number(),
  aqi: z.number().optional(),
  station: z.string().optional(),
  sources: z.array(z.string()).optional(),
  wind_dir: z.number(),
  elev_angle: z.number().optional(),
  datetime: z.string(),
  precip: z.number(),
  ghi: z.number().optional(),
  dni: z.number().optional(),
  dhi: z.number().optional(),
  solar_rad: z.number().optional(),
  city_name: z.string(),
  sunrise: z.string(),
  sunset: z.string(),
  temp: z.number(),
  lat: z.number(),
  slp: z.number().optional(),
});

export const currentWeatherResponseSchema = z.object({
  data: z.array(currentWeatherObservationSchema),
  minutely: z.array(z.unknown()).optional(),
  count: z.number(),
});

export type CurrentWeatherResponse = z.infer<typeof currentWeatherResponseSchema>;
