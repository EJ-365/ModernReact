function Footer() {
  return (
    <footer className="animate-fade-in-up my-auto w-full" style={{ animationDelay: "150ms" }}>
      <div className="text-center bg-[#231c2c] p-6 space-y-2 flex  md:flex-row flex-col items-center justify-evenly">
        <p className="text-purple-300 text-[12px]">North America 2026</p>
        <p className="text-purple-400 text-[12px]">USA • Canada • Mexico</p>
        <p className="text-xs text-purple-300 font-medium">
          Country Flag:
          <a
            href="https://flagpedia.net/download/api"
            target="_blank"
            className="capitalize mx-2 text-blue-400"
          >
            flagpedia.net
          </a>
        </p>

        <p className="text-xs text-purple-400 font-medium">
          API DATA
          <a
            href="https://wheniskickoff.com/data/"
            target="_blank"
            className="capitalize mx-2 text-blue-400"
          >
            wheniskickoff.com/data/
          </a>
        </p>

        <p className="text-xs text-purple-400 font-medium">
          iframe
          <a
            href="https://www.espn.com/soccer/standings/_/league/fifa.world"
            target="_blank"
            className="uppercase mx-2 text-blue-400"
          >
           espn
          </a>
        </p>
        <div className="text-white">
          <p className="text-purple-300 text-sm">
            &copy; {new Date().getFullYear()} FIFA World Cup 2026. All rights reserved. Developed by Ejay Gabriel.
          </p>
        </div>
   
      </div>
      
    </footer>
  );
}

export default Footer;
