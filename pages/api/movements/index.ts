import type { NextApiRequest, NextApiResponse } from 'next';
import { MovementType } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  requireApiAdmin,
  requireApiSession,
} from '@/lib/api/auth';
import { sendBadRequest, sendMethodNotAllowed } from '@/lib/api/http';

const parseMovementType = (value: unknown): MovementType | null => {
  if (value === MovementType.INCOME || value === MovementType.EXPENSE) {
    return value;
  }
  return null;
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const session = await requireApiSession(req, res);
    if (!session) return;

    const typeFilter = parseMovementType(req.query.type);

    if (req.query.type !== undefined && !typeFilter) {
      sendBadRequest(res, 'Invalid movement type. Use INCOME or EXPENSE.');
      return;
    }

    const movements = await prisma.movement.findMany({
      where: {
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({ data: movements });
    return;
  }

  if (req.method === 'POST') {
    const session = await requireApiAdmin(req, res);
    if (!session) return;

    const { concept, amount, date, type, userId } = req.body ?? {};
    const parsedType = parseMovementType(type);
    const parsedDate = parseDate(date);
    const parsedAmount = Number(amount);

    if (typeof concept !== 'string' || concept.trim().length === 0) {
      sendBadRequest(res, 'Concept is required.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      sendBadRequest(res, 'Amount must be a valid positive number.');
      return;
    }

    if (!parsedDate) {
      sendBadRequest(res, 'Date must be a valid ISO date string.');
      return;
    }

    if (!parsedType) {
      sendBadRequest(
        res,
        'Movement type is required and must be INCOME or EXPENSE.'
      );
      return;
    }

    const targetUserId =
      typeof userId === 'string' && userId.length > 0
        ? userId
        : session.user.id;

    const movement = await prisma.movement.create({
      data: {
        concept: concept.trim(),
        amount: parsedAmount,
        date: parsedDate,
        type: parsedType,
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ data: movement });
    return;
  }

  sendMethodNotAllowed(res, ['GET', 'POST']);
}
