import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { requireApiAdmin } from '@/lib/api/auth';
import { ROLE_VALUES, type Role } from '@/lib/constants/roles';
import { sendBadRequest, sendMethodNotAllowed } from '@/lib/api/http';

const isValidRole = (role: unknown): role is Role =>
  typeof role === 'string' && ROLE_VALUES.includes(role as Role);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await requireApiAdmin(req, res);
  if (!session) return;

  const { id } = req.query;
  if (typeof id !== 'string' || id.length === 0) {
    sendBadRequest(res, 'User id is required.');
    return;
  }

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.status(200).json({ data: user });
    return;
  }

  if (req.method === 'PUT') {
    const { name, role } = req.body ?? {};
    if (
      name !== undefined &&
      (typeof name !== 'string' || name.trim().length === 0)
    ) {
      sendBadRequest(res, 'Name must be a non-empty string.');
      return;
    }

    if (role !== undefined && !isValidRole(role)) {
      sendBadRequest(res, `Invalid role. Use: ${ROLE_VALUES.join(', ')}`);
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(role !== undefined ? { role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ data: user });
    return;
  }

  sendMethodNotAllowed(res, ['GET', 'PUT']);
}
