export default function Header(){
    return (
        <header className="bg-purple-100 px-10 py-4 text-black">
            <nav className="flex items-center justify-between">
              {/* logo */}
                <div>
                    <span className="text-md font-semibold"> <i className="w-6 h-6 bg-purple-200 rounded-full shadow-xl/20 inset-shadow-xs inset-shadow-indigo-500 ">✨</i>  Advice Generator </span>
                </div>

                 
                 <div>
                    <span className="font-semibold text-2xl"><i className="w-6 h-6 shadow-xl/30 bg-purple-100 rounded-full inset-shadow-sm ">⚙️</i></span>
                </div>
            </nav>
        </header>
    )
}