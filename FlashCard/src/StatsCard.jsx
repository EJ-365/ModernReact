export default function StatsCard() {
  return (
    <section className="mt-10 flex md:items-center md:justify-evenly justify-start items-start flex-col md:flex-row px-8">
      <div className="uppercase text-start w-full shadow-sm ml-6 px-6 py-8 rounded-2xl mb-3">
        <p className="text-sm text-gray-500 font-semibold">Total cards</p>
        <h1 className="font-bold text-3xl">12</h1>
      </div>

      <div className="uppercase text-start w-full shadow-sm ml-6 px-6 py-8 rounded-2xl mb-3">
        <p className="text-sm text-gray-500 font-semibold">correct</p>
        <h1 className="font-bold text-3xl text-green-500">8</h1>
      </div>

      <div className="uppercase text-start w-full shadow-sm ml-6 px-6 py-8 rounded-2xl">
        <p className="text-sm text-gray-500 font-semibold">mastery</p>
        <div className="flex w-full ">
          <h1 className="font-bold text-3xl mr-4">12%</h1>
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: "66%" }}
          ></div>
        </div>
      </div>
    </section>
  );
}
