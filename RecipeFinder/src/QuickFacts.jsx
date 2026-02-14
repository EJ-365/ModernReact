import { ClockIcon, Servings, Category, Origin } from "./icon"

export default function Quickfacts({ recipe, toggle }) {
    return (
        <section className="my-20 flex items-center space-x-7 justify-center gap-2 container">
            {/* Cooking Time Card */}
            {/* Cooking Time Card */}
            <div
                style={{
                    backgroundColor: toggle ? '#111827' : '#ffffff',
                    color: toggle ? '#ffffff' : '#111827',
                    borderColor: toggle ? '#374151' : '#e5e7eb'
                }}
                className="uppercase m-0 flex items-center flex-col w-72 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md border"
            >
                <ClockIcon />
                <p
                    style={{ color: toggle ? '#ffffff' : '#9ca3af' }}
                    className="text-xs my-1"
                >
                    cooking time
                </p>
                <p className="text-xs font-semibold capitalize">{recipe?.cookingTime} mins</p>
            </div>

            {/* Servings Card */}
            <div
                style={{
                    backgroundColor: toggle ? '#111827' : '#ffffff',
                    color: toggle ? '#ffffff' : '#111827',
                    borderColor: toggle ? '#374151' : '#e5e7eb'
                }}
                className="uppercase m-0 flex items-center flex-col w-72 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md border"
            >
                <Servings />
                <p
                    style={{ color: toggle ? '#ffffff' : '#9ca3af' }}
                    className="text-xs my-1"
                >
                    servings
                </p>
                <p className="text-xs font-semibold capitalize">2-4 people</p>
            </div>

            {/* Category Card */}
            <div
                style={{
                    backgroundColor: toggle ? '#111827' : '#ffffff',
                    color: toggle ? '#ffffff' : '#111827',
                    borderColor: toggle ? '#374151' : '#e5e7eb'
                }}
                className="uppercase m-0 flex items-center flex-col w-72 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md border"
            >
                <Category />
                <p
                    style={{ color: toggle ? '#ffffff' : '#9ca3af' }}
                    className="text-xs my-1"
                >
                    category
                </p>
                <p className="text-xs font-semibold uppercase">{recipe?.strCategory}</p>
            </div>

            {/* Origin Card */}
            <div
                style={{
                    backgroundColor: toggle ? '#111827' : '#ffffff',
                    color: toggle ? '#ffffff' : '#111827',
                    borderColor: toggle ? '#374151' : '#e5e7eb'
                }}
                className="uppercase m-0 flex items-center flex-col w-72 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md border"
            >
                <Origin />
                <p
                    style={{ color: toggle ? '#ffffff' : '#9ca3af' }}
                    className="text-xs my-1"
                >
                    origin
                </p>
                <p className="text-xs font-semibold capitalize">{recipe?.strArea}</p>
            </div>

        </section>
    )
}