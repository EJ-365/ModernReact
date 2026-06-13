import { useNavigate } from "react-router-dom";

function Error() {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black w-full">
      <div className="flex flex-col items-center">
        <h2 className="text-[7rem] md:text-[10rem] font-bold text-gray-300 dark:text-gray-700 mb-1 leading-none tracking-widest select-none">
          404
        </h2>
        <p className="text-2xl md:text-3xl font-semibold text-black dark:text-white mb-4 text-center">
          Page Not Found
        </p>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 text-center max-w-xl">
          The page you are looking for doesn't exist yet.
        </p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-10 px-7 py-3 bg-black text-white dark:bg-white dark:text-black rounded hover:bg-neutral-900 dark:hover:bg-neutral-200 text-sm font-semibold uppercase transition"
        >
          Go Home
        </button>
      </div>
    </section>
  );
}
export default Error;