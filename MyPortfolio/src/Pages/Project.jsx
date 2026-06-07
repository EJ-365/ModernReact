import { projectsData } from "../Data/projects";
function Project() {
  return (
    <section className="dark:bg-black py-20 dark:text-white">
      <div className="flex md:items-start items-center md:justify-start justify-center flex-col my-20 md:mx-20 mx-10 border-b border-b-gray-300 dark:border-b-gray-900 ">
        <div className="my-4">
          <h1 className="capitalize md:text-6xl text-2xl font-space font-semibold md:w-150 w-auto">
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
      <div >
        {projectsData.map((project) => (
          <div className="flex md:flex-row flex-col items-center justify-between mr-20 border-b border-gray-300 dark:border-gray-900">
            {/* text content */}
            <div className="py-18 px-20 ">
              <h3 className="text-3xl font-space font-bold my-3">
                {project.title}
              </h3>
              <p className="my-7">{project.desc}</p>
              <div className="space-x-4">
                {project.tools.map(tool => (
                    <span className=" px-2 py-1 bg-gray-100 font-inter font-medium text-sm capitalize dark:text-black">{tool}</span>
                ))}
              </div>
            </div>
            {/* links */}
            <div className="space-x-4">
               <a href={project.live} className="capitalize text-sm">Live preview <i class="bx bx-arrow-up-right-stroke text-xl align-middle font-thin " /></a>
               <div className="w-30 h-0.5 bg-black"/>
               <a href={project.github} className="text-sm">Github Repository <i className="bx bx-chevrons-left-right align-middle text-xl font-thin font-mono ml-1" /></a>
               <div className="w-43 h-0.5 bg-black"/>
            </div>
          </div>
        ))}
      </div>
      {/* stop here: still needs little refurbish on mobile screen */}
    </section>
  );
}

export default Project;
