import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts';
import { getReportsAction } from '@/lib/actions/reports';
import { formatCurrencyCOP } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const ReportsPage = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['reports'],
    queryFn: getReportsAction,
  });

  const chartData = useMemo(
    () =>
      data
        ? data.chart.labels.map((label, index) => ({
            label,
            value: data.chart.values[index] ?? 0,
          }))
        : [],
    [data],
  );

  const chartConfig = {
    value: {
      label: 'Valor',
      color: '#3b82f6',
    },
  } satisfies ChartConfig;

  const barColorByLabel = (label: string): string =>
    label === 'Ingresos' ? '#34d399' : '#fca5a5';

  return (
    <div className='mx-auto w-full max-w-6xl space-y-4'>
      <div className='grid grid-cols-3 gap-4'>
        <Card className='border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-slate-300'>
              Saldo actual
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-end justify-between'>
            {isLoading ? (
              <Skeleton className='h-8 w-36 bg-white/10' />
            ) : (
              <p className='text-3xl font-bold text-slate-100'>
                {formatCurrencyCOP(data?.summary.balance ?? 0)}
              </p>
            )}
            <Landmark className='h-5 w-5 text-blue-300' />
          </CardContent>
        </Card>

        <Card className='border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-slate-300'>
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-end justify-between'>
            {isLoading ? (
              <Skeleton className='h-8 w-36 bg-white/10' />
            ) : (
              <p className='text-3xl font-bold text-emerald-300'>
                {formatCurrencyCOP(data?.summary.incomeTotal ?? 0)}
              </p>
            )}
            <TrendingUp className='h-5 w-5 text-emerald-300' />
          </CardContent>
        </Card>

        <Card className='border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-slate-300'>
              Egresos
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-end justify-between'>
            {isLoading ? (
              <Skeleton className='h-8 w-36 bg-white/10' />
            ) : (
              <p className='text-3xl font-bold text-red-300'>
                {formatCurrencyCOP(data?.summary.expenseTotal ?? 0)}
              </p>
            )}
            <TrendingDown className='h-5 w-5 text-red-300' />
          </CardContent>
        </Card>
      </div>

      <Card className='border-white/15 bg-white/5 text-slate-100 backdrop-blur-sm'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Movimientos financieros</CardTitle>
            <p className='text-xs text-slate-400'>
              Ingresos y egresos acumulados
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {isFetching && !isLoading ? (
              <span className='text-xs text-slate-400'>Actualizando...</span>
            ) : null}
            <Button asChild variant='outline' size='sm' className='border-white/20 bg-transparent hover:bg-white/10'>
              <a href='/api/reports?format=csv'>
                <Download className='mr-2 h-4 w-4' />
                Descargar CSV
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className='h-[340px] w-full bg-white/10' />
          ) : (
            <ChartContainer config={chartConfig} className='h-[340px] w-full'>
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='value' radius={6}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.label}
                      fill={barColorByLabel(entry.label)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}

          {isError ? (
            <div className='mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200'>
              <p>
                {error instanceof Error
                  ? error.message
                  : 'No fue posible cargar el reporte.'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => void refetch()}
                className='mt-3 border-white/20 bg-transparent hover:bg-white/10'
              >
                Reintentar
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
