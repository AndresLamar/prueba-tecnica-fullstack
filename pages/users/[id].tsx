import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { getUserByIdAction, updateUserAction } from '@/lib/actions/users';
import { authClient } from '@/lib/auth/client';
import { ROLES, type Role } from '@/lib/constants/roles';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectGroup, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const UserEditPage = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = typeof router.query.id === 'string' ? router.query.id : '';
  const isRouteLoading = !router.isReady || userId.length === 0;
  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserByIdAction(userId),
    enabled: userId.length > 0,
  });

  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(ROLES.USER);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setRole(user.role);
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateUserAction,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;

    setErrorMessage(null);

    try {
      const isSelfDemotion =
        session?.user.id === user.id &&
        user.role === ROLES.ADMIN &&
        role === ROLES.USER;

      await updateMutation.mutateAsync({ userId: user.id, name, role });

      if (isSelfDemotion) {
        window.location.assign(ROUTES.HOME);
        return;
      }

      toast.success('Usuario actualizado correctamente.');
      await router.push(ROUTES.USERS);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        setErrorMessage('No fue posible actualizar el usuario.');
        toast.error('No fue posible actualizar el usuario.');
      }
    }
  };

  return (
    <Card className='mx-auto w-full max-w-3xl border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
      <CardHeader>
        <CardTitle>Editar usuario</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isRouteLoading || isLoading ? (
          <>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16 bg-white/10' />
              <Skeleton className='h-10 w-full bg-white/10' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16 bg-white/10' />
              <Skeleton className='h-10 w-full bg-white/10' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-12 bg-white/10' />
              <Skeleton className='h-10 w-full bg-white/10' />
            </div>
          </>
        ) : null}

        {isError ? (
          <div className='rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200'>
            <p>{error instanceof Error ? error.message : 'No fue posible cargar el usuario.'}</p>
            <div className='mt-3 flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => void refetch()}
                className='border-white/20 bg-transparent hover:bg-white/10'
              >
                Reintentar
              </Button>
              <Button asChild variant='outline' size='sm' className='border-white/20 bg-transparent hover:bg-white/10'>
                <Link href={ROUTES.USERS}>Volver</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {!isRouteLoading && !isLoading && !isError && user ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='user-name'>Nombre</FieldLabel>
                <Input
                  id='user-name'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className='border-white/15 bg-white/10 text-slate-100'
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='user-role'>Rol</FieldLabel>
                <Select value={role} onValueChange={(value) => setRole(value as Role)}>
                  <SelectTrigger className='border-white/15 bg-white/10 text-slate-100'>
                    <SelectValue placeholder='Selecciona un rol' />
                  </SelectTrigger>
                  <SelectContent className='bg-white/10 text-slate-100'>
                    <SelectGroup>
                      <SelectItem value={ROLES.USER}>USER</SelectItem>
                      <SelectItem value={ROLES.ADMIN}>ADMIN</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>


            {errorMessage ? <p className='text-sm text-red-300'>{errorMessage}</p> : null}

            <div className='flex justify-end gap-2'>
              <Button
                asChild
                variant='outline'
                className='border-white/15 bg-transparent text-slate-100 hover:bg-white/10'
              >
                <Link href={ROUTES.USERS}>Cancelar</Link>
              </Button>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default UserEditPage;

