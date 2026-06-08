import { projectsData } from "../Data/projects";
function Project() {
  return (
    <section className="dark:bg-black py-20 dark:text-white">
      <div className="flex md:items-start items-center md:justify-start justify-center flex-col my-20 md:mx-20 mx-10 border-b border-b-gray-300 dark:border-b-gray-900 ">
        <div className="my-4">
          <h1 className="capitalize md:text-5xl text-2xl font-space font-semibold md:w-150 w-auto">
            selected technical projects.
          </h1>
        </div>
        <div className="md:w-160 md:text-lg text-sm mt-3 mb-10">
          <p>
            A focused collection of engineering work prioritizing performance,
            accessibility, and functional minimalism.
          </p>
        </div>
      </div>

      {/*listing all projects */}
      <div className="ml-15">
        {projectsData.map((project) => (
          <div className="flex md:flex-row flex-col items-center justify-between mr-20 md:border-b border-gray-300 dark:border-gray-900 my-16 md:my-0">
            {/* text content */}
            <div className="md:py-18 md:px-20 py-8 text-center md:text-left ">
              <h3 className="md:text-3xl font-space font-bold my-3 text-2xl">
                {project.title}
              </h3>
              <p className="my-7 md:text-[1rem] text-sm">{project.desc}</p>
              <div className="md:space-x-4 flex items-center xs:justify-center space-x-4 text-nowrap md:flex-none">
                {project.tools.map(tool => (
                    <span className="px-2 py-1 bg-gray-100 font-inter md:font-medium  md:text-sm text-[13px] capitalize dark:text-black">{tool}</span>
                ))}
              </div>
            </div>
            {/* links */}
            <div className="md:space-x-4 ">
               <a href={project.live} className="capitalize text-sm">Live preview <i class="bx bx-arrow-up-right-stroke text-xl align-middle font-thin " /></a>
               <div className="w-30 h-0.5 bg-black"/>
               <a href={project.github} className="text-sm">Github Repository <i className="bx bx-chevrons-left-right align-middle text-xl font-thin font-mono ml-1" /></a>
               <div className="w-43 h-0.5 bg-black"/>
            </div>
          </div>
        ))}
      </div>
     
       <div className="flex flex-col items-center py-30 my-50 border md:w-3/4 bg-gray-100 dark:bg-black border-gray-300 dark:border-gray-900 shadow-xs md:mx-auto w-full">
        <h3 className="font-semibold md:text-4xl text-2xl mb-6 text-center">Intrested in Collaboration?</h3>
        <p className="my-0 md:w-120 text-center text-gray-700 dark:text-white text-normal">
        Currently looking for Front-End Internship opportunities for
        Summer 2024. Let's build something precise.
        </p>
        <button className=" dark:bg-white bg-black dark:text-black cursor-pointer  text-white px-10 py-3.5 mt-10  hover:bg-black/95 dark:hover:bg-white/95 font-semibold">Get in touch</button>
      </div>
    </section>
  );
}

export default Project;
