import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '@/lib/auth';
import { ROLES, type Role } from '@/lib/constants/roles';

type BetterAuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type SessionWithRole = NonNullable<BetterAuthSession> & {
  user: NonNullable<BetterAuthSession>['user'] & { role?: unknown };
};

/**
 * Obtiene la sesión del usuario desde la API de Better Auth.
 * @param req - La solicitud HTTP.
 * @returns La sesión del usuario.
 */
export const getApiSession = async (
  req: NextApiRequest
): Promise<BetterAuthSession> =>
  auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

/**
 * Obtiene el rol del usuario desde la sesión.
 * @param session - La sesión del usuario.
 * @returns El rol del usuario.
 */
export const getSessionRole = (session: SessionWithRole): Role =>
  session.user.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;

/**
 * Requiere una sesión válida para acceder a la API.
 * @param req - La solicitud HTTP.
 * @param res - La respuesta HTTP.
 * @returns La sesión del usuario.
 */
export const requireApiSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionWithRole | null> => {
  const session = await getApiSession(req);
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  return session as SessionWithRole;
};

/**
 * Requiere una sesión válida y un rol de administrador para acceder a la API.
 * @param req - La solicitud HTTP.
 * @param res - La respuesta HTTP.
 * @returns La sesión del usuario.
 */
export const requireApiAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionWithRole | null> => {
  const session = await requireApiSession(req, res);
  if (!session) return null;

  if (getSessionRole(session) !== ROLES.ADMIN) {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }

  return session;
};
