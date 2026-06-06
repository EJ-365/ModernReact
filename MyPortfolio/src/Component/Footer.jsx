function Footer(){
    return (
        <footer className="flex md:flex-row flex-col items-center md:justify-between justify-center p-10 border-t bg-gray-100 dark:bg-black/95 border-t-gray-300 dark:border-t-gray-900 shadow-lg ">
            <div className="font-thin dark:text-white md:my-0 my-3">
                <span className="uppercase text-[12px] md:tracking-[3px] tracking-wider font-thin"> &copy; 2026 Ejay gabriel. built with precision.</span>
            </div>

            <div className="md:space-x-10 space-x-4 font-thin text-sm dark:text-white">
                <a href="">LinkedIn</a>
                <a href="">GitHub</a>
                <a href="">Twitter</a>
            </div>
        </footer>
    )
}

export default Footer;