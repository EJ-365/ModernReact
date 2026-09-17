function Footer() {
  return (
    <footer className="flex md:flex-row flex-col justify-around md:items-center items-start mx-10 md:mx-0 mt-44 mb-18">
      <span className="text-[#8b5e2b] text-sm font-plex">Bruce’s portfolio</span>
      <span className="text-[#8b5e2b] text-sm font-plex">One fox. Plenty of personality.</span>
            <span className="text-gray-400 text-xs md:text-sm font-plex mt-4">© {new Date().getFullYear()} Ejay Gabriel. All rights reserved.</span>

    </footer>
  );
}
export default Footer;
