import React, { useState } from "react";

export default function Header() {
  const [select, setSelect] = useState("math");

  return (
    <header className="bg-white shadow-md pb-2">
      <nav className={`py-3 mx-4 flex items-center justify-between`}>
        {/* logo */}
        <div className="flex items-center justify-start">
          <i class="bx bx-card-view-small p-2 w-1/2 h-1/2 mr-2 text-2xl rounded-2xl text-white bg-purple-700" />
          <span className="text-xl font-bold">FlashQuiz</span>
        </div>

        {/* links */}

        <div className={`flex flex-col justify-center items-center`}>
          {/* title: category, amount  */}
          <div
            className={`uppercase text-gray-400 text-xs flex items-center justify-between w-60 mr-60 text-center ml-10 mb-1.5`}
          >
            <p className="text-center font-semibold">Category</p>
            <p className="text-center font-semibold">Amount</p>
          </div>

          {/* form selection*/}
          <form action="" className={`text-sm flex  gap-4 w-full`}>
            <select
              className={`px-2 py-1 w-auto bg-gray-100 rounded-xl border outline-none m-0 ring`}
              value={select}
              onChange={(event) => setSelect(event.target.value)}
            >
              <option value="science">Science</option>
              <option value="math">Math</option>
              <option value="general knowlege">General Knowlege</option>
            </select>

            <div className="flex">
              <input
                type="text"
                className={`border ring rounded-md text-start px-4 py-1 w-auto outline-none bg-gray-100 focus:ring focus:ring-purple-700`}
                value={10}
              />
              <button className="px-8 mx-2 py-2 border bx  hover:bg-purple-800 duration-300 ease-in-out transition cursor-pointer bg-purple-600 rounded-lg text-white">
                Generate <i class="bx bx-bolt text-xl align-middle " />
              </button>
            </div>
          </form>
        </div>
      </nav>
    </header>
  );
}
