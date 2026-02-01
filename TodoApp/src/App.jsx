import AddTodoForm from "./AddTodoForm";
import { useState } from "react";
function App() {
 
  return (
    <main className="w-full h-screen  flex items-center justify-center bg-gray-100">
      <div className=" w-auto bg-white p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] ">
        {/* Title */}
        <div>
          <h1 className="font-bold text-2xl">My Todos</h1>
          <p className="text-sm text-gray-700 mt-1">Stay organized</p>
        </div>

        {/* filter selection */}
        <div className="my-6 capitalize flex items-center justify-start mx-2 space-x-8 bg-slate-200 px-2 py-1 rounded-xl ">
          <button
            
            className={`text-indigo-600 font-semibold py-1.5 px-12 bg-white shadow-sm rounded-sm cursor-pointer text-xs hover:bg-gray-50 duration-300 ease-in-out transition`}
          >
            {" "}
            All{" "}
          </button>

          <button
          
            className={`text-indigo-600 font-semibold py-1.5 px-12 bg-white shadow-sm rounded-sm cursor-pointer text-xs hover:bg-gray-50 duration-300 ease-in-out transition`}
          >
            {" "}
            active{" "}
          </button>

          <button
        
            className={`text-indigo-600 font-semibold py-1.5 px-12 bg-white shadow-sm rounded-sm cursor-pointer text-xs hover:bg-gray-50 duration-300 ease-in-out transition`}
          >
            {" "}
            completed{" "}
          </button>
        </div>

        {/*form component */}
        <AddTodoForm/>
      </div>
    </main>
  );
}

/**************************DO NOT ENTER************** */
export default App;
