import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { createMovementAction } from '@/lib/actions/movements';
import { ROUTES } from '@/lib/constants/routes';
import { MOVEMENT_TYPES, type MovementType } from '@/lib/types/movement';
import { dateInputValueToIso } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getTodayDateInput = (): string => new Date().toISOString().slice(0, 10);

const NewMovementPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateInput());
  const [type, setType] = useState<MovementType>(MOVEMENT_TYPES.INCOME);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createMovementAction,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      await createMutation.mutateAsync({
        concept: concept.trim(),
        amount: parsedAmount,
        date: dateInputValueToIso(date),
        type,
      });
      await queryClient.invalidateQueries({ queryKey: ['movements'] });
      await router.push(ROUTES.MOVEMENTS);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('No fue posible crear el movimiento.');
      }
    }
  };

  return (
    <Card className='mx-auto w-full max-w-3xl border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
      <CardHeader>
        <CardTitle>Nuevo movimiento</CardTitle>
      </CardHeader>
      <CardContent>
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
                <SelectTrigger id='movement-type' className='border-white/15 bg-white/10 text-slate-100'>
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
            <Button type='submit' disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Guardando...
                </>
              ) : (
                'Guardar movimiento'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewMovementPage;
