import SideBarContent from "./SideBarContent";
export default function SideBar({ sampleData, isOpen, onClose, selectedRecipe, setSelectedId, selectedId, toggle }) {

  return (
    <div className={`flex h-screen w-full transition-colors ${toggle ? "bg-gray-900" : "bg-gray-100"}`}>
      <>
        {/* Background Overlay - Hidden on large screens */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-30 transition-opacity"
            onClick={onClose}
          ></div>
        )}

        <aside
          className={`w-80 border-r overflow-y-auto p-4 fixed lg:static top-0 left-0 h-full z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
            } ${toggle ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#778292] uppercase font-semibold my-4">Discover</h2>
            <p className="text-purple-700 font-semibold cursor-pointer">Filter</p>
          </div>

          {/*Recipes div */}
          <div className={`space-y-4 ${toggle && "bg-gray-900 rounded-xl text-white"}`}>

            {sampleData.map((item) => (
              <div
                className={`border rounded-2xl cursor-pointer p-4 transition ease-in-out duration-300 ${selectedId === item.idMeal ? "border-purple-800 border-2" : "border-transparent"
                  } ${toggle ? "bg-gray-800/60 hover:bg-gray-800/90 border-gray-700" : "bg-white hover:bg-purple-200 border-gray-100"}`}
                key={item.idMeal} onClick={() => setSelectedId(item.idMeal)}
              >
                {/*image and header/name */}
                <div className="flex items-center justify-between">
                  <div className="mr-10 w-auto">
                    <img src={item.strMealThumb} className="w-28 rounded-2xl" alt={item.strMeal} />
                  </div>
                  <h2 className="capitalize font-semibold">{item.strMeal}</h2>
                </div>

                {/* time and tag */}
                <div className="flex items-center justify-center capitalize ml-10 my-2">
                  <p className={`mx-4 text-sm font-semibold py-1 px-2 rounded border transition-colors ${toggle ? "bg-gray-700 text-white border-gray-600" : "bg-slate-200 text-gray-800 border-gray-200"}`}>
                    {item.strCategory}
                  </p>
                  <p className="text-sm text-gray-500">{item.cookingTime} mins</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </>

      {/* Main content */}
      <SideBarContent recipe={selectedRecipe} toggle={toggle} />
    </div>
  );
}
