import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2, PencilLine } from 'lucide-react';
import { requireAdminGuard } from '@/lib/auth/guards';
import { getUsersAction } from '@/lib/actions/users';
import { ROUTES } from '@/lib/constants/routes';
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authResult = await requireAdminGuard(context);

  if ('redirect' in authResult) {
    return {
      redirect: authResult.redirect,
    };
  }

  return {
    props: {},
  };
};


const UsersPage = () => {
  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersAction,
  });

  return (
    <Card className='mx-auto w-full max-w-5xl border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Gestión de Usuarios</CardTitle>
        {isFetching && !isLoading ? (
          <Badge variant='outline' className='border-blue-300/40 text-blue-200'>
            <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
            Actualizando
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='rounded-md border border-white/15'>
          <Table>
            <TableHeader>
              <TableRow className='border-white/15 hover:bg-transparent'>
                <TableHead className='text-slate-300'>Nombre</TableHead>
                <TableHead className='text-slate-300'>Correo</TableHead>
                <TableHead className='text-slate-300'>Teléfono</TableHead>
                <TableHead className='text-slate-300'>Rol</TableHead>
                <TableHead className='text-right text-slate-300'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className='border-white/10'>
                      <TableCell>
                        <Skeleton className='h-4 w-32 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-44 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-24 bg-white/10' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-6 w-16 bg-white/10' />
                      </TableCell>
                      <TableCell className='text-right'>
                        <Skeleton className='ml-auto h-8 w-24 bg-white/10' />
                      </TableCell>
                    </TableRow>
                  ))
                : users.map((user) => (
                    <TableRow key={user.id} className='border-white/10 hover:bg-white/5'>
                      <TableCell className='font-medium'>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='border-blue-300/50 text-blue-200'>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          asChild
                          variant='secondary'
                          size='sm'
                          className='bg-white/10 text-slate-100 hover:bg-white/20'
                        >
                          <Link href={`${ROUTES.USERS}/${user.id}`}>
                            <PencilLine className='mr-2 h-4 w-4' />
                            Editar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {isError ? (
          <div className='rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200'>
            <p>{error instanceof Error ? error.message : 'No fue posible cargar los usuarios.'}</p>
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

        {!isLoading && !isError && users.length === 0 ? (
          <p className='text-sm text-slate-300'>No hay usuarios para mostrar.</p>
        ) : null}

      </CardContent>
    </Card>
  );
};

export default UsersPage;

