import { Heart, Share2 } from "lucide-react";
import Quickfacts from "./QuickFacts";
import Ingredients from "./Ingredients";
import Instructions from "./Instructions";
export default function SideBarContent({ recipe }) {

    return (
        <main className="flex-1 overflow-auto p-8 bg-white ">
            {/*image */}
            <div className="relative">
                <img src={recipe?.strMealThumb} className="w-full h-96 object-cover object-center block" alt={recipe?.strMeal} />

                {/*text overlay */}
                <div className="absolute bottom-10 p-10">
                    {/* labelling */}
                    <div className="flex items-center justify-start space-x-3 my-6">
                        <button className="uppercase px-6 py-1 text-xs border border-gray-500  rounded-full bg-purple-700 text-white">Dinner</button>
                        <button className="uppercase px-6 py-1 text-xs rounded-full bg-[#393a3a] border border-gray-500 text-white">Vegtarian</button>
                    </div>

                    <h2 className="text-purple-950 opacity-80 md:font-bold font-black md:text-5xl text-2xl text-nowrap text-left capitalize md:my-4">{recipe?.strMeal}</h2>
                    <div className="md:flex items-center md:justify-between justify-center ">
                        <p className="text-gray-900 font-semibold md:text-lg text-xs">A classic {recipe?.strCategory} dish from {recipe?.strArea} cuisine.
                        </p>

                        {/* heart and share icon */}
                        <div className="flex space-x-3 mx-4 md:justify-end md:ml-90 justify-center md:my-0 mt-10  ">
                            <span className="p-3 bg-[#212324] hover:bg-[#3d3e43] transition duration-300 ease-in-out cursor-pointer border border-slate-700 rounded-full"><Heart fill="white" color="white" size={18} /></span>

                            <span className="p-3 bg-[#212324] hover:bg-[#3d3e43] transition duration-300 ease-in-out cursor-pointer border border-slate-700 rounded-full"><Share2 fill="white" color="white" size={18} /></span>
                        </div>
                    </div>
                </div>
            </div>
            {/*Quick facts information */}
            <Quickfacts recipe={recipe} />

            {/*Ingredients and instructions */}
            <div className="h-screen w-full bg-gray-100 md:flex">
                <Ingredients  recipe={recipe}/>

                {/*Instructions */}
                <Instructions recipe ={recipe} />
            </div>
        </main>
    )
}