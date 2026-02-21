import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, LineChart, LogOut, ReceiptText, Users } from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import { PROTECTED_ROUTE_META, ROUTES } from '@/lib/constants/routes';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from './logo';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ROLES } from '@/lib/constants/roles';
import { getInitials, getRoleLabel } from '@/lib/utils';

type NavItem = {
  label: string;
  href: (typeof ROUTES)[keyof typeof ROUTES];
  icon: React.ComponentType<{ className?: string }>;
};

const navIconByPath: Record<(typeof ROUTES)[keyof typeof ROUTES], React.ComponentType<{ className?: string }>> = {
  [ROUTES.HOME]: Home,
  [ROUTES.LOGIN]: Home,
  [ROUTES.MOVEMENTS]: ReceiptText,
  [ROUTES.USERS]: Users,
  [ROUTES.REPORTS]: LineChart,
};

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const role = getRoleLabel(session?.user ? (session.user as Record<string, unknown>).role : undefined);
  const navItems: NavItem[] = PROTECTED_ROUTE_META.filter(
    (route) => !route.minRole || route.minRole === ROLES.USER || role === route.minRole,
  ).map((route) => ({
    label: route.title,
    href: route.path,
    icon: navIconByPath[route.path],
  }));

  const handleSignOut = async () => {
    await authClient.signOut();
    void router.push(ROUTES.LOGIN);
  };

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <Link href={ROUTES.HOME} className='px-2 py-1.5'>
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={router.pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className='h-4 w-4' />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isPending ? (
              <div className='flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 shadow-inner'>
                <Skeleton className='h-10 w-10 rounded-full bg-white/10' />
                <div className='flex w-full flex-col gap-2'>
                  <Skeleton className='h-3 w-24 bg-white/10' />
                  <Skeleton className='h-3 w-32 bg-white/10' />
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 shadow-inner'>
                <Avatar className='ring-2 ring-blue-400 ring-offset-2 ring-offset-[#111c2e] shadow'>
                  <AvatarImage src={session?.user.image ?? undefined} alt={session?.user.name ?? 'Usuario'} />
                  <AvatarFallback>{getInitials(session?.user.name ?? 'Usuario')}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <p
                    className='max-w-[120px] truncate text-sm font-semibold leading-none text-slate-100'
                    title={session?.user.name ?? 'Usuario'}
                  >
                    {session?.user.name ?? 'Usuario'}
                  </p>
                  <p className='max-w-[120px] truncate text-xs text-blue-100/80' title={session?.user.email}>
                    {session?.user.email}
                  </p>
                </div>
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className='w-full flex items-center justify-center gap-2 rounded-lg mt-4 border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-slate-100 transition-colors duration-150 font-medium shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400'
            >
              <LogOut className='h-5 w-5 text-blue-300' />
              <span className='text-base'>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
