'use client';

import { useState } from 'react';
import { Github, Loader2, Lock } from 'lucide-react';

import { signInWithGithub } from '@/lib/auth/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type LoginCardProps = {
  callbackURL?: string;
};

export const LoginCard = ({ callbackURL = '/' }: LoginCardProps) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGithubSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);

    try {
      const response = await signInWithGithub({ callbackURL });
      if (response?.error?.message) {
        setAuthError(response.error.message);
      }
    } catch {
      setAuthError('No fue posible iniciar sesión con GitHub. Intenta de nuevo.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Card className='w-full border-white/10 bg-white/[0.04] text-slate-100 shadow-2xl backdrop-blur-xl'>
      <CardHeader className='space-y-4 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20'>
          <Lock className='h-5 w-5 text-blue-200' />
        </div>
        <CardTitle className='text-3xl font-semibold tracking-tight'>Bienvenido</CardTitle>
        <CardDescription className='text-slate-300'>
          Gestiona tus finanzas de manera inteligente.
          <br />
          Accede a tu panel financiero.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {authError ? (
          <Alert variant='destructive'>
            <AlertTitle>Error de autenticación</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          variant='secondary'
          className='h-11 w-full bg-white text-slate-900 hover:bg-slate-200'
          onClick={handleGithubSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Autenticando...
            </>
          ) : (
            <>
              <Github className='mr-2 h-4 w-4' />
              Iniciar sesión con GitHub
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
