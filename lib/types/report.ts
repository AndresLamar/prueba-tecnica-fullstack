import type { MovementRow } from '@/lib/types/movement';

export type ReportSummary = {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
};

export type ReportChart = {
  labels: string[];
  values: number[];
};

export type ReportsData = {
  summary: ReportSummary;
  chart: ReportChart;
  movements: MovementRow[];
};
