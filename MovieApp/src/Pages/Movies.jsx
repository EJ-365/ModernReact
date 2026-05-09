import movies from "../movies";

export default function Movies() {
  return (
    <main className="container mx-auto w-3/4 py-14">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b5cf6]">
          Featured collection
        </p>
        <h1 className="mt-2 text-4xl font-bold text-zinc-950 dark:text-white">
          Movies
        </h1>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {movies.map((movie) => (
          <article
            key={movie.title}
            className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-[#2c2c4e]"
          >
            <img
              src={movie.image}
              alt={`${movie.title} poster`}
              className="aspect-[2/3] w-full object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                {movie.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-300">
                {movie.date} - Rating {movie.rating}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
