import jwt from 'jsonwebtoken';
import logoutHandler from '../../api/auth/logout';
import meHandler from '../../api/auth/me';
import { createMockReq, createMockRes } from './test-utils';

describe('auth api routes', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.APP_ACCESS_TOKEN = 'app-token';
  });

  it('rejects non-POST login requests', async () => {
    const { default: loginHandler } = await import('../../api/auth/login');
    const req = createMockReq({ method: 'GET' });
    const mockRes = createMockRes();

    await loginHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(405);
    expect(mockRes.jsonBody).toEqual({ error: 'Method not allowed' });
  });

  it('sets session cookie on successful login', async () => {
    const { default: loginHandler } = await import('../../api/auth/login');
    const req = createMockReq({ body: { token: 'app-token' } });
    const mockRes = createMockRes();

    await loginHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.jsonBody).toEqual({ ok: true });
    const cookie = mockRes.getHeader('set-cookie');
    expect(typeof cookie).toBe('string');
    expect(cookie).toContain('session=');
    expect(cookie).toContain('HttpOnly');
  });

  it('returns unauthenticated for /me when cookie is missing', () => {
    const req = createMockReq({ method: 'GET', headers: {} });
    const mockRes = createMockRes();

    meHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.jsonBody).toEqual({ authenticated: false });
  });

  it('returns authenticated for /me with a valid session cookie', () => {
    const token = jwt.sign({ role: 'user' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const req = createMockReq({
      method: 'GET',
      headers: { cookie: `session=${token}` },
    });
    const mockRes = createMockRes();

    meHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.jsonBody).toMatchObject({ authenticated: true, role: 'user' });
  });

  it('clears session cookie on logout', () => {
    const req = createMockReq({ method: 'POST' });
    const mockRes = createMockRes();

    logoutHandler(req, mockRes.res);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.jsonBody).toEqual({ ok: true });
    expect(mockRes.getHeader('set-cookie')).toContain('Max-Age=0');
  });
});
