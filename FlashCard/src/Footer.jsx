export default function Footer({ toggle }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`mt-12 py-6 text-center text-sm ${
        toggle ? "bg-slate-900 text-slate-400 border-t border-slate-700" : "bg-white text-gray-600 border-t border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <p className="font-semibold text-purple-600 mb-1">FlashQuiz</p>
        <p>
          Built with React + Vite · Powered by{" "}
          <a
            href="https://opentdb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            Open Trivia Database
          </a>
        </p>
        <p className="mt-2 text-gray-500">© {currentYear}</p>
      </div>
    </footer>
  );
}
