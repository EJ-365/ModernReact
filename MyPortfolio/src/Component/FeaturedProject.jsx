import { featuredProjectData } from "../Data/featuredProject";
const primaryFeaturedProjects = featuredProjectData.slice(0, 2);
const restOfFeaturedProject = featuredProjectData.slice(2);
function FeaturedProject() {
  return (
    <section>
      <div className="px-6 py-10 md:px-24 md:py-15">
        <span className="uppercase font-mono text-xs tracking-[4px] font-bold text-neutral-500 dark:text-neutral-400">
          portfolio
        </span>
        <h3 className="capitalize text-3xl font-bold md:text-5xl">Featured Projects</h3>
      </div>

      {/* projects */}
      <div className="flex flex-col items-stretch gap-4 px-6 md:px-20 lg:flex-row">
        {primaryFeaturedProjects.map((featured, index) => (
          <div
            key={featured.title}
            className={`my-4 w-full border border-gray-200 bg-gray-100/70 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950 md:p-10 ${index === 0 ? "lg:flex-1" : "lg:w-100"}`}
          >
            <ul className="my-3 flex flex-wrap justify-start gap-3">
              {featured.tools.map((tool) => (
                <li key={tool} className="mb-3">
                  <button className="capitalize bg-gray-200/70 text-gray-500 px-3 py-0.2 text-base font-mono font-medium dark:bg-neutral-800 dark:text-neutral-300">
                    {tool}
                  </button>
                </li>
              ))}
            </ul>
            <div>
              <h4 className={`font-space my-4 ${index === 0 ? "text-3xl font-bold" : "text-xl font-medium"}`}>{featured.title}</h4>
              <p className={`mb-5 w-full ${index === 0 ? "max-w-2xl text-base md:text-lg" : "text-sm lg:w-80"}`}>{featured.desc}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={featured.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm uppercase"
                >
                  live{" "}
                  <i className="bx bx-arrow-up-right-stroke align-middle text-xl font-thin font-mono ml-1" />
                </a>
                <a
                  href={featured.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm uppercase"
                >
                  github{" "}
                  <i className="bx bx-chevrons-left-right align-middle text-2xl font-thin font-mono ml-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* rest of the featured projects */}
      <div>
        {restOfFeaturedProject.map((featured) => (
          <div key={featured.title} className="mx-6 my-4 border border-gray-200 bg-gray-100/50 p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-950 md:mx-20 md:pt-3 pb-3">
            <ul className="my-3 flex flex-wrap justify-start gap-3 md:ml-9">
              {featured.tools.map((tool) => (
                <li key={tool} className="mb-3">
                  <button className="capitalize bg-gray-200/70 text-gray-500 px-3 py-0.2 text-base font-mono font-medium dark:bg-neutral-800 dark:text-neutral-300">
                    {tool}
                  </button>
                </li>
              ))}
            </ul>
            {/* header, desc, links div*/}
          <div className="flex flex-col gap-5 md:ml-9 md:flex-row md:items-center md:justify-between pb-3">
            <div>
            <h4 className="font-bold font-space text-xl my-2">{featured.title}</h4>
            <p>{featured.desc}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={featured.live}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm uppercase "
              >
                live  <i className="bx bx-arrow-up-right-stroke align-middle text-xl font-thin font-mono ml-1" />
              </a>
              <a
                href={featured.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm uppercase"
              >
                github  <i className="bx bx-chevrons-left-right align-middle text-xl font-thin font-mono ml-1" />
              </a>
            </div>
          </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default FeaturedProject;
