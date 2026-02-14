import { Utensils, Bell, Moon, Sun } from "lucide-react";
import SearchForm from "./SearchForm";

export default function Header({
  onMenuClick,
  query,
  setQuery,
  handleSubmit,
  toggle,
  setToggle
}) {
  return (<header className={
    `${toggle ? "bg-gray-900 border-gray-800 shadow-none" : "bg-[#fdfdfe] border-gray-200 shadow-sm"
    } border-b transition-colors`
  }>
    <nav className="flex items-center justify-between px-4 md:px-10 py-3"> {" "}
      {/* Logo Area */}
      <div className="flex items-center shrink">
        <button className="tablet:hidden"
          onClick={onMenuClick}>
          <i className={
            `bx bx-menu mx-3 md:text-2xl ${toggle ? "bg-gray-800 text-white" : "bg-gray-200"
            } p-2 rounded-lg cursor-pointer`
          } />
        </button>
        <div className="bg-[#7f13ec] p-2 rounded-lg flex items-center justify-center">
          <Utensils size={20}
            color="white" />
        </div>
        <span className={
          `hidden sm:block text-xl font-bold ml-3 ${toggle ? "text-white" : "text-gray-800"
          }`
        }>
          RecipeFinder
        </span>
      </div>
      {/* SearchForm Component */}
      <SearchForm query={query}
        setQuery={setQuery}
        handleSubmit={handleSubmit} />{" "}
      {/* Nav Links */}
      <div className="flex items-center gap-2 sm:gap-4 shrink">
        <button className={
          `p-2 rounded-full transition-colors ${toggle ? "hover:bg-gray-800 text-white" : "hover:bg-gray-100 text-gray-600"
          }`
        }>
          <Bell size={22} />
        </button>

        <div className={`bg-gray-800 hover:bg-gray-700 p-2 rounded-full cursor-pointer transition-colors`}
          onClick={setToggle}
          title={
            toggle ? "Light Mode" : "Dark Mode"
          }> {" "}
          {
            toggle ? (<Sun size={20}
              color="lightgray" />) : (<Moon size={20}
                color="lightgray" />)
          }
          {" "} </div>
      </div>
    </nav>
  </header>);
}
