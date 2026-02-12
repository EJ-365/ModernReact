export default function Ingredients({ recipe }) {
    // Safety check to prevent crash while data is loading
    if (!recipe) return null;

    const ingredientsList = [];

    // Loop through the 20 possible ingredients from TheMealDB
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
            ingredientsList.push({
                name: ingredient,
                amount: measure
            });
        }
    }

    return (
        <aside className="md:w-80 bg-white border-r overflow-y-auto border-gray-200 p-8 w-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-bold text-xl text-gray-800">Ingredients</h1>
                <span className="text-purple-700 font-semibold text-xs bg-purple-50 px-2 py-1 rounded">
                    Scale(4x)
                </span>
            </div>

            <div className="space-y-4">
                {ingredientsList.map((item, index) => (
                    <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-100"
                    >
                        <span className="capitalize font-medium text-gray-700 text-sm">
                            {item.name}
                        </span>
                        <span className="text-purple-700 font-bold text-xs bg-white px-3 py-1 rounded-lg shadow-sm border border-purple-100">
                            {item.amount}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    );
}
