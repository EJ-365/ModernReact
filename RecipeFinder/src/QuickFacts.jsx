import {ClockIcon, Servings, Calories, Cost} from "./icon"

export default function Quickfacts() {
 return (
        <section className=" my-20 flex items-center space-x-7 justify-center gap-2 container">
            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <ClockIcon/>
                <p className="text-xs text-gray-700 my-1">Cooktime</p>
                <p className="text-xs font-semibold capitalize">25 mins</p>
            </div>


            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <Servings/>
                <p className="text-xs text-gray-700 my-1">servings</p>
                <p className="text-xs font-semibold capitalize">4 people</p>
            </div>
     
            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <Calories/>
                <p className="text-xs text-gray-700 my-1">calories</p>
                <p className="text-xs font-semibold uppercase">420 kcal</p>
            </div>
 
            <div class="uppercase m-0 flex items-center flex-col border w-72 bg-slate-100 border-gray-200 hover:bg-slate-50 transition ease-in-out duration-300 cursor-pointer py-5 rounded-md">
               <Cost/>
                <p className="text-xs text-gray-700 my-1">cost</p>
                <p className="text-xs font-semibold capitalize">$$</p>
            </div>
        </section>
    )
}