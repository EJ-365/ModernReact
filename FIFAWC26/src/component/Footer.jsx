function Footer() {
  const standingsLinks = [
    {
      label: "WC26 Widget",
      href: "https://wc26-widget.vercel.app/groups?theme=dark",
    },
    {
      label: "FIFA",
      href: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/standings",
    },
    {
      label: "ESPN",
      href: "https://www.espn.com/soccer/standings/_/league/fifa.world",
    },
    {
      label: "BBC",
      href: "https://www.bbc.com/sport/football/world-cup/table",
    },
  ];

  return (
    <footer
      className="animate-fade-in-up my-auto w-full"
      style={{ animationDelay: "150ms" }}
    >
      <div className="flex flex-col items-center justify-evenly gap-4 bg-[#231c2c] p-6 text-center md:flex-row md:flex-wrap">
        <p className="text-[12px] text-purple-300">North America 2026</p>
        <p className="text-[12px] text-purple-400">USA • Canada • Mexico</p>

        <p className="text-xs font-medium text-purple-300">
          Country flags:
          <a
            href="https://flagpedia.net/download/api"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 capitalize text-blue-400"
          >
            flagpedia.net
          </a>
        </p>

        <p className="text-xs font-medium text-purple-400">
          API data:
          <a
            href="https://wheniskickoff.com/data/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2 capitalize text-blue-400"
          >
            wheniskickoff.com
          </a>
        </p>

        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-purple-400">
          <span>Standings:</span>
          {standingsLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </p>

        <div className="text-white">
          <p className="text-sm text-purple-300">
            &copy; {new Date().getFullYear()} FIFA World Cup 2026. All rights
            reserved. Developed by Ejay Gabriel.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
