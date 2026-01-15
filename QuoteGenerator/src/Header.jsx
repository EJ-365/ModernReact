export default function Header({ toggle, setToggle }) {
    function handleToggle() {
        setToggle(prevToggle => !prevToggle)
        console.log(toggle)
    }
    return (
        <header className="flex justify-between items-center p-6 bg-white/50 backdrop-blur-sm sticky top-0">
            <nav className="flex items-center justify-between w-full">
                <div>
                    <span className="text-purple-700 font-black text-xl tracking-tighter">
                        <i className="bx bxs-quote-left mr-3 align-middle"></i>WisdomHub
                    </span>
                </div>


                <div>
                    <i className={`${toggle ? "bx bx-sun" : "bx bx-moon"} align-middle w-10 h-10 text-md rounded-full border-2 text-center p-2 text-xl text-purple-700 cursor-pointer`} onClick={handleToggle} title={toggle ? "Light Mode" : "Dark Mode"}></i>
                </div>
            </nav>
        </header>
    )
}