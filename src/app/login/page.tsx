import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/infrastructure/auth/auth';
import { LoginForm } from '@/presentation/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/admin');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-widest opacity-60">Maapkathi Studio</p>
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
      </div>
      <LoginForm />
    </main>
  );
}
