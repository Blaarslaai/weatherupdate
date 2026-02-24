import { z } from 'zod';

const weatherAlertSchema = z.object({
  description: z.string(),
  effective_local: z.string().optional(),
  effective_utc: z.string().optional(),
  ends_local: z.string().optional(),
  ends_utc: z.string().optional(),
  expires_local: z.string().optional(),
  expires_utc: z.string().optional(),
  onset_local: z.string().optional(),
  onset_utc: z.string().optional(),
  regions: z.array(z.string()),
  severity: z.string(),
  title: z.string(),
  uri: z.url(),
});

export const weatherAlertsResponseSchema = z.object({
  alerts: z.array(weatherAlertSchema),
  city_name: z.string(),
  country_code: z.string(),
  lat: z.number(),
  lon: z.number(),
  state_code: z.string().optional(),
  timezone: z.string(),
});

export type WeatherAlertsResponse = z.infer<typeof weatherAlertsResponseSchema>;
