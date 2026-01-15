export default function Header({ toggle, setToggle }) {
    function handleToggle() {
        setToggle(prevToggle => !prevToggle)
        console.log(toggle)
    }
    return (
        <header className="py-3 pb-5 px-10 bg-orange-500 backdrop-blur-sm stick top-0 cursor-pointer shadow-2xl">
            <nav className="flex items-center justify-between">
                <div>
                    <span className="text-xl text-white font-semibold"><i className="bx bx-quote-left mr-3 align-middle w-10 h-10 text-md rounded-full border-2 text-center p-2"></i>Quote Generator</span>
                </div>


                <div>
                    <i className={`${toggle && "bx bx-sun"} bx bx-moon align-middle w-10 h-10 text-md rounded-full border-2 text-center p-2 text-xl text-white`} onClick={handleToggle}></i>
                </div>
            </nav>
        </header>
    )
}