export default function Ingredients({ recipe, toggle }) {
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
        <aside className={`md:w-80 border-r overflow-y-auto p-8 w-full transition-colors ${toggle ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-800"}`}>
            <div className="flex items-center justify-between mb-8">
                <h1 className={`font-bold text-xl ${toggle ? "text-white" : "text-gray-800"}`}>Ingredients</h1>
                <span className="text-purple-700 font-semibold text-xs bg-purple-50 px-2 py-1 rounded">
                    Scale(4x)
                </span>
            </div>

            <div className="space-y-4">
                {ingredientsList.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors border ${toggle ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-gray-50 border-transparent hover:bg-purple-50"}`}
                    >
                        <span className={`capitalize font-medium text-sm ${toggle ? "text-gray-200" : "text-gray-700"}`}>
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
