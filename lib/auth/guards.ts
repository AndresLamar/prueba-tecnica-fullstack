import type { GetServerSidePropsContext } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '@/lib/auth';

type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type GuardRedirect = { destination: string; permanent: false };

const loginRedirect: GuardRedirect = {
  destination: '/login',
  permanent: false,
};

const homeRedirect: GuardRedirect = {
  destination: '/',
  permanent: false,
};

export const getServerAuthSession = async (
  context: GetServerSidePropsContext,
): Promise<BetterAuthSession> =>
  auth.api.getSession({
    headers: fromNodeHeaders(context.req.headers),
  });

export const requireSessionGuard = async (
  context: GetServerSidePropsContext,
): Promise<{ session: NonNullable<BetterAuthSession> } | { redirect: GuardRedirect }> => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return { redirect: loginRedirect };
  }

  return { session };
};

export const requireAdminGuard = async (
  context: GetServerSidePropsContext,
): Promise<{ session: NonNullable<BetterAuthSession> } | { redirect: GuardRedirect }> => {
  const authResult = await requireSessionGuard(context);

  if ('redirect' in authResult) {
    return authResult;
  }

  const role = (authResult.session.user as { role?: string }).role;
  if (role !== 'ADMIN') {
    return { redirect: homeRedirect };
  }

  return authResult;
};
