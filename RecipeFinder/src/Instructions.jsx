export default function Instructions({ recipe }) {
    const steps = recipe?.strInstructions 
        ? recipe.strInstructions.split('\r\n').filter(step => step.trim().length > 0) 
        : [];

    return (
        <section className="flex-1 bg-white p-4 md:p-8">
            <div className="mb-8">
                <h1 className="font-bold text-2xl text-gray-800">Cooking Instructions</h1>
            </div>

            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                            <p className="bg-purple-700 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm">
                                {index + 1}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-1">Step {index + 1}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                        </div>
                    </div>
                ))}
            </div>

            {recipe?.strYoutube && (
                <div className="mt-12">
                    <h2 className="font-bold text-xl mb-6">Video Tutorial</h2>
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
                        <iframe 
                            className="w-full h-full"
                            src={recipe.strYoutube.replace("watch?v=", "embed/")} 
                            title="YouTube video player" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </section>
    );
}
