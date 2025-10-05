/**
 * @jest-environment @edge-runtime/jest-environment
 */
import { GET } from '@/app/api/auth/me/route';
import { NextRequest } from 'next/server';

const mockQuery = jest.fn();

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: (...args: any[]) => mockQuery(...args),
  },
}));

jest.mock('@/lib/ratelimiter', () => ({
  defRateLimit: {
    limit: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

describe('GET /api/me', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  function createRequestWithCookie(value?: string) {
    return {
      cookies: {
        get: jest.fn(() => (value ? { value } : undefined)),
      },

      headers: {
        get: jest.fn(() => '127.0.0.1'),
      },
    } as unknown as NextRequest;
  }

  test('returns null user if no session cookie', async () => {
    const req = createRequestWithCookie();
    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual({ user: null });
    expect(res.status).toBe(200);
  });

  test('returns user if session is valid', async () => {
    const req = createRequestWithCookie('valid-session');
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, username: 'kenan' }] });

    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual({ user: { id: 1, username: 'kenan' } });
    expect(res.status).toBe(200);
  });

  test('returns null if session expired', async () => {
    const req = createRequestWithCookie('expired-session');
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual({ user: null });
    expect(res.status).toBe(200);
  });

  test('returns 500 on server error', async () => {
    const req = createRequestWithCookie('bad-session');
    mockQuery.mockRejectedValueOnce(new Error('Server down'));

    const res = await GET(req);
    const data = await res.json();

    expect(data).toEqual({ error: 'Internal Server Error' });
    expect(res.status).toBe(500);
  });
});
