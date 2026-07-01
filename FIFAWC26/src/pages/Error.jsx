import { useNavigate } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();

  return (
    <section className="flex h-screen flex-col items-center justify-center px-4 text-center text-white">
      <p
        className="animate-fade-in-up text-7xl font-black text-purple-500/80 md:text-8xl"
        style={{ animationDelay: "0ms" }}
      >
        404
      </p>

      <h1
        className="animate-fade-in-up mt-4 text-2xl font-bold md:text-3xl"
        style={{ animationDelay: "100ms" }}
      >
        Page not found
      </h1>

      <p
        className="animate-fade-in-up mt-3 max-w-md text-zinc-400"
        style={{ animationDelay: "200ms" }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <button
        type="button"
        onClick={() => navigate("/")}
        style={{ animationDelay: "300ms" }}
        className="animate-fade-in-up card-hover mt-8 cursor-pointer rounded-xl bg-[#6e23ae] border border-purple-200/60 px-8 py-3 font-medium text-white hover:bg-[#852ed3] hover:shadow-lg hover:shadow-purple-900/30"
      >
        <i className="bx bx-home-alt align-middle mr-2 text-lg" />
        Back to Home
      </button>
    </section>
  );
}
