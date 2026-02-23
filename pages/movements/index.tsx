import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PencilLine, Trash2 } from 'lucide-react';
import { deleteMovementAction, getMovementsAction } from '@/lib/actions/movements';
import { authClient } from '@/lib/auth/client';
import { ROLES } from '@/lib/constants/roles';
import { ROUTES } from '@/lib/constants/routes';
import { MOVEMENT_TYPES } from '@/lib/types/movement';
import { formatCurrencyCOP, formatDisplayDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MovementRow } from '@/lib/types/movement';

const MovementsPage = () => {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user && (session.user as { role?: string }).role === ROLES.ADMIN;
  const currentUserId = session?.user.id ?? '';
  const queryClient = useQueryClient();
  const { data: movements = [], isLoading, isError, error, refetch, isFetching } =
    useQuery({
      queryKey: ['movements'],
      queryFn: getMovementsAction,
    });
  const deleteMutation = useMutation({
    mutationFn: deleteMovementAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  });

  const getUserLabel = (movement: MovementRow): string =>
    movement.user.name || movement.user.email;

  const getMovementHref = (movementId: string): string =>
    `${ROUTES.MOVEMENTS}/${movementId}`;

  const handleDelete = async (movement: MovementRow) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el movimiento "${movement.concept}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(movement.id);
    } catch {
      // Handled by UI state below.
    }
  };

  return (
    <Card className='mx-auto w-full max-w-6xl border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Movimientos</CardTitle>
        <div className='flex items-center gap-2'>
          {isFetching && !isLoading ? (
            <span className='inline-flex items-center rounded-md border border-blue-300/40 px-2.5 py-1 text-xs text-blue-200'>
              <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              Actualizando
            </span>
          ) : null}
          {isAdmin ? (
            <Button asChild size='sm'>
              <Link href={ROUTES.MOVEMENTS_NEW}>Nuevo</Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-md border border-white/15'>
          <Table>
            <TableHeader>
              <TableRow className='border-white/15 hover:bg-transparent'>
                <TableHead className='text-slate-300'>Concepto</TableHead>
                <TableHead className='text-slate-300'>Monto</TableHead>
                <TableHead className='text-slate-300'>Fecha</TableHead>
                <TableHead className='text-slate-300'>Usuario</TableHead>
                <TableHead className='text-slate-300'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={`movement-skeleton-${index}`} className='border-white/10'>
                      <TableCell>
                        <Skeleton className='h-4 w-32 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='ml-auto h-4 w-24 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-24 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-40 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='ml-auto h-8 w-20 bg-white/10' />
                      </TableCell>
                    </TableRow>
                  ))
                : movements.map((movement) => (
                    <TableRow key={movement.id} className='border-white/10 hover:bg-white/5'>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <span>{movement.concept}</span>
                          <Badge
                            variant='outline'
                            className={
                              movement.type === MOVEMENT_TYPES.INCOME
                                ? 'border-emerald-300/40 text-emerald-200'
                                : 'border-red-300/40 text-red-200'
                            }
                          >
                            {movement.type === MOVEMENT_TYPES.INCOME
                              ? 'Ingreso'
                              : 'Gasto'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            movement.type === MOVEMENT_TYPES.INCOME
                              ? 'font-semibold text-emerald-300'
                              : 'font-semibold text-red-300'
                          }
                        >
                          {movement.type === MOVEMENT_TYPES.INCOME ? '+' : '-'}
                          {formatCurrencyCOP(movement.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDisplayDate(movement.date)}</TableCell>
                      <TableCell>{getUserLabel(movement)}</TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <div className='flex gap-2'>
                            <Button
                              asChild
                              variant='secondary'
                              size='sm'
                              className='bg-white/10 text-slate-100 hover:bg-white/20'
                            >
                              <Link href={getMovementHref(movement.id)}>
                                <PencilLine className='mr-1.5 h-4 w-4' />
                                Editar
                              </Link>
                            </Button>
                            {movement.user.id === currentUserId ? (
                              <Button
                                variant='outline'
                                size='sm'
                                disabled={deleteMutation.isPending}
                                onClick={() => void handleDelete(movement)}
                                className='border-red-300/40 bg-transparent text-red-200 hover:bg-red-500/10'
                              >
                                <Trash2 className='mr-1.5 h-4 w-4' />
                                Eliminar
                              </Button>
                            ) : null}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {isError ? (
          <div className='rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200'>
            <p>{error instanceof Error ? error.message : 'No fue posible cargar los movimientos.'}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => void refetch()}
              className='mt-3 border-white/20 bg-transparent hover:bg-white/10'
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {deleteMutation.isError ? (
          <p className='text-sm text-red-300'>
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : 'No fue posible eliminar el movimiento.'}
          </p>
        ) : null}

        {!isLoading && !isError && movements.length === 0 ? (
          <p className='text-sm text-slate-300'>No hay movimientos registrados.</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MovementsPage;
