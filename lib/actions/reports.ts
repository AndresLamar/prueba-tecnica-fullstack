import { ROUTES } from '@/lib/constants/routes';
import type { ReportsData } from '@/lib/types/report';

type ApiErrorResponse = {
  error?: string;
};

type ReportsApiResponse = {
  data: ReportsData;
};

export const getReportsAction = async (): Promise<ReportsData> => {
  const response = await fetch(`/api${ROUTES.REPORTS}`);
  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new Error(payload.error ?? 'No fue posible cargar los reportes.');
  }

  const payload = (await response.json()) as ReportsApiResponse;
  return payload.data;
};
