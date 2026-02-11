export default function Instructions() {
    return (
        <section className="text-center flex-1 overflow-y-auto items-center  justify-center bg-white">
            <div className="flex items-center justify-start m-8">
                <h1 className="font-semibold text-xl">Instructions</h1>
            </div>

            {/* Instruction 1 */}
            <div className="mx-4 text-wrap p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">1</p>
                    <h3 className="font-semibold text-lg">Sauté the mushrooms</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Heat olive oil and butter in a large pan over medium heat. Add the sliced wild mushrooms and cook until golden brown, about 6–8 minutes. Season with salt and pepper, then set aside.</small>
                </div>

            </div>


            {/* Instruction 2 */}
            <div className="mx-4 text-wrap p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">2</p>
                    <h3 className="font-semibold text-lg">Toast the rice</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">In the same pan, add the arborio rice and toast for 1–2 minutes until lightly golden. Pour in the white wine and stir until absorbed.</small>
                </div>

            </div>


            {/* Instruction 3 */}
            <div className="mx-4 text-wrap  p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">3</p>
                    <h3 className="font-semibold text-lg">Add broth gradually</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Add the warm vegetable broth one ladle at a time, stirring constantly until each addition is absorbed. Repeat until the rice is creamy and al dente, about 18–20 minutes.</small>
                </div>

            </div>



            {/* Instruction 4 */}
            <div className="mx-4 text-wrap  p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">4</p>
                    <h3 className="font-semibold text-lg">Finish and serve</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Stir in the sautéed mushrooms, parmesan cheese, and a knob of butter. Season with salt and pepper to taste. Let rest for 1 minute, then serve immediately.</small>
                </div>
            </div>

            <div className="my-30 flex items-center justify-start mx-8">
                <button className="p-3 bg-purple-700 text-white rounded-xl md:w-1/2 w-full font-semibold hover:bg-purple-800 transition ease-in-out cursor-pointer duration-300"> <i class="bx bx-fork-spoon" style={{verticalAlign:"middle", marginRight: "8px"}}></i> Start Cooking Mode</button>
            </div>

        </section>
    )
}