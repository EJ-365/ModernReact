function Project() {
  const projects = ["Movie finder", "Travel journal", "Shopping cart"];

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-24">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
          Projects
        </p>
        <h1 className="mt-4 text-5xl font-bold capitalize">Selected work</h1>
        <p className="mt-6 text-gray-700 dark:text-gray-200">
          A compact view of React projects focused on clean interactions and
          practical frontend patterns.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project}
            className="border border-gray-200 p-6 text-center shadow-sm dark:border-gray-800"
          >
            <h2 className="text-xl font-semibold capitalize">{project}</h2>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Project;
