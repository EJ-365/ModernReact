import featuredData from "./featuredData";

export default function Featured() {
  return (
    <section>
      <div className="text-white flex md:flex-row items-center md:justify-between md:mx-auto p-10 flex-col my-3 ">
        <p className="text-2xl font-bold">Featured Courses</p>
        <a href="#" className="text-[#dd6713] capitalize text-sm md:text-lg ">
          View all coures {"->"}
        </a>
      </div>

      {/*// Changed to grid for iPad (md:grid-cols-2) and flex for desktop
        (lg:flex-row) */}

      <div className="text-white grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row justify-center items-center gap-2 my-10 px-4">
        {featuredData.map((item) => (
          <FeaturedCards key={item.id} cards={item} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCards({ cards }) {
  return (
    // Changed w-92 to w-full max-w-sm so it fits the grid
    <div className="border border-zinc-700 w-full max-w-sm p-6 rounded-2xl shadow-lg bg-zinc-800 opacity-65 md:mx-2 mt-5 cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all duration-300 ">
      <div>
        {/* Changed w-64 to w-full and added h-48 object-cover to keep it consistent */}
        <img
          className="w-full h-48 rounded-lg object-cover"
          src={cards.image}
          alt={cards.title}
        />
      </div>

      {/* rating */}
      <p className="mt-3 flex items-center">
        <i className="bx bx-star mr-2 text-[#dd6713]"></i>
        {cards.rating}
      </p>

      {/* title */}
      <h2 className="text-xl font-semibold my-3 h-14 line-clamp-2">
        {cards.title}
      </h2>

      {/* description */}
      <p className="text-zinc-400 text-sm h-12 line-clamp-2">
        {cards.description}
      </p>

      {/* instructor and enroll button */}
      <div className="flex justify-between items-center mt-5">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={cards.instructorImage}
            alt={cards.instructor}
          />
          <span className="text-sm font-medium text-zinc-400">
            {cards.instructor}
          </span>
        </div>
        <button className="font-semibold px-4 py-1 bg-[#dd6713] rounded-full cursor-pointer hover:bg-[#c45a11] transition-colors">
          Enroll
        </button>
      </div>
    </div>
  );
}
