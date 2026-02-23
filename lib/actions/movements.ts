import { ROUTES } from '@/lib/constants/routes';
import type { MovementRow, MovementType } from '@/lib/types/movement';

type ApiErrorResponse = {
  error?: string;
};

type MovementsApiResponse = {
  data: MovementRow[];
};

type MovementApiResponse = {
  data: MovementRow;
};

type DeleteMovementApiResponse = {
  data: {
    id: string;
    deleted: boolean;
  };
};

export type UpsertMovementInput = {
  concept: string;
  amount: number;
  date: string;
  type: MovementType;
};

export type UpdateMovementInput = UpsertMovementInput & {
  movementId: string;
};

export const getMovementsAction = async (): Promise<MovementRow[]> => {
  const response = await fetch(`/api${ROUTES.MOVEMENTS}`);
  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible cargar los movimientos.');
  }

  const payload = (await response.json()) as MovementsApiResponse;
  return payload.data;
};

export const getMovementByIdAction = async (
  movementId: string,
): Promise<MovementRow> => {
  const response = await fetch(`/api${ROUTES.MOVEMENTS}/${movementId}`);
  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible cargar el movimiento.');
  }

  const payload = (await response.json()) as MovementApiResponse;
  return payload.data;
};

export const createMovementAction = async (
  input: UpsertMovementInput,
): Promise<MovementRow> => {
  const response = await fetch(`/api${ROUTES.MOVEMENTS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible crear el movimiento.');
  }

  const payload = (await response.json()) as MovementApiResponse;
  return payload.data;
};

export const updateMovementAction = async ({
  movementId,
  ...input
}: UpdateMovementInput): Promise<MovementRow> => {
  const response = await fetch(`/api${ROUTES.MOVEMENTS}/${movementId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible actualizar el movimiento.');
  }

  const payload = (await response.json()) as MovementApiResponse;
  return payload.data;
};

export const deleteMovementAction = async (
  movementId: string,
): Promise<DeleteMovementApiResponse['data']> => {
  const response = await fetch(`/api${ROUTES.MOVEMENTS}/${movementId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible eliminar el movimiento.');
  }

  const payload = (await response.json()) as DeleteMovementApiResponse;
  return payload.data;
};
