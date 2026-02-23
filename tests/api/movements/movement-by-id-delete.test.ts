import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextApiResponse } from 'next';
import handler from '@/pages/api/movements/[id]';
import {
  createApiMocks,
  readJsonResponse,
  readStatusCode,
} from '@/tests/utils/api-test-helpers';

const { requireApiAdminMock, findUniqueMock, deleteMock } = vi.hoisted(() => ({
  requireApiAdminMock: vi.fn(),
  findUniqueMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  requireApiAdmin: requireApiAdminMock,
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    movement: {
      findUnique: findUniqueMock,
      delete: deleteMock,
      update: vi.fn(),
    },
  },
}));

describe('DELETE /api/movements/[id]', () => {
  beforeEach(() => {
    requireApiAdminMock.mockReset();
    findUniqueMock.mockReset();
    deleteMock.mockReset();
  });

  it('returns 200 when admin deletes own movement', async () => {
    requireApiAdminMock.mockResolvedValue({
      user: { id: 'admin-user-1' },
    });
    findUniqueMock.mockResolvedValue({
      id: 'mov-1',
      userId: 'admin-user-1',
    });
    deleteMock.mockResolvedValue({ id: 'mov-1' });

    const { req, res } = createApiMocks({
      method: 'DELETE',
      query: { id: 'mov-1' },
    });

    await handler(req, res);

    expect(readStatusCode(res)).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: 'mov-1' } });
    expect(readJsonResponse<{ data: { id: string; deleted: boolean } }>(res)).toEqual({
      data: { id: 'mov-1', deleted: true },
    });
  });

  it('returns 403 when admin tries to delete someone else movement', async () => {
    requireApiAdminMock.mockResolvedValue({
      user: { id: 'admin-user-1' },
    });
    findUniqueMock.mockResolvedValue({
      id: 'mov-2',
      userId: 'admin-user-2',
    });

    const { req, res } = createApiMocks({
      method: 'DELETE',
      query: { id: 'mov-2' },
    });

    await handler(req, res);

    expect(readStatusCode(res)).toBe(403);
    expect(deleteMock).not.toHaveBeenCalled();
    expect(readJsonResponse<{ error: string }>(res)).toEqual({
      error: 'Admins can only delete their own movements.',
    });
  });

  it('returns 401 when admin session is missing', async () => {
    requireApiAdminMock.mockImplementation(
      async (_req: unknown, res: NextApiResponse) => {
        res.status(401).json({ error: 'Authentication required' });
        return null;
      },
    );

    const { req, res } = createApiMocks({
      method: 'DELETE',
      query: { id: 'mov-3' },
    });

    await handler(req, res);

    expect(readStatusCode(res)).toBe(401);
    expect(readJsonResponse<{ error: string }>(res)).toEqual({
      error: 'Authentication required',
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
