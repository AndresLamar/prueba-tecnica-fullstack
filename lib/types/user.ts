import type { Role } from '@/lib/constants/roles';

export type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
};
