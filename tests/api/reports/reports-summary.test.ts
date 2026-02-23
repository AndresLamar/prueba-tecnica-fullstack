import type { NextApiResponse } from 'next';
import { MovementType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/reports/index';
import {
  createApiMocks,
  readJsonResponse,
  readStatusCode,
} from '@/tests/utils/api-test-helpers';

const { requireApiAdminMock, findManyMock } = vi.hoisted(() => ({
  requireApiAdminMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  requireApiAdmin: requireApiAdminMock,
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    movement: {
      findMany: findManyMock,
    },
  },
}));

describe('GET /api/reports calculations', () => {
  beforeEach(() => {
    requireApiAdminMock.mockReset();
    findManyMock.mockReset();
  });

  it('returns summary totals and balance correctly', async () => {
    requireApiAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
    });
    findManyMock.mockResolvedValue([
      {
        id: 'mov-1',
        concept: 'Ingreso 1',
        type: MovementType.INCOME,
        amount: 500000,
        date: new Date('2026-02-20T12:00:00.000Z'),
        user: { name: 'Admin', email: 'admin@mail.com' },
      },
      {
        id: 'mov-2',
        concept: 'Ingreso 2',
        type: MovementType.INCOME,
        amount: 250000,
        date: new Date('2026-02-21T12:00:00.000Z'),
        user: { name: 'Admin', email: 'admin@mail.com' },
      },
      {
        id: 'mov-3',
        concept: 'Egreso',
        type: MovementType.EXPENSE,
        amount: 100000,
        date: new Date('2026-02-22T12:00:00.000Z'),
        user: { name: 'Admin', email: 'admin@mail.com' },
      },
    ]);

    const { req, res } = createApiMocks({ method: 'GET' });
    await handler(req, res);

    expect(readStatusCode(res)).toBe(200);
    expect(readJsonResponse<{ data: { summary: { incomeTotal: number; expenseTotal: number; balance: number } } }>(res)).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          summary: {
            incomeTotal: 750000,
            expenseTotal: 100000,
            balance: 650000,
          },
        }),
      }),
    );
  });

  it('returns CSV when format=csv is requested', async () => {
    requireApiAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
    });
    findManyMock.mockResolvedValue([
      {
        id: 'mov-1',
        concept: 'Venta',
        type: MovementType.INCOME,
        amount: 100000,
        date: new Date('2026-02-20T12:00:00.000Z'),
        user: { name: 'Admin', email: 'admin@mail.com' },
      },
    ]);

    const { req, res } = createApiMocks({
      method: 'GET',
      query: { format: 'csv' },
    });
    await handler(req, res);

    expect(readStatusCode(res)).toBe(200);
    const csv = (res as unknown as { _getData: () => string })._getData();
    expect(csv).toContain('concepto,tipo,monto,fecha,nombreUsuario,emailUsuario');
    expect(csv).toContain('"Venta",Ingreso,100000.00');
  });

  it('returns 401 when admin session is missing', async () => {
    requireApiAdminMock.mockImplementation(
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
