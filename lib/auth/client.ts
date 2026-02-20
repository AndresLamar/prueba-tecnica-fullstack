import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

type SignInWithGithubOptions = {
  callbackURL?: string;
};

export const signInWithGithub = async (
  options: SignInWithGithubOptions = {},
) =>
  authClient.signIn.social({
    provider: 'github',
    callbackURL: options.callbackURL ?? '/',
  });