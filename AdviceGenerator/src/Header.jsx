export default function Header({toggle, setToggle}){
     // dark theme toggle

    return (
        <header className={`bg-purple-50 ${toggle && "bg-slate-950 text-white"} shadow-md px-10 py-4 text-black`}>
            <nav className="flex items-center justify-between">
              {/* logo */}
                <div>
                    <span className="text-md font-semibold"> <i className="w-6 h-6 bg-purple-200 rounded-full shadow-xl/20 inset-shadow-xs inset-shadow-indigo-500 bx bx-sparkles-alt text-center align-middle pt-1 "></i>  Advice Generator </span>
                </div>

                 
                 <div>
                    <span title={`${toggle ? "toggle light mode": "toggle dark mode"} `} className="font-semibold text-2xl "><i className={`w-6 h-6 shadow-xl/30 bg-purple-100 rounded-full inset-shadow-sm bx bx-moon ${toggle && "bx bx-sun"} text-center cursor-pointer ${toggle && "text-purple-500"}`}  onClick={() => setToggle(prev => !prev)}></i></span>
                </div>
            </nav>
        </header>
    )
}