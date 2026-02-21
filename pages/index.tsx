import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';

import { requireSessionGuard } from '@/lib/auth/guards';
import { HOME_SECTION_ROUTES } from '@/lib/constants/routes';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES, type Role } from '@/lib/constants/roles';
import { cn, getRoleLabel } from '@/lib/utils'; 

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authResult = await requireSessionGuard(context);

  if ('redirect' in authResult) {
    return {
      redirect: authResult.redirect,
    };
  }

  const role = getRoleLabel((authResult.session.user as { role?: unknown }).role);
  return { props: { role } };
};

type HomeProps = {
  role: Role;
};

export default function Home({ role }: HomeProps) {
  return (
    <section className='mx-auto flex w-full max-w-5xl flex-col gap-6 py-8'>
      <Card className='border-white/15 bg-white/5 text-slate-100 shadow-sm backdrop-blur-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Home</CardTitle>
          <CardDescription className='text-slate-300'>
            Menú principal del sistema financiero.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
        {HOME_SECTION_ROUTES.map((section) => {
          const blockedByRole = section.adminOnly && role !== ROLES.ADMIN;

          const tileClassName = cn(
            'group flex min-h-[180px] flex-col justify-between rounded-md border border-white/15 text-center transition-colors',
            blockedByRole
              ? 'cursor-not-allowed bg-white/5 text-slate-400'
              : 'bg-white/10 text-slate-100 hover:bg-white/20',
          );

          if (blockedByRole) {
            return (
              <Card key={section.href} className={tileClassName} aria-disabled='true'>
                <CardHeader className='items-center pt-8'>
                  <CardTitle className='text-center text-3xl leading-tight'>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center gap-3 pb-8'>
                  <Badge variant='outline' className='border-blue-300/50 text-blue-200'>
                    <Lock className='mr-1 h-3.5 w-3.5' />
                    Solo administradores
                  </Badge>
                </CardContent>
              </Card>
            );
          }

          return (
            <Link key={section.href} href={section.href} aria-label={`Ir a ${section.title}`}>
              <Card className={tileClassName}>
                <CardHeader className='items-center pt-8'>
                  <CardTitle className='text-center text-3xl leading-tight'>{section.title}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}