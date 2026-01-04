import browseCategoryData from "./browseCategoryData";
export default function BrowseByCategory() {
  return (
    <section className=" border-y border-zinc-800 md:my-10 px-8">
      <h2 className="font-bold text-2xl text-white  mt-20 md:ml-40 md:text-left text-center ">
        Browse by Category
      </h2>
      <div className="lg:flex items-center lg:justify-start lg:flex-wrap lg:flex-row md:grid md:grid-cols-2 my-10 md:ml-36  ">
        {browseCategoryData.map((item) => (
          <Cards key={item.id} cards={item} />
        ))}
      </div>
    </section>
  );
}

function Cards({ cards }) {
  return (
    <div className="text-white border px-12 py-4 my-4 md:w-auto rounded-3xl md:mx-2 bg-zinc-800 brightness-75 border-zinc-700 cursor-pointer hover:brightness-90 hover:scale-[1.02] transition-all duration-300 ">
      <i className={`${cards.icon} text-4xl text-[#dd6713] my-2`}></i>
      <h4 className="font-bold text-lg">{cards.title}</h4>
      <p className="text-sm text-zinc-500 my-2">{cards.description}</p>
    </div>
  );
}
