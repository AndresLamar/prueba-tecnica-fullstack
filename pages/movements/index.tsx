import type { GetServerSideProps } from 'next';
import { requireSessionGuard } from '@/lib/auth/guards';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const MovementsPage = () => {
  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Movimientos</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default MovementsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authResult = await requireSessionGuard(context);

  if ('redirect' in authResult) {
    return {
      redirect: authResult.redirect,
    };
  }

  return { props: {} };
};
