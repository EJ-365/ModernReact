import {ClockIcon, Servings, Category, Origin} from "./icon"

export default function Quickfacts({recipe}) {
 return (
        <section className=" my-20 flex items-center space-x-7 justify-center gap-2 container">
            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <ClockIcon/>
                <p className="text-xs text-gray-700 my-1">Cooktime</p>
                <p className="text-xs font-semibold capitalize">{recipe?.cookingTime} mins</p>
            </div>


            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <Servings/>
                <p className="text-xs text-gray-700 my-1">servings</p>
                <p className="text-xs font-semibold capitalize">2-4 people</p>
            </div>
     
            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <Category/>
                <p className="text-xs text-gray-700 my-1">category</p>
                <p className="text-xs font-semibold uppercase">{recipe?.strCategory}</p>
            </div>
 
            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <Origin/>
                <p className="text-xs text-gray-700 my-1">origin</p>
                <p className="text-xs font-semibold capitalize">{recipe?.strArea}</p>
            </div>
        </section>
    )
}