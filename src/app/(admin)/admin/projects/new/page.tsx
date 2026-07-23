import { NewProjectForm } from '@/presentation/components/admin/NewProjectForm';

export default function NewProjectPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
      <NewProjectForm />
    </section>
  );
}
