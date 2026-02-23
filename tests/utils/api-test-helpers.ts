import type { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import type { RequestMethod } from 'node-mocks-http';

type CreateMocksOptions = NonNullable<
  Parameters<
  typeof createMocks<NextApiRequest, NextApiResponse>
>[0]
>;

type ApiMockOptions = {
  method: RequestMethod;
  query?: CreateMocksOptions['query'];
  body?: CreateMocksOptions['body'];
};

export const createApiMocks = ({
  method,
  query,
  body,
}: ApiMockOptions): { req: NextApiRequest; res: NextApiResponse } =>
  createMocks<NextApiRequest, NextApiResponse>({
    method,
    query,
    body,
  });

export const readJsonResponse = <T>(res: NextApiResponse): T =>
  JSON.parse((res as unknown as { _getData: () => string })._getData()) as T;

export const readStatusCode = (res: NextApiResponse): number =>
  (res as unknown as { _getStatusCode: () => number })._getStatusCode();
