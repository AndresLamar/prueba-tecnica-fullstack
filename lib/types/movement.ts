export const MOVEMENT_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type MovementType = (typeof MOVEMENT_TYPES)[keyof typeof MOVEMENT_TYPES];

export type MovementUser = {
  id: string;
  name: string;
  email: string;
};

export type MovementRow = {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: MovementType;
  user: MovementUser;
};
