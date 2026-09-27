function Header() {
  return (
    <header className="xl:container xl:mx-auto xl:p-2  p-2.5 overflow-x-hidden">
      <div className="flex xl:flex-row flex-col xl:justify-evenly justify-start items-left mt-4">
        <div>
          <h1 className="xl:text-6xl font-extrabold text-3xl xl:m-0 mx-7 text-wrap">
            Fuel prices at a glance.
          </h1>
        </div>

        <div className=" flex xl:items-center items-left xl:mx-3 xl:justify-center  justify-start xl:p-2 xl:text-sm ml-4 text-xs text-nowrap xl:mt-0 mt-4">
          <span className="ml-1 rounded-full  px-3  py-1.5 bg-[#161a1d] text-slate-300 xl:font-semibold">
            {" "}
            <i className="h-2 w-2 bg-green-600 rounded-full inline-block mr-2 items-align-middle" />
            UI preview
          </span>
          <p className="mx-3 rounded-full  px-3 py-1.5 bg-[#f5d34f] xl:font-semibold text-black">
            Sample data
          </p>
        </div>
      </div>

      {/* Country name: and nav links */}

      <div className="flex items-center xl:justify-between justify-evenly  border  xl:mt-14 mt-8 p-2 rounded-2xl border-gray-900 bg-[#2c343a]/10  ">
        <div className="xl:flex items-center">
          <i className="bx bx-location mx-4 text-[28px] mt-3 xl:mt-0 text-gray-400" />
          <div>
            <p className="font-semibold xl:text-lg text-gray-300">United States</p>
            <small className="text-slate-300 font-semibold xl:text-sm">Weekly retail average</small>
          </div>
        </div>

        <div className=" flex items-center ">
          <button className="border px-4 py-2 rounded-xl font-semibold xl:text-base text-xs bg-white text-black ">
            Regular
          </button>
          <button className="border px-4 py-2 rounded-xl font-semibold bg-[#161a1d] text-slate-300 xl:mx-0.5  xl:text-base text-xs mx-1">
            Midgrade
          </button>

          <button className="border px-4 py-2 rounded-xl font-semibold bg-[#161a1d] text-slate-300  xl:text-base text-xs ">
            Diesel
          </button>
        </div>
      </div>
    </header>
  );
}
export default Header;
