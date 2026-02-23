import type { NextApiRequest, NextApiResponse } from 'next';
import { MovementType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireApiAdmin } from '@/lib/api/auth';
import { sendMethodNotAllowed } from '@/lib/api/http';

const toCsv = (
  rows: Array<{
    concepto: string;
    tipo: MovementType;
    monto: number;
    fecha: Date;
    nombreUsuario: string;
    emailUsuario: string;
  }>
) => {
  const header = 'concepto,tipo,monto,fecha,nombreUsuario,emailUsuario';
  const lines = rows.map((row) =>
    [
      `"${row.concepto.replace(/"/g, '""')}"`,
      row.tipo === MovementType.INCOME ? 'Ingreso' : 'Egreso',
      row.monto.toFixed(2),
      row.fecha.toISOString(),
      `"${row.nombreUsuario.replace(/"/g, '""')}"`,
      `"${row.emailUsuario.replace(/"/g, '""')}"`,
    ].join(',')
  );
  return [header, ...lines].join('\n');
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, ['GET']);
    return;
  }

  const session = await requireApiAdmin(req, res);
  if (!session) return;

  const movements = await prisma.movement.findMany({
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const incomeTotal = movements
    .filter((movement) => movement.type === MovementType.INCOME)
    .reduce((total, movement) => total + movement.amount, 0);

  const expenseTotal = movements
    .filter((movement) => movement.type === MovementType.EXPENSE)
    .reduce((total, movement) => total + movement.amount, 0);

  const balance = incomeTotal - expenseTotal;

  if (req.query.format === 'csv') {
    const csv = toCsv(
      movements.map((movement) => ({
        concepto: movement.concept,
        tipo: movement.type,
        monto: movement.amount,
        fecha: movement.date,
        nombreUsuario: movement.user.name,
        emailUsuario: movement.user.email,
      }))
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte-movimientos.csv"'
    );
    res.status(200).send(csv);
    return;
  }

  res.status(200).json({
    data: {
      summary: {
        incomeTotal,
        expenseTotal,
        balance,
      },
      chart: {
        labels: ['Ingresos', 'Egresos'],
        values: [incomeTotal, expenseTotal],
      },
      movements,
    },
  });
}
