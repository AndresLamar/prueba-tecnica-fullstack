import type { GetServerSideProps } from 'next';
import { Landmark } from 'lucide-react';
import { LoginCard } from '@/components/auth/login-card';
import { getServerAuthSession } from '@/lib/auth/guards';

const LoginPage = () => {
  return (
    <main className='relative min-h-screen overflow-hidden bg-primary text-slate-100'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute left-[-120px] top-[-80px] h-[460px] w-[460px] rounded-full bg-blue-500/20 blur-3xl' />
        <div className='absolute right-[14%] top-[28%] h-36 w-36 rounded-full bg-indigo-500/35 blur-2xl' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(56,189,248,0.14),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(30,64,175,0.16),transparent_42%)]' />
      </div>

      <header className='relative z-10 px-8 pt-7'>
        <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-100 backdrop-blur-md'>
          <Landmark className='h-4 w-4 text-blue-300' />
          FinanzasApp
        </div>
      </header>

      <div className='relative z-10 container mx-auto flex min-h-[calc(100vh-120px)] max-w-xl items-center justify-center px-4'>
        <LoginCard callbackURL='/' />
      </div>

      <footer className='relative z-10 pb-6 text-center text-xs text-slate-500'>
        &copy; 2026 FinanzasApp.
      </footer>
    </main>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession(context);

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
