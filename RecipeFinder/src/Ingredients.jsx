export default function Ingredients() {
    return (
        <aside className="md:w-64 bg-white border-r overflow-y-auto border-gray-200 p-8 w-full">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-xl">Ingredients</h1>
                <span className="text-purple-700 font-semibold text-sm">Scale(4x)</span>
            </div>

            <div>

                <div className="mt-7 flex space-x-3">
                    <i class="bx bx-bowl-rice" style={{ color: "#9dabbe", borderRadius: "40%", backgroundColor: "#f1f5f9", padding: "10px", fontSize: "20px" }} />
                    <h3 className="capitalize font-semibold text-sm mt-2 text-center">Arborio Rice</h3>
                </div>

                <small className="text-gray-500 text-xs lowercase mt-0 md:ml-12">1.5 cups</small>


                <div className="mt-7 flex space-x-3">
                    <i class="bx bx-spa" style={{ color: "#9dabbe", borderRadius: "40%", backgroundColor: "#f1f5f9", padding: "10px", fontSize: "20px" }} />
                    <h3 className="capitalize font-semibold text-sm mt-2 text-center">Wild Mushrooms</h3>
                </div>

                <small className="text-gray-500 text-xs lowercase mt-0 md:ml-12">500g, sliced</small>


                <div className="mt-7 flex space-x-3">
                    <i class="bx bx-bowl-hot" style={{ color: "#9dabbe", borderRadius: "40%", backgroundColor: "#f1f5f9", padding: "10px", fontSize: "20px" }} />
                    <h3 className="capitalize font-semibold text-sm mt-2 text-center">Vegetable Broth</h3>
                </div>

                <small className="text-gray-500 text-xs lowercase mt-0 md:ml-12">4 cups, warm</small>


                <div className="mt-7 flex space-x-3">
                    <i class="bx bx-cheese" style={{ color: "#9dabbe", borderRadius: "40%", backgroundColor: "#f1f5f9", padding: "10px", fontSize: "20px" }} />
                    <h3 className="capitalize font-semibold text-sm mt-2 text-center">Parmesan Cheese</h3>
                </div>

                <small className="text-gray-500 text-xs lowercase mt-0 md:ml-12">1/2 cup, grated</small>


                <div className="mt-7 flex space-x-3">
                    <i class="bx bx-wine" style={{ color: "#9dabbe", borderRadius: "40%", backgroundColor: "#f1f5f9", padding: "10px", fontSize: "20px" }} />
                    <h3 className="capitalize font-semibold text-sm mt-2 text-center">White Wine</h3>
                </div>

                <small className="text-gray-500 text-xs lowercase mt-0 md:ml-12">1/2 cup, dry</small>
            </div>


        </aside>
    )
}