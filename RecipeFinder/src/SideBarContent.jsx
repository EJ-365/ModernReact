import { Heart, Share2 } from "lucide-react";
import Quickfacts from "./QuickFacts";
import Ingredients from "./Ingredients";
import Instructions from "./Instructions";

export default function SideBarContent({ recipe, toggle }) {
    return (
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors ${toggle ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            {/* image container */}
            <div className="relative">
                <img
                    src={recipe?.strMealThumb}
                    className="w-full h-64 md:h-96 object-cover object-center block rounded-2xl"
                    alt={recipe?.strMeal}
                />

                {/* text overlay */}
                <div className="absolute bottom-0 left-0 p-4 md:p-10 w-full bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
                    {/* labelling */}
                    <div className="flex items-center justify-start gap-3 my-4">
                        <button className="uppercase px-4 py-1 text-[10px] md:text-xs border border-gray-500 rounded-full bg-purple-700 text-white">
                            Dinner
                        </button>
                        <button className="uppercase px-4 py-1 text-[10px] md:text-xs rounded-full bg-[#393a3a] border border-gray-500 text-white">
                            {recipe?.strCategory}
                        </button>
                    </div>

                    {/* Recipe name and description */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 mb-4">
                        <h2 className="text-white font-bold md:text-5xl text-xl text-left capitalize mb-2">
                            {recipe?.strMeal}
                        </h2>
                        <p className="text-white/90 font-medium md:text-lg text-xs">
                            A classic {recipe?.strCategory} dish from {recipe?.strArea} cuisine.
                        </p>
                    </div>

                    {/* heart and share icon */}
                    <div className="flex gap-3 md:justify-end justify-center">
                        <span className="p-2 md:p-3 bg-[#212324] hover:bg-[#3d3e43] transition cursor-pointer border border-slate-700 rounded-full">
                            <Heart fill="white" color="white" size={16} />
                        </span>
                        <span className="p-2 md:p-3 bg-[#212324] hover:bg-[#3d3e43] transition cursor-pointer border border-slate-700 rounded-full">
                            <Share2 fill="white" color="white" size={16} />
                        </span>
                    </div>
                </div>
            </div>

            <Quickfacts recipe={recipe} toggle={toggle} />

            <div className={`w-full md:flex mt-8 rounded-2xl overflow-hidden border ${toggle ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
                <Ingredients recipe={recipe} toggle={toggle} />
                <Instructions recipe={recipe} toggle={toggle} />
            </div>
        </main>
    );
}
