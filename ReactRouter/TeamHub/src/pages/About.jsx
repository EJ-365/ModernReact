function About() {
  return (
    <section className="bg-gray-100 dark:bg-slate-950">
      {/* image overlay cta */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen before:absolute before:w-full before:h-full before:inset-0 before:bg-black before:opacity-50 before:z-1">
        <div className="w-full h-[420px] bg-center bg-cover bg-no-repeat bg-[url('https://wallpapercave.com/wp/wp4624908.jpg')]" />
        {/*overlay text */}
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center justify-center text-center my-3">
            <p className="uppercase font-medium bg-white/20 backdrop-blur-3xl border border-gray-50 rounded-3xl px-3 md:text-sm mt-3 text-xs">
              est. 2010
            </p>
            <h1 className="md:text-6xl text-3xl font-bold capitalize mt-3">
              More Than Just a club
            </h1>
            <p className="md:text-xl my-6 text-white">
              Building champions on and off the field through dedication,
              teamwork, and an unwavering passion for the beautiful game.
            </p>
          </div>
        </div>
      </div>

      {/* our history */}
      <div className="flex flex-col lg:flex-row items-center lg:justify-start lg:mx-auto my-20 justify-center px-4 md:px-8">
        <div className="flex flex-col items-center lg:justify-start md:mb-20">
          <h1 className="capitalize text-3xl font-bold">our history</h1>
          {/* violet line beneath it */}
          <p className="w-14 h-1 bg-violet-500 rounded-md md:mt-1 md:mb-0 mb-10" />
          {/* image div*/}
          <div className="md:my-6 lg:w-64 w-full mx-10  md:mb-auto mb-7">
            <img
              className="lg:w-64 w-full rounded-md border border-gray-200 dark:border-white/10 shadow-xs"
              src="https://media.istockphoto.com/id/1336646871/photo/teenagers-practicing-soccer-in-sports-field.jpg?s=612x612&w=0&k=20&c=rFQShDrheD1dCvodjP2gk0eU_YaMaB6I8VNr86uuGx8="
              alt="children playing soccer"
            />
          </div>
        </div>

        {/* text content */}
        <div className="lg:w-1/2 w-full md:mt-10">
          <div className="text-[16px]">
            <p>
              Founded in 2010,{" "}
              <span className="font-bold text-violet-800">Team Hub</span>{" "}
              started as a small community project to bring local youth together
              through soccer. What began as informal weekend kickabouts in the
              local park quickly transformed into a movement fueled by the
              community's desire for structured athletic development.
            </p>

            <p className="my-5">
              Over the years, we have grown into a premier development academy,
              fostering talent and sportsmanship across all age groups. our
              journey has been defined by passion, resilience, and an unwavering
              commitment to the beautiful game. Today, we proudly host over 15
              competitive squads and serve hundreds of families in the region.
            </p>
          </div>

          {/* stats */}
          <div className="flex items-center justify-center md:gap-12 gap-10 border-t border-gray-300 p-2 mt-10 ">
            <div className=" flex-col ">
              <p className="md:text-3xl text-lg font-extrabold text-violet-800">
                12+
              </p>
              <small className="capitalize text-gray-700 dark:text-slate-300 font-semibold text-xs">
                years active
              </small>
            </div>

            <div className=" flex-col">
              <p className="md:text-3xl text-lg  font-extrabold text-violet-800">
                500+
              </p>
              <small className="capitalize text-gray-700 dark:text-slate-300 font-semibold text-xs">
                players trained
              </small>
            </div>

            <div className=" flex-col">
              <p className="md:text-3xl text-lg font-extrabold text-violet-800">
                15
              </p>
              <small className="capitalize text-gray-700 dark:text-slate-300 font-semibold text-xs">
                championships
              </small>
            </div>
          </div>
        </div>
      </div>

      {/*Quote */}
      <div className="items-center flex justify-center flex-col my-10">
        <i class="bxf bx-quote-right md:text-4xl text-2xl text-violet-600 " />
        <blockquote className="md:w-180 text-center">
          <h2 className="md:text-3xl text-lg md:font-extrabold font-semibold my-3">
            "Football is played with your head. Your legs are just the tools.”
          </h2>
          <footer className="uppercase md:font-semibold text-violet-600">
            — <cite>club philosophy</cite>
          </footer>
        </blockquote>
      </div>

      {/*our missions and core values */}
      {/* core missions */}
      <div className="flex lg:space-x-12 space-x-4 justify-center mt-24 mb-16 md:flex-row flex-col items-center md:items-stretch ">
        <div className="border border-gray-200 dark:border-white/10 w-100 p-8 rounded-md shadow-sm my-10 md:my-0 bg-white dark:bg-slate-900">
          <i class="bxf bx-flag-alt text-2xl bg-violet-200 p-3 rounded-xl text-violet-700" />
          <h2 className="capitalize font-bold text-2xl mt-3">our mission</h2>
          <div className="my-4 text-wrap">
            <p className="text-[17px]">
              To provide an inclusive environment where young athletes can
              develop their soccer skills, build character, and learn the value
              of teamwork. We strive to create not just better players, but
              better people who contribute positively to their communities.
            </p>
          </div>
          <ul>
            <li className="text-[17px]">
              <i className="bxf bx-check-circle text-xl  align-middle mr-3 text-violet-800" />
              Comprehensive youth development programs
            </li>
            <li className="text-[17px] my-3">
              <i className="bxf bx-check-circle text-xl  align-middle mr-3 text-violet-800" />
              Community outreach and engagement
            </li>
            <li className="text-[17px]">
              <i className="bxf bx-check-circle text-xl  align-middle mr-3 text-violet-800 text-start" />
              Pathways to collegiate and professional levels
            </li>
          </ul>
        </div>

        {/* our values */}
        <div className="border border-gray-200 dark:border-white/10 w-100 p-8 rounded-md shadow-sm bg-white dark:bg-slate-900">
          <i class="bxf bx-diamond-alt text-2xl bg-violet-200 p-3 rounded-xl text-violet-700" />
          <h2 className="capitalize font-bold text-2xl mt-3">our values</h2>
          <ul>
            <li className="text-lg font-bold flex items-center mt-6">
              <div className=" w-2 h-2 p-1 rounded-full bg-violet-800 mx-2 " />
              <h3>Integrity</h3>
            </li>
            <div className="flex items-center justify-center mx-3">
              <div className="w-[5px] h-18 bg-gray-200 rounded-xl md:mx-0 mx-2" />

              <div>
                <p className="font-normal text-[16px] my-2 md:ml-4">
                  We believe in fair play, honesty, and respecting opponents and
                  officials at all times.
                </p>
              </div>
            </div>

            <li className="text-lg font-bold flex items-center mt-6">
              <div className=" w-2 h-2 p-1 rounded-full bg-violet-800 mx-2 " />
              <h3 className="capitalize">teamwork</h3>
            </li>
            <div className="flex items-center justify-center mx-3">
              <div className="w-[5px] h-18 bg-gray-200 rounded-xl md:mx-0 mx-2" />

              <div>
                <p className="font-normal text-[16px] my-2 md:ml-4">
                  Success is a collective effort. We support each other on and
                  off the pitch.
                </p>
              </div>
            </div>

            <li className="text-lg font-bold flex items-center mt-6">
              <div className=" w-2 h-2 p-1 rounded-full bg-violet-800 mx-2 " />
              <h3 className="capitalize">passion</h3>
            </li>
            <div className="flex items-center justify-center mx-3">
              <div className="w-[5px] h-18 bg-gray-200 rounded-xl md:mx-0 mx-2" />

              <div>
                <p className="font-normal text-[16px] my-2 md:ml-4">
                  We play with heart and enthusiasm, inspiring those around us
                  with our love for the game.
                </p>
              </div>
            </div>
          </ul>
        </div>
      </div>

      {/* life at team hub and view full gallery */}
      <div className="my-20">
        <div className="flex items-center justify-evenly my-8">
          <h3 className="md:text-2xl text-lg font-bold">Life at Team Hub</h3>
          <p className="md:font-bold text-violet-800 capitalize">
            view full gallery{" "}
            <i className="bx bx-arrow-right text-xl font-semibold align-middle" />
          </p>
        </div>
        {/* images */}
        <div className="flex items-center md:space-x-10 justify-center  md:flex-row flex-col">
          <div className="md:my-0 my-7">
            <img
              className="md:w-46 w-full rounded-lg"
              src="/Images/soccer-ball.png"
              alt=""
            />
          </div>

          <div className="md:my-0 my-7">
            <img
              className="md:w-46 w-full rounded-lg"
              src="/Images/kids-playing-soccer-cartoon.jpg"
              alt=""
            />
          </div>

          <div className="md:my-0 my-7">
            <img
              className="md:w-46 w-full rounded-lg"
              src="/Images/player-praying-image.jpg"
              alt=""
            />
          </div>
          <div className="md:w-46 w-full cursor-pointer bg-violet-200 h-46 flex-col justify-center flex items-center rounded-lg ">
            <i class="bxf bx-camera-alt text-3xl text-center text-violet-900" />
            <p className="text-violet-800 font-medium">Join the action</p>
          </div>
        </div>

        {/* CTA: ready to be part of the theme */}
        <div className="bg-violet-200 text-center my-24 lg:w-250 mx-auto p-8 rounded-xl shadow-xs">
          <h2 className="font-bold lg:text-3xl text-xl my-3">Ready to be part of the team?</h2>
          <p className="text-wrap lg:w-1/2 text-center lg:mx-auto text-zinc-900 dark:text-slate-200 font-normal">
            Whether you are looking to join a competitive squad or just starting
            out, we have a place for you at Team Hub.
          </p>
          <div className="flex space-x-6 my-4 justify-center items-center">
            <button className="font-medium shadow-sm bg-violet-900 text-white capitalize lg:px-10 px-6 py-2 rounded-md cursor-pointer hover:bg-violet-800 duration-300 ease-in-out text-sm lg:text-normal text-nowrap lg:text-wrap">
              Join team hub{" "}
              <i className="bx bx-arrow-right text-lg font-light align-middle text-white" />
            </button>
            <button className="font-bold bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm  capitalize lg:px-10 px-6 cursor-pointer py-2 rounded-md text-sm lg:text-normal text-nowrap lg:text-wrap">
              contact us{" "}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
export default About;
