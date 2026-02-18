export default function StatsCard({toggle}) {
  return (
    <section className={` ${toggle ? "text-white" : "text-black"} mt-10 flex md:items-center md:justify-evenly justify-center items-center flex-col md:flex-row md:px-8 px-10`}>
      <div className={` ${toggle ? "bg-white/80 text-gray-800" : "bg-white"} uppercase text-start w-full shadow-sm md:ml-6 px-6 py-8 rounded-2xl mb-3 `}>
        <p className="text-sm text-gray-500 font-semibold">Total cards</p>
        <h1 className="font-bold text-3xl">12</h1>
      </div>

      <div className={` ${toggle ? "bg-white/80 text-green-600" : "bg-white text-green-500"} uppercase text-start w-full shadow-sm md:ml-6 px-6 py-8 rounded-2xl mb-3  `}>
        <p className="text-sm text-gray-500 font-semibold">correct</p>
        <h1 className="font-bold text-3xl ">8</h1>
      </div>

      <div className={` ${toggle ? "bg-white/80 text-gray-800" : "bg-white"} uppercase text-start w-full shadow-sm md:ml-6 px-6 py-8 rounded-2xl `}>
        <p className="text-sm text-gray-500 font-semibold">mastery</p>
        <div className="flex w-full ">
          <h1 className="font-bold text-3xl mr-4">66%</h1>
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: "66%" }}
          ></div>
        </div>
      </div>
    </section>
  );
}
