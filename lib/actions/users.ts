import type { Role } from '@/lib/constants/roles';
import { ROUTES } from '@/lib/constants/routes';
import type { UserRow } from '@/lib/types/user';

type ApiErrorResponse = {
  error?: string;
};

type UsersApiResponse = {
  data: UserRow[];
};

type UserApiResponse = {
  data: UserRow;
};

export type UpdateUserInput = {
  userId: string;
  name: string;
  role: Role;
};

export const getUsersAction = async (): Promise<UserRow[]> => {
  const response = await fetch(`/api${ROUTES.USERS}`);
  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible cargar los usuarios.');
  }

  const payload = (await response.json()) as UsersApiResponse;
  return payload.data;
};

export const getUserByIdAction = async (userId: string): Promise<UserRow> => {
  const response = await fetch(`/api${ROUTES.USERS}/${userId}`);
  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible cargar el usuario.');
  }

  const payload = (await response.json()) as UserApiResponse;
  return payload.data;
};

export const updateUserAction = async ({
  userId,
  name,
  role,
}: UpdateUserInput): Promise<UserRow> => {
  const response = await fetch(`/api${ROUTES.USERS}/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, role }),
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible actualizar el usuario.');
  }

  const payload = (await response.json()) as UserApiResponse;
  return payload.data;
};
