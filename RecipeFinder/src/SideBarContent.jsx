import { Heart, Share2 } from "lucide-react";
export default function SideBarContent({ firstRecipeName }) {
    return (
        <main className="flex-1 overflow-auto p-8">
            {/*image */}
            <div className="relative">
                <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1327&auto=format&fit=crop&ixlib=rb-4.0.3 " className="w-full h-96 object-cover object-center block" alt={firstRecipeName} />

                {/*text overlay */}
                <div className="absolute bottom-10 p-10">
                    {/* labelling */}
                    <div className="flex items-center justify-start space-x-3 my-6">
                        <button className="uppercase px-6 py-1 text-xs border border-gray-500  rounded-full bg-purple-700 text-white">Dinner</button>
                        <button className="uppercase px-6 py-1 text-xs rounded-full bg-[#393a3a] border border-gray-500 text-white">Vegtarian</button>
                    </div>

                    <h2 className="text-white font-blold text-5xl  text-nowrap text-left capitalize">{firstRecipeName}</h2>
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-slate-200 text-lg">A classic Italian comfort dish made with aborio rice, assorted wild mushrooms,
                            and a touch of white wine and parmesan.
                        </p>

                        {/* heart and share icon */}
                        <div className="flex space-x-3 mx-4">
                            <span className="p-2 bg-[#212324] hover:bg-[#3d3e43] transition duration-300 ease-in-out cursor-pointer border border-slate-700 rounded-full"><Heart fill="white" color="white" size={20} /></span>

                            <span className="p-2 bg-[#212324] hover:bg-[#3d3e43] transition duration-300 ease-in-out cursor-pointer border border-slate-700 rounded-full"><Share2 fill="white" color="white" size={20} /></span>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    )
}