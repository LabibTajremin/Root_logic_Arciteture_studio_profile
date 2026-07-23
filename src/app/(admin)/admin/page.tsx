import { auth } from '@/infrastructure/auth/auth';

export default async function AdminDashboardPage() {
  const session = await auth();
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="opacity-70">
        Welcome back, {session?.user.name}. Content management modules are built in the admin phase.
      </p>
    </section>
  );
}
