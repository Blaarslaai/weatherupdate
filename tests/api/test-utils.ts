import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

type MockReqOptions = {
  method?: string;
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
};

export function createMockReq(options: MockReqOptions = {}): VercelRequest {
  return {
    method: options.method ?? 'POST',
    body: options.body ?? {},
    query: options.query ?? {},
    headers: options.headers ?? {},
  } as unknown as VercelRequest;
}

export function createMockRes() {
  let statusCode = 200;
  let jsonBody: unknown;
  const headers = new Map<string, string | string[]>();

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      jsonBody = payload;
      return res;
    },
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
      return res;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
  } as unknown as VercelResponse;

  return {
    res,
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
  };
}

export function mockFetchJsonOnce(payload: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200;
  const ok = status >= 200 && status < 300;

  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  });
}

export function mockFetchTextOnce(text: string, init: { status?: number } = {}) {
  const status = init.status ?? 500;
  const ok = status >= 200 && status < 300;

  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    status,
    json: async () => ({ message: text }),
    text: async () => text,
  });
}

export function setWeatherEnv() {
  process.env.JWT_SECRET = 'test-secret';
  process.env.WEATHERBIT_API_KEY = 'weatherbit-key';
}

export function makeSessionCookie(role = 'user') {
  const secret = process.env.JWT_SECRET ?? 'test-secret';
  const token = jwt.sign({ role }, secret, { expiresIn: '1h' });
  return `session=${token}`;
}

beforeEach(() => {
  global.fetch = jest.fn() as unknown as typeof fetch;
});

afterEach(() => {
  jest.clearAllMocks();
});
