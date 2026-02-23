import type { NextApiResponse } from 'next';

/**
 * Envía un error 405 (Método no permitido) con los métodos permitidos.
 * @param res - La respuesta HTTP.
 * @param allowedMethods - Los métodos permitidos.
 */
export const sendMethodNotAllowed = (
  res: NextApiResponse,
  allowedMethods: string[]
) => {
  res.setHeader('Allow', allowedMethods);
  res
    .status(405)
    .json({ error: `Method not allowed. Use: ${allowedMethods.join(', ')}` });
};

/**
 * Envía un error 400 (Bad Request) con el mensaje especificado.
 * @param res - La respuesta HTTP.
 * @param message - El mensaje de error.
 */
export const sendBadRequest = (res: NextApiResponse, message: string) => {
  res.status(400).json({ error: message });
};
