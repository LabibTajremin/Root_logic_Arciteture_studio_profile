'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { signIn } from '@/infrastructure/auth/auth';

export async function loginAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    await signIn('credentials', { email, password, redirectTo: '/admin' });
    return null;
  } catch (error) {
    // A successful sign-in throws a redirect; let it propagate.
    if (isRedirectError(error)) throw error;
    return 'Invalid email or password.';
  }
}
