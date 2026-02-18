export default function Header({toggle, setToggle, select, setSelect, amount, setAmount}) {
  return (
    <header className={`${toggle ? "bg-zinc-900" : "bg-white"} shadow-md pb-2 w-full md:p-0 `}>
      <nav className={`py-3 md:mx-4 flex items-center md:justify-between flex-col md:flex-row justify-center md:m-auto sm:mx-1`}>
        {/* logo */}
        <div className="flex items-center justify-start mb-4">
          <i className="bx bx-card-view-small p-2 w-1/2 h-1/2 mr-2 md:text-2xl rounded-2xl text-white bg-purple-700" />
          <span className={`${toggle ? "text-white" : "text-black"} md:text-xl font-bold`}>FlashQuiz</span>
        </div>

        {/* links */}
        <div className={`flex flex-col w-full md:w-auto px-6 `}>
          {/* form selection*/}
          <form action="" className={`text-sm flex gap-4 md:w-auto w-full flex-col md:flex-row`}>
            <select
              className={`md:px-2 md:py-1 md:w-auto py-1.5 bg-gray-100 rounded-md border outline-none m-0 ring cursor-pointer w-full`}
              value={select}
              onChange={(event) => setSelect(event.target.value)}
            >
              <option value="science">Science</option>
              <option value="math">Math</option>
              <option value="general knowlege">General Knowlege</option>
            </select>

            <div className="flex w-full">
              <input
                type="text"
                className={`border ring rounded-md text-start md:px-4 p-1 md:w-auto w-full outline-none bg-gray-100 focus:ring focus:ring-purple-700`}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                placeholder="10"
              />
              <button className="md:px-8 px-2 md:mx-2 ml-2 md:py-2 py-1 border md:font-bold hover:bg-purple-800 duration-300 ease-in-out transition cursor-pointer bg-purple-600 rounded-lg text-white flex items-center">
                Generate 
                <i className="bxf bx-bolt hidden md:inline-block ml-1 text-lg"></i>
              </button>
              
              {/* light and dark mode */}
              <div className="ml-2">
                <i 
                  className={`bxf ${toggle ? "bx-sun" : "bx-moon"} align-middle text-xl p-2 bg-gray-200 hover:bg-gray-300 rounded-full cursor-pointer`} 
                  onClick={() => setToggle(!toggle)} 
                  title={toggle ? "Switch light mode" : "Switch dark mode"}
                />
              </div>
            </div>
          </form>
        </div>
      </nav>
    </header>
  );
}
