import type { NextApiResponse } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/movements/index';
import {
  createApiMocks,
  readJsonResponse,
  readStatusCode,
} from '@/tests/utils/api-test-helpers';

const { requireApiSessionMock, findManyMock } = vi.hoisted(() => ({
  requireApiSessionMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  requireApiAdmin: vi.fn(),
  requireApiSession: requireApiSessionMock,
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    movement: {
      findMany: findManyMock,
      create: vi.fn(),
    },
  },
}));

describe('GET /api/movements RBAC isolation', () => {
  beforeEach(() => {
    requireApiSessionMock.mockReset();
    findManyMock.mockReset();
  });

  it('returns all movements for USER role', async () => {
    requireApiSessionMock.mockResolvedValue({
      user: { id: 'user-1' },
    });
    findManyMock.mockResolvedValue([]);

    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req, res);

    expect(readStatusCode(res)).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
    expect(readJsonResponse<{ data: unknown[] }>(res)).toEqual({ data: [] });
  });

  it('returns all movements for ADMIN role', async () => {
    requireApiSessionMock.mockResolvedValue({
      user: { id: 'admin-1' },
    });
    findManyMock.mockResolvedValue([]);

    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req, res);

    expect(readStatusCode(res)).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });

  it('returns 401 when session is missing', async () => {
    requireApiSessionMock.mockImplementation(
      async (_req: unknown, res: NextApiResponse) => {
        res.status(401).json({ error: 'Authentication required' });
        return null;
      },
    );

    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req, res);

    expect(readStatusCode(res)).toBe(401);
    expect(findManyMock).not.toHaveBeenCalled();
  });
});
