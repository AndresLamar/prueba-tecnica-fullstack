import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ROLES, type Role } from '@/lib/constants/roles';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getInitials = (name: string | null): string => {
  if (!name) return 'U';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || 'U';
};


export const getRoleLabel = (roleValue: unknown): Role => {
  if (roleValue === ROLES.ADMIN) return ROLES.ADMIN;
  return ROLES.USER;
};