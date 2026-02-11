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
                    <h3 className="font-semibold text-lg">Prepare the base</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam ad minima fugiat fugit, molestiae id, quaerat in ratione ipsa doloremque eius quo obcaecati reprehenderit alias non magni est. Voluptas, molestias?</small>
                </div>

            </div>


            {/* Instruction 2 */}
            <div className="mx-4 text-wrap p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">2</p>
                    <h3 className="font-semibold text-lg">Prepare the base</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam ad minima fugiat fugit, molestiae id, quaerat in ratione ipsa doloremque eius quo obcaecati reprehenderit alias non magni est. Voluptas, molestias?</small>
                </div>

            </div>


            {/* Instruction 3 */}
            <div className="mx-4 text-wrap  p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">3</p>
                    <h3 className="font-semibold text-lg">Prepare the base</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam ad minima fugiat fugit, molestiae id, quaerat in ratione ipsa doloremque eius quo obcaecati reprehenderit alias non magni est. Voluptas, molestias?</small>
                </div>

            </div>



            {/* Instruction 4 */}
            <div className="mx-4 text-wrap  p-4">
                <div className="flex space-x-4">
                    <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white">4</p>
                    <h3 className="font-semibold text-lg">Prepare the base</h3>
                </div>

                <div className="flex flex-col md:w-1/2 w-full items-center justify-center text-left ml-12 text-gray-700">
                    <small className="">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam ad minima fugiat fugit, molestiae id, quaerat in ratione ipsa doloremque eius quo obcaecati reprehenderit alias non magni est. Voluptas, molestias?</small>
                </div>
            </div>

            <div className="my-30 flex items-center justify-start mx-8">
                <button className="p-3 bg-purple-700 text-white rounded-xl md:w-1/2 w-full font-semibold hover:bg-purple-800 transition ease-in-out cursor-pointer duration-300"> <i class="bx bx-fork-spoon" style={{verticalAlign:"middle", marginRight: "8px"}}></i> Start Cooking Mode</button>
            </div>

        </section>
    )
}