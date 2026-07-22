export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <p className="text-sm uppercase tracking-widest opacity-60">Maapkathi Studio</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        White-label portfolio platform for design studios.
      </h1>
      <p className="opacity-70">
        Scaffold is live. The public site and admin panel are built phase by phase — see
        <code className="mx-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
          BUILD_INSTRUCTIONS.md
        </code>
        .
      </p>
    </main>
  );
}
