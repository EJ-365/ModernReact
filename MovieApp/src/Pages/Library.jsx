export default function Library() {
  return (
    <main className="container mx-auto flex min-h-[60vh] w-3/4 flex-col justify-center py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b5cf6]">
        Saved titles
      </p>
      <h1 className="mt-2 text-4xl font-bold text-zinc-950 dark:text-white">
        My Library
      </h1>
      <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-300">
        Your saved movies and shows will appear here once you add titles to the
        library.
      </p>
    </main>
  );
}
