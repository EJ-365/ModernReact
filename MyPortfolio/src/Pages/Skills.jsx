import { useNavigate } from "react-router-dom";

function Skills() {
  const navigate = useNavigate();
  const sampleImageURl = `https://miro.medium.com/0*3WQRObN7OXclp2cq.png`;
  return (
    <section className="min-h-screen bg-white py-24 text-black dark:bg-black dark:text-white">
      <div className="main flex items-left justify-start flex-col mx-6 md:mx-20">
        <p className="uppercase p-2 text-sm tracking-wider bg-gray-200 w-50 text-center font-mono font-medium mb-6 dark:bg-neutral-800 dark:text-neutral-200">
          technical arsenal
        </p>
        <div>
          <h2 className="font-bold md:text-5xl text-3xl font-space">
            Crafting digital experiences with a modern stack.
          </h2>
        </div>
        <div className="w-full my-6 md:w-200">
          <p className="text-lg font-manrope">
            Focused on the intersection of design and engineering. My toolkit is
            centered around performance, accessibility, and type-safe
            development.
          </p>
        </div>
      </div>

      {/* skillsets */}
      <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-3 md:mx-20 md:p-5 dark:text-white">
        <div className="border border-neutral-300 py-4 px-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h4 className="text-lg font-space font-semibold md:mx-7">Languages</h4>
          <div className="my-8 flex flex-wrap items-center justify-start gap-3 md:justify-center md:space-x-3 md:space-y-3 md:gap-0">
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              javascript (es6+)
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              typescript
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              html5
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              css/scss
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              python
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              sql
            </p>
          </div>
        </div>

        <div className="border border-neutral-300 bg-neutral-100 py-4 px-6 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
          <h4 className="text-lg font-space font-semibold capitalize md:w-90">
            <i className="bxf bx-chart-stacked-rows mx-1.5 align-middle text-black dark:text-white" />
            frameworks
          </h4>
          <div className="my-8 flex flex-wrap items-center justify-start gap-3 md:mx-auto md:justify-center md:space-x-3 md:space-y-3 md:gap-0">
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              react
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              next.js
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              vue.js
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              tailwindcss
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              framer motion
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              redux toolkit
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              shadcn/ui
            </p>
          </div>
        </div>

        <div className="border border-neutral-300 bg-neutral-100 py-4 px-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h4 className="text-lg font-space font-semibold capitalize md:w-90">
            <i className="bxf bx-brush-sparkles mx-1.5 align-middle text-black dark:text-white" />
            tools & design
          </h4>
          <div className="my-8 flex flex-wrap items-center justify-start gap-3 md:mx-auto md:justify-center md:space-x-3 md:space-y-3 md:gap-0">
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              git/github
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              figma
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              vite
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              postman
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              docker
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              vercel
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              adobe cc
            </p>
          </div>
        </div>

        <div className="border border-neutral-300 py-4 px-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h4 className="text-lg font-space font-semibold capitalize md:w-90">
            <i className="bxf bx-layout mx-1.5 align-middle text-black dark:text-white" />
            frontend concepts
          </h4>
          <div className="my-8 flex flex-wrap items-center justify-start gap-3 md:mx-auto md:justify-center md:space-x-3 md:space-y-3 md:gap-0">
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              responsive design
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              mobile-first
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              accessibility
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              component design
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              cross-browser ui
            </p>
          </div>
        </div>

        <div className="border border-neutral-300 bg-neutral-100 py-4 px-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h4 className="text-lg font-space font-semibold capitalize md:w-90">
            <i className="bxf bx-data mx-1.5 align-middle text-black dark:text-white" />
            data & state
          </h4>
          <div className="my-8 flex flex-wrap items-center justify-start gap-3 md:mx-auto md:justify-center md:space-x-3 md:space-y-3 md:gap-0">
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              rest apis
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              context api
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              local storage
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              api integration
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              async data
            </p>
          </div>
        </div>

        <div className="border border-neutral-300 py-4 px-6 dark:border-neutral-800 dark:bg-neutral-950">
          <h4 className="text-lg font-space font-semibold capitalize md:w-90">
            <i className="bxf bx-user-voice mx-1.5 align-middle text-black dark:text-white" />
            professional skills
          </h4>
          <div className="my-8 flex flex-wrap items-center justify-start gap-3 md:mx-auto md:justify-center md:space-x-3 md:space-y-3 md:gap-0">
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              mentoring
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              collaboration
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              communication
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              problem solving
            </p>
            <p className="py-2 px-4 uppercase bg-neutral-100 text-xs font-mono font-medium border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              attention to detail
            </p>
          </div>
        </div>
      </div>

      <div className="flex md:flex-row flex-col mx-4 justify-evenly items-center mt-60">
        <div>
          <h3 className="capitalize md:text-2xl text-xl font-space font-bold md:mx-0 mx-4">always learning.</h3>
          <p className="my-4 md:w-140 text-sm md:text-base mx-4 md:mx-0">
            The web ecosystem moves fast. I'm currently starting Next.js to
            deepen my understanding of routing, server rendering, and building
            more production-ready React applications.
          </p>

          <div className="my-4 mx-4 mt-10 md:mx-0">
            <button
              onClick={() => navigate("/project")}
              className="uppercase md:px-8 px-4 py-3 border text-xs font-mono dark:border-neutral-700 cursor-pointer hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition-all duration-200"
            >
              View Projects
            </button>
          </div>
        </div>

        {/* image div */}
        <div className="md:mt-0 mt-6">
          <img src={sampleImageURl} alt="image" className="w-160 h-auto"/>
        </div>
      </div>
    </section>
  );
}

export default Skills;
