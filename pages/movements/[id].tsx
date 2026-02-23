import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import {
  getMovementByIdAction,
  updateMovementAction,
} from '@/lib/actions/movements';
import { ROUTES } from '@/lib/constants/routes';
import { MOVEMENT_TYPES, type MovementType } from '@/lib/types/movement';
import { dateInputValueToIso, isoToDateInputValue } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MovementEditPage = () => {
  const router = useRouter();
  const movementId = typeof router.query.id === 'string' ? router.query.id : '';
  const isRouteLoading = !router.isReady || movementId.length === 0;
  const queryClient = useQueryClient();
  const { data: movement, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['movement', movementId],
    queryFn: () => getMovementByIdAction(movementId),
    enabled: movementId.length > 0,
  });

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<MovementType>(MOVEMENT_TYPES.INCOME);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!movement) return;
    setConcept(movement.concept);
    setAmount(String(movement.amount));
    setDate(isoToDateInputValue(movement.date));
    setType(movement.type);
  }, [movement]);

  const updateMutation = useMutation({
    mutationFn: updateMovementAction,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!movement) return;

    setErrorMessage(null);
    const parsedAmount = Number(amount);

    if (concept.trim().length === 0) {
      setErrorMessage('El concepto es obligatorio.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('El monto debe ser un número positivo.');
      return;
    }

    if (date.trim().length === 0) {
      setErrorMessage('La fecha es obligatoria.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        movementId: movement.id,
        concept: concept.trim(),
        amount: parsedAmount,
        date: dateInputValueToIso(date),
        type,
      });
      await queryClient.invalidateQueries({ queryKey: ['movements'] });
      await queryClient.invalidateQueries({ queryKey: ['movement', movement.id] });
      await router.push(ROUTES.MOVEMENTS);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setErrorMessage(caughtError.message);
      } else {
        setErrorMessage('No fue posible actualizar el movimiento.');
      }
    }
  };

  return (
    <Card className='mx-auto w-full max-w-3xl border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
      <CardHeader>
        <CardTitle>Editar movimiento</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isRouteLoading || isLoading ? (
          <>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20 bg-white/10' />
              <Skeleton className='h-10 w-full bg-white/10' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16 bg-white/10' />
              <Skeleton className='h-10 w-full bg-white/10' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-14 bg-white/10' />
              <Skeleton className='h-10 w-full bg-white/10' />
            </div>
          </>
        ) : null}

        {isError ? (
          <div className='rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200'>
            <p>
              {error instanceof Error
                ? error.message
                : 'No fue posible cargar el movimiento.'}
            </p>
            <div className='mt-3 flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => void refetch()}
                className='border-white/20 bg-transparent hover:bg-white/10'
              >
                Reintentar
              </Button>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='border-white/20 bg-transparent hover:bg-white/10'
              >
                <Link href={ROUTES.MOVEMENTS}>Volver</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {!isRouteLoading && !isLoading && !isError && movement ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='movement-concept'>Concepto</FieldLabel>
                <Input
                  id='movement-concept'
                  value={concept}
                  onChange={(event) => setConcept(event.target.value)}
                  className='border-white/15 bg-white/10 text-slate-100'
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='movement-amount'>Monto</FieldLabel>
                <NumericFormat
                  customInput={Input}
                  id='movement-amount'
                  thousandSeparator='.'
                  decimalSeparator=','
                  prefix='$ '
                  allowNegative={false}
                  decimalScale={0}
                  allowLeadingZeros={false}
                  value={amount}
                  onValueChange={(values) => setAmount(values.value)}
                  className='border-white/15 bg-white/10 text-slate-100'
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='movement-date'>Fecha</FieldLabel>
                <Input
                  id='movement-date'
                  type='date'
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className='border-white/15 bg-white/10 text-slate-100'
                />
              </Field>

              <Field>
                <FieldLabel htmlFor='movement-type'>Tipo</FieldLabel>
                <Select value={type} onValueChange={(value) => setType(value as MovementType)}>
                  <SelectTrigger
                    id='movement-type'
                    className='border-white/15 bg-white/10 text-slate-100'
                  >
                    <SelectValue placeholder='Selecciona un tipo' />
                  </SelectTrigger>
                  <SelectContent className='bg-[#0b1735] text-slate-100'>
                    <SelectGroup>
                      <SelectItem value={MOVEMENT_TYPES.INCOME}>Ingreso</SelectItem>
                      <SelectItem value={MOVEMENT_TYPES.EXPENSE}>Egreso</SelectItem>
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
                <Link href={ROUTES.MOVEMENTS}>Cancelar</Link>
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

export default MovementEditPage;
