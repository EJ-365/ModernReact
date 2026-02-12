import { Utensils, Bell, UserRound } from "lucide-react";
import SearchForm from "./SearchForm";

export default function Header({onMenuClick}) {
  return (
    <header className="bg-[#fdfdfe] border-b border-gray-200 shadow-sm">
      <nav className="flex items-center justify-between px-4 md:px-10 py-3">
        {/* Logo Area */}
        <div className="flex items-center shrink">
        <button className="tablet:hidden" onClick={onMenuClick}><i class="bx bx-menu mx-3 md:text-2xl bg-gray-200 p-2 rounded-lg cursor-pointer" /></button>
          <div className="bg-[#7f13ec] p-2 rounded-lg flex items-center justify-center">
            <Utensils size={20} color="white" />
          </div>
          <span className="hidden sm:block text-xl font-bold ml-3 text-gray-800">
            RecipeFinder
          </span>
        </div>

        {/* SearchForm Component */}
        <SearchForm />

        {/* Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4 shrink">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={22} className="text-gray-600" />
          </button>
          <div className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 cursor-pointer transition-colors">
            <UserRound size={20} color="lightgray" />
          </div>
        </div>
      </nav>
    </header>
  );
}
