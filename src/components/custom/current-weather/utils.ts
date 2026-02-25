export function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

export function formatTimeFromUnix(timestamp?: number) {
  if (!timestamp) return 'N/A';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
}

export function currentWeatherPageCacheKey(city: string, country: string) {
  return `weatherupdate.currentWeatherPage.${country.toUpperCase()}.${city.toLowerCase()}`;
}
