import type { NextApiRequest, NextApiResponse } from 'next';
import { MovementType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireApiAdmin } from '@/lib/api/auth';
import { sendBadRequest, sendMethodNotAllowed } from '@/lib/api/http';

const parseMovementType = (value: unknown): MovementType | null => {
  if (value === undefined) return null;
  if (value === MovementType.INCOME || value === MovementType.EXPENSE) {
    return value;
  }
  return null;
};

const parseDate = (value: unknown): Date | null => {
  if (value === undefined) return null;
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireApiAdmin(req, res);
  if (!session) return;

  const { id } = req.query;
  if (typeof id !== 'string' || id.length === 0) {
    sendBadRequest(res, 'Movement id is required.');
    return;
  }

  if (req.method === 'GET') {
    const movement = await prisma.movement.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!movement) {
      res.status(404).json({ error: 'Movement not found.' });
      return;
    }

    res.status(200).json({ data: movement });
    return;
  }

  if (req.method === 'PUT') {
    const { concept, amount, date, type, userId } = req.body ?? {};

    const parsedAmount = amount === undefined ? undefined : Number(amount);
    const parsedDate = parseDate(date);
    const parsedType = parseMovementType(type);

    if (
      parsedAmount !== undefined &&
      (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
    ) {
      sendBadRequest(res, 'Amount must be a valid positive number.');
      return;
    }

    if (date !== undefined && !parsedDate) {
      sendBadRequest(res, 'Date must be a valid ISO date string.');
      return;
    }

    if (type !== undefined && !parsedType) {
      sendBadRequest(res, 'Movement type must be INCOME or EXPENSE.');
      return;
    }

    if (
      concept !== undefined &&
      (typeof concept !== 'string' || concept.trim().length === 0)
    ) {
      sendBadRequest(res, 'Concept must be a non-empty string.');
      return;
    }

    const movement = await prisma.movement.update({
      where: { id },
      data: {
        ...(concept !== undefined ? { concept: concept.trim() } : {}),
        ...(parsedAmount !== undefined ? { amount: parsedAmount } : {}),
        ...(parsedDate ? { date: parsedDate } : {}),
        ...(parsedType ? { type: parsedType } : {}),
        ...(typeof userId === 'string' && userId.length > 0 ? { userId } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json({ data: movement });
    return;
  }

  if (req.method === 'DELETE') {
    const movement = await prisma.movement.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!movement) {
      res.status(404).json({ error: 'Movement not found.' });
      return;
    }

    const isOwner = movement.userId === session.user.id;

    if (!isOwner) {
      res.status(403).json({ error: 'Admins can only delete their own movements.' });
      return;
    }

    await prisma.movement.delete({ where: { id } });
    res.status(200).json({ data: { id, deleted: true } });
    return;
  }

  sendMethodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
