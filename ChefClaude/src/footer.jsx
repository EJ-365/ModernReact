export default function Footer({isDarkMode}) {
    return (
      <footer
        className={`mt-48 py-10 px-6 text-center border-t ${
          isDarkMode
            ? "bg-zinc-900 border-zinc-800 text-zinc-400"
            : "bg-[#ddbea8] border-zinc-200 text-zinc-800"
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <p className="uppercase tracking-[0.2em] text-sm font-bold text-red-500">
            Happy New Year 🎇 2026
          </p>

          <p className="text-xl font-semibold">
            Designed with ❤️ by{" "}
            <span className="hover:text-red-500 transition-colors cursor-default">
              Ejay
            </span>
          </p>

          <div className="flex items-center gap-2 text-sm opacity-80">
            <i className="bx bx-copyright"></i>
            <span>
              {new Date().getFullYear()} Chef Claude. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    );
}