import { z } from 'zod';

export const dailyHistoryDaySchema = z.object({
  rh: z.number(),
  wind_spd: z.number(),
  slp: z.number().optional(),
  max_wind_spd: z.number().optional(),
  max_wind_dir: z.number().optional(),
  max_wind_spd_ts: z.number().optional(),
  wind_gust_spd: z.number().optional(),
  min_temp_ts: z.number().optional(),
  max_temp_ts: z.number().optional(),
  dewpt: z.number(),
  snow: z.number().optional(),
  snow_depth: z.number().optional(),
  precip: z.number(),
  precip_gpm: z.number().optional(),
  wind_dir: z.number(),
  max_dhi: z.number().optional(),
  dhi: z.number().optional(),
  max_temp: z.number(),
  pres: z.number(),
  max_uv: z.number().optional(),
  t_dhi: z.number().optional(),
  datetime: z.string(),
  temp: z.number(),
  min_temp: z.number(),
  clouds: z.number().optional(),
  ts: z.number(),
  revision_status: z.string().optional(),
  revision_version: z.string().optional(),
});

export const dailyHistoryResponseSchema = z.object({
  timezone: z.string(),
  state_code: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
  country_code: z.string(),
  station_id: z.string().optional(),
  sources: z.array(z.string()).optional(),
  data: z.array(dailyHistoryDaySchema),
  city_name: z.string(),
  city_id: z.union([z.string(), z.number()]).optional(),
});

export type DailyHistoryDay = z.infer<typeof dailyHistoryDaySchema>;
export type DailyHistoryResponse = z.infer<typeof dailyHistoryResponseSchema>;
