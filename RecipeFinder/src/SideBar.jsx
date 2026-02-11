import SideBarContent from "./SideBarContent";
export default function SideBar({ sampleData }) {
  return (
    <div className="flex h-screen w-full bg-gray-100">
      <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-4">
        <h2 className="text-[#9dabbe] uppercase font-semibold my-4">Discover</h2>
        {/*Recipes div */}
        <div className="space-y-4">
          {
            sampleData.map(item => (
              <div className="bg-white border-2 rounded-2xl cursor-pointer p-4 hover:bg-purple-100 border-purple-800" key={item.id}>
                {/*image and header/name */}
                <div className="flex items-center justify-between">
                  <div className="mr-5 w-auto">
                    <img src={item.img} className="w-28 rounded-2xl" />
                  </div>
                  <h2 className="capitalize font-semibold">{item.name}</h2>
                </div>

                {/* time and tag */}
                <div className="flex items-center justify-center capitalize ml-10 my-2">
                  <p className="mx-4 text-sm font-semibold bg-slate-200 py-1 px-2 rounded hover:text-purple-800 border border-gray-200">{item.tag}</p>
                  <p className="text-sm text-gray-500">{item.time} mins</p>
                </div>

              </div>
            ))
          }
        </div>
      </aside>

      {/* Main content */}
      <SideBarContent firstRecipeName={sampleData[1].name} />

    </div>
  );
}
