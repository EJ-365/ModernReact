import { useState } from "react";

const Body = () => {
    const [quotes, setQuotes] = useState({});
    return (
        <main className="flex items-center justify-center flex-col h-screen w-full bg-orange-50">
            <div className="h-1/2 w-120 shadow-xl drop-shadow-[0_-4px_6px_rgba(0,0,0,0.1)]  align-middle  text-center p-10 flex items-center justify-center flex-col rounded-3xl  ">
                <div className="text-center">
                    <p className="text-md text-orange-500 font-semibold">Quote #1</p>
                </div>

                <div>

                    <blockquote className="">
                        <h1 className="text-3xl font-black text-orange-800 my-7 -tracking-normal leading-snug text-wrap">"People Must Learn To Hate And If They Can Learn To Hate, They Can Be Taught To Love."</h1>
                        <h3 className="font-bold text-xl text-center">Author:</h3>
                        <cite className="font-semibold italic text-md">—Ejay.E Gabriel</cite>
                    </blockquote>
                </div>
                <div className="mb-0">
                    <button className="text-xl my-8 px-4 py-2 rounded-2xl text-white cursor-pointer shadow-md hover:bg-orange-600 bg-orange-500 font-semibold"><i className="bx bx-refresh-cw mr-2 align-middle"></i>Generate Quote</button>
                </div>
            </div>
        </main>
    )
}

export default Body;