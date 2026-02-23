import { ROLES, type Role } from '@/lib/constants/roles';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  MOVEMENTS: '/movements',
  USERS: '/users',
  USERS_EDIT: '/users/[id]',
  REPORTS: '/reports',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

type RouteMeta = {
  path: AppRoute;
  title: string;
  minRole?: Role;
};

export const PROTECTED_ROUTE_META: RouteMeta[] = [
  { path: ROUTES.HOME, title: 'Home' },
  { path: ROUTES.MOVEMENTS, title: 'Movimientos' },
  { path: ROUTES.USERS, title: 'Usuarios', minRole: ROLES.ADMIN },
  { path: ROUTES.REPORTS, title: 'Reportes', minRole: ROLES.ADMIN },
];

export const PROTECTED_ROUTE_PATHS = PROTECTED_ROUTE_META.map(
  (route) => route.path
).concat(ROUTES.USERS_EDIT);

export const PAGE_TITLES_BY_ROUTE: Record<AppRoute, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.MOVEMENTS]: 'Movimientos',
  [ROUTES.USERS]: 'Usuarios',
  [ROUTES.USERS_EDIT]: 'Editar usuario',
  [ROUTES.REPORTS]: 'Reportes',
};

export const HOME_SECTION_ROUTES = [
  {
    title: 'Sistema de gestión de ingresos y gastos',
    href: ROUTES.MOVEMENTS,
    adminOnly: false,
  },
  {
    title: 'Gestión de usuarios',
    href: ROUTES.USERS,
    adminOnly: true,
  },
  {
    title: 'Reportes',
    href: ROUTES.REPORTS,
    adminOnly: true,
  },
] as const;
