export const formatCurrencyCOP = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDisplayDate = (value: string): string =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date(value));

export const isoToDateInputValue = (isoDate: string): string => isoDate.slice(0, 10);

export const dateInputValueToIso = (dateValue: string): string =>
  `${dateValue}T12:00:00.000Z`;
