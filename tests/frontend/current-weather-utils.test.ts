import {
  currentWeatherPageCacheKey,
  formatDayLabel,
  formatTimeFromUnix,
} from '../../src/components/custom/current-weather/utils';

describe('current weather utils', () => {
  it('builds a normalized cache key', () => {
    expect(currentWeatherPageCacheKey('Cape Town', 'za')).toBe(
      'weatherupdate.currentWeatherPage.ZA.cape town',
    );
  });

  it('returns N/A when unix timestamp is missing', () => {
    expect(formatTimeFromUnix(undefined)).toBe('N/A');
  });

  it('formats day labels for valid dates', () => {
    const label = formatDayLabel('2026-02-27');
    expect(label).toBeTruthy();
    expect(label).not.toContain('Invalid Date');
  });
});
