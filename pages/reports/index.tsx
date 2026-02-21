import type { GetServerSideProps } from 'next';
import { requireAdminGuard } from '@/lib/auth/guards';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsPage = () => {
  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Reportes</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default ReportsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authResult = await requireAdminGuard(context);

  if ('redirect' in authResult) {
    return {
      redirect: authResult.redirect,
    };
  }

  return { props: {} };
};
