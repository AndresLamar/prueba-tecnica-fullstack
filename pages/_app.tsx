import '@/styles/globals.css';
import 'swagger-ui-react/swagger-ui.css';
import type { AppProps } from 'next/app';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { Toaster } from '@/components/ui/sonner';
import { PAGE_TITLES_BY_ROUTE, PROTECTED_ROUTE_PATHS } from '@/lib/constants/routes';
import { ROLES } from '@/lib/constants/roles';
import { authClient } from '@/lib/auth/client';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const App = ({ Component, pageProps, router }: AppProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      }),
  );

  const isProtectedPage = PROTECTED_ROUTE_PATHS.includes(router.pathname as (typeof PROTECTED_ROUTE_PATHS)[number]);
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const currentRole = session?.user && (session.user as { role?: unknown }).role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;

  const routeRequiresAdmin = useMemo(() => {
    const adminRoutes = new Set([
      '/users',
      '/users/[id]',
      '/reports',
      '/movements/new',
      '/movements/[id]',
    ]);
    return adminRoutes.has(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    if (!isProtectedPage || isSessionPending) return;

    if (!session) {
      void router.replace('/login');
      return;
    }

    if (routeRequiresAdmin && currentRole !== ROLES.ADMIN) {
      void router.replace('/');
    }
  }, [currentRole, isProtectedPage, isSessionPending, routeRequiresAdmin, router, session]);

  if (isProtectedPage && (isSessionPending || !session || (routeRequiresAdmin && currentRole !== ROLES.ADMIN))) {
    return (
      <QueryClientProvider client={queryClient}>
        <main className='dark relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020b21] text-slate-100'>
          <div className='pointer-events-none absolute inset-0'>
            <div className='absolute left-[-120px] top-[-80px] h-[460px] w-[460px] rounded-full bg-blue-500/20 blur-3xl' />
            <div className='absolute right-[14%] top-[28%] h-36 w-36 rounded-full bg-indigo-500/35 blur-2xl' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(56,189,248,0.14),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(30,64,175,0.16),transparent_42%)]' />
          </div>
          <Loader2 className='relative z-10 h-6 w-6 animate-spin text-slate-300' aria-label='Cargando' />
        </main>
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (!isProtectedPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <Toaster />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className='dark relative min-h-screen overflow-hidden bg-[#020b21] text-slate-100'>
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute left-[-120px] top-[-80px] h-[460px] w-[460px] rounded-full bg-blue-500/20 blur-3xl' />
          <div className='absolute right-[14%] top-[28%] h-36 w-36 rounded-full bg-indigo-500/35 blur-2xl' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(56,189,248,0.14),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(30,64,175,0.16),transparent_42%)]' />
        </div>

        <SidebarProvider
          className='relative z-10 has-[[data-variant=inset]]:bg-transparent'
          style={
            {
              '--sidebar-background': '225 57% 11%',
              '--sidebar-foreground': '210 40% 96%',
              '--sidebar-primary': '221 83% 53%',
              '--sidebar-primary-foreground': '0 0% 100%',
              '--sidebar-accent': '221 39% 18%',
              '--sidebar-accent-foreground': '210 40% 98%',
              '--sidebar-border': '221 39% 23%',
              '--sidebar-ring': '217.2 91.2% 59.8%',
            } as CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className='bg-transparent'>
            <header className='sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-[#0b1735]/70 px-4 backdrop-blur'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4 bg-white/20' />
              <p className='text-sm font-medium text-slate-100'>
                {PAGE_TITLES_BY_ROUTE[router.pathname as keyof typeof PAGE_TITLES_BY_ROUTE] ?? 'Panel'}
              </p>
            </header>
            <div className='flex flex-1 flex-col gap-4 p-4'>
              <Component {...pageProps} />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;
