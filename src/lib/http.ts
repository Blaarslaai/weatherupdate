import { currentWeatherResponseSchema } from '@/schemas/currentWeatherSchemas';
import { weatherAlertsResponseSchema } from '../schemas/weatherAlertSchemas';

export function getCurrentWeather(city: string, country: string) {
  return fetch('/api/weather/currentWeather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, country }),
    credentials: "include",
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
