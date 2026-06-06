function About() {
  const sampleImageURl = `https://placehold.net/400x600.png`;
  return (
    <section className="flex flex-col justify-start items-center gap-10 md:grid md:grid-cols-2 md:justify-center md:gap-10 w-full min-h-screen dark:bg-black dark:text-white px-6 py-12 md:px-10 md:py-16 lg:px-16 xl:px-0 xl:gap-0 overflow-hidden">
      {/*image div */}
      <div className="w-full">
        <div className="md:w-full">
          <img
            src={sampleImageURl}
            alt="profile-picture"
            className="mx-auto w-full max-w-72 md:mx-0 md:w-80 md:max-w-none md:h-110 lg:w-100 lg:h-130 xl:ml-140"
          />
        </div>
      </div>

      {/* text content div */}
      <div className="w-full md:ml-0 lg:ml-10 xl:ml-20">
        <div>
          <div className="flex items-center space-x-4">
          <p className="uppercase text-xs font-semibold text-purple-800  dark:text-purple-300 font-inter my-8 tracking-widest">
            about me
          </p>
          <div className="w-16 h-0.5 bg-purple-200"/>
          </div>
          <h3 className="text-4xl font-semibold md:text-5xl"> Front-End </h3>
          <h3 className="text-3xl text-gray-600 font-semibold dark:text-white/80 md:text-[40px]">Intern</h3>
          <div className="mt-4 mb-12">
            <p className="w-full max-w-xl md:w-full lg:w-120 xl:w-130">
              I'am dedicated to crafting high-performance interfaces through the
              lens of clean, architectural code. My focus lies in bridging the
              gap. between rigorous technical implementation and seamless,
              intuitive user experiences.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 dark:text-black md:gap-4">
            <button className="text-xs capitalize px-3 py-1 border text-center font-medium bg-gray-100 shadow-xs border-gray-200"> <i className="bx bx-chevrons-left-right align-middle text-xl font-thin font-mono mx-1" />clean architecture</button>

            <button className="text-xs  px-3 py-1 border text-center font-medium bg-gray-100 shadow-xs border-gray-200"> <i className="bx bx-cursor-click align-middle text-sm font-thin font-mono mx-1" />ux Centric</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
