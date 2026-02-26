import currentWeatherHandler from '../../api/weather/currentWeather';
import weatherAlertsHandler from '../../api/weather/weatherAlerts';
import dailyForecastHandler from '../../api/weather/dailyForecast';
import dailyHistoryHandler from '../../api/weather/dailyHistory';
import {
  createMockReq,
  createMockRes,
  makeSessionCookie,
  mockFetchJsonOnce,
  mockFetchTextOnce,
  setWeatherEnv,
} from './test-utils';

describe('weather api routes', () => {
  beforeEach(() => {
    setWeatherEnv();
  });

  it('returns 401 for weather routes without session', async () => {
    const handlers = [currentWeatherHandler, weatherAlertsHandler, dailyForecastHandler, dailyHistoryHandler];

    for (const handler of handlers) {
      const req = createMockReq({
        body: { city: 'Pretoria', country: 'ZA' },
        headers: {},
      });
      const mockRes = createMockRes();

      await handler(req, mockRes.res);

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes.jsonBody).toEqual({ error: 'Unauthorized' });
    }
  });

  it('returns 400 when country is provided without city', async () => {
    const req = createMockReq({
      body: { country: 'ZA' },
      headers: { cookie: makeSessionCookie() },
    });
    const mockRes = createMockRes();

    await currentWeatherHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.jsonBody).toEqual({ error: 'Provide a city and country' });
  });

  it('proxies current weather and enables no-store on refresh', async () => {
    mockFetchJsonOnce({ data: [{ temp: 20 }], count: 1 });

    const req = createMockReq({
      body: { city: 'Pretoria', country: 'ZA' },
      query: { refresh: '1' },
      headers: { cookie: makeSessionCookie() },
    });
    const mockRes = createMockRes();

    await currentWeatherHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.jsonBody).toEqual({ data: [{ temp: 20 }], count: 1 });
    expect(mockRes.getHeader('cache-control')).toBe('no-store');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/current?'),
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('proxies alerts and sets cache header', async () => {
    mockFetchJsonOnce({ alerts: [] });

    const req = createMockReq({
      body: { city: 'Pretoria', country: 'ZA' },
      headers: { cookie: makeSessionCookie() },
    });
    const mockRes = createMockRes();

    await weatherAlertsHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.getHeader('cache-control')).toBe('s-maxage=300, stale-while-revalidate=600');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/alerts?'),
      expect.objectContaining({ headers: { accept: 'application/json' } }),
    );
  });

  it('passes bounded days to daily forecast route', async () => {
    mockFetchJsonOnce({ data: [] });

    const req = createMockReq({
      body: { city: 'Pretoria', country: 'ZA' },
      query: { days: '99' },
      headers: { cookie: makeSessionCookie() },
    });
    const mockRes = createMockRes();

    await dailyForecastHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain('/forecast/daily?');
    expect(fetchUrl).toContain('days=16');
  });

  it('sends last-four-day range for daily history route (today back three days)', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-25T12:00:00Z'));
    mockFetchJsonOnce({ data: [] });

    const req = createMockReq({
      body: { city: 'Pretoria', country: 'ZA' },
      headers: { cookie: makeSessionCookie() },
    });
    const mockRes = createMockRes();

    await dailyHistoryHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(fetchUrl).toContain('/history/daily?');
    expect(fetchUrl).toContain('start_date=2026-02-22');
    expect(fetchUrl).toContain('end_date=2026-02-25');

    jest.useRealTimers();
  });

  it('returns upstream error details', async () => {
    mockFetchTextOnce('Upstream failed', { status: 503 });

    const req = createMockReq({
      body: { city: 'Pretoria', country: 'ZA' },
      headers: { cookie: makeSessionCookie() },
    });
    const mockRes = createMockRes();

    await currentWeatherHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(503);
    expect(mockRes.jsonBody).toEqual({
      error: 'Upstream Weatherbit error',
      status: 503,
      details: 'Upstream failed',
    });
  });
});
