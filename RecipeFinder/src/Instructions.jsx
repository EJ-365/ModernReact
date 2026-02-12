export default function Instructions({recipe}) {
    const steps = recipe?.strInstructions ? recipe.strInstructions.split('\r\n').filter(step => step.trim().length > 0) : [];
    return (
        <section className="text-center flex-1 overflow-y-auto items-center  justify-center bg-white">
            <div className="flex items-center justify-start m-8">
                <h1 className="font-semibold text-xl">Instructions</h1>
            </div>

            {/* Instruction 1 */}

            {
                steps.map((step, index) => (
                    <div className="mx-4 text-wrap p-4">
                    <div className="flex space-x-4">
                    <h3 className="font-semibold text-lg">Step</h3>
                        <p className="bg-purple-700  px-3 py-1 text-center rounded-full text-white font-bold">{index + 1}</p>
                        
                    </div>
    
                    <div className="flex  md:w-3/4 w-full items-center  text-center ml-12 text-gray-700">
                        <small className="text-sm font-semibold my-3">{step}</small>
                    </div>
    
                </div>
                ))
                
            }


        </section>
    )
}