import profilePic from "../assets/profilePic-new.png";

function About() {
  const myPhoto = profilePic;
  const highlights = [
    {
      title: "Education",
      label: "Lamar University",
      desc: "B.S. in Computer Science, expected December 2026.",
    },
    {
      title: "Frontend Internship",
      label: "Deepiri",
      desc: "Building responsive React interfaces, reusable UI components, and API-driven user experiences.",
    },
    {
      title: "Mentorship",
      label: "Student Success Mentor",
      desc: "Supporting freshman students with academic planning, technical growth, and computer science coursework.",
    },
  ];

  const principles = [
    "Accessible interfaces",
    "Mobile-first layouts",
    "Reusable components",
    "Clean frontend structure",
  ];

  return (
    <main className="bg-white text-black dark:bg-black dark:text-white">
      <section className="flex flex-col justify-start items-center gap-10 md:grid md:grid-cols-2 md:justify-center md:gap-10 w-full min-h-screen px-6 py-12 md:px-10 md:py-16 lg:px-16 xl:px-0 xl:gap-0 overflow-hidden">
        {/*image div */}
        <div className="w-full">
          <div className="md:w-full">
            <img
              src={myPhoto}
              alt="profile-picture"
              className="mx-auto w-full max-w-80 contrast-110 brightness-105 md:mx-0 md:w-96 md:max-w-none md:h-120 lg:w-130 lg:h-140 xl:ml-140 dark:contrast-125 dark:brightness-110"
            />
          </div>
        </div>

        {/* text content div */}
        <div className="w-full md:ml-0 lg:ml-10 xl:ml-30">
          <div>
            <div className="flex items-center space-x-4">
              <p className="uppercase text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono my-8 tracking-widest">
                about me
              </p>
              <div className="w-16 h-0.5 bg-black dark:bg-white" />
            </div>
            <h3 className="text-4xl font-semibold md:text-5xl"> Front-End </h3>
            <h3 className="text-3xl text-gray-600 font-semibold dark:text-white/80 md:text-4xl">Intern</h3>
            <div className="mt-4 mb-12">
              <p className="w-full max-w-xl md:w-full lg:w-120 xl:w-130">
                I build responsive, accessible user interfaces with React,
                JavaScript, and Tailwind CSS. My focus is creating clean frontend
                systems that feel precise, usable, and easy to maintain.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 dark:text-black md:gap-4">
              <button className="text-xs capitalize px-3 py-1 border text-center font-mono font-medium bg-gray-100 shadow-xs border-gray-200"> <i className="bx bx-chevrons-left-right align-middle text-xl font-thin font-mono mx-1" />clean architecture</button>

              <button className="text-xs px-3 py-1 border text-center font-mono font-medium bg-gray-100 shadow-xs border-gray-200"> <i className="bx bx-cursor-click align-middle text-sm font-thin font-mono mx-1" />ux Centric</button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-300 px-6 py-20 dark:border-neutral-800 md:px-20">
        <div className="mb-12 max-w-3xl">
          <p className="mb-5 w-fit bg-gray-200 px-4 py-2 font-mono text-xs font-medium uppercase tracking-[3px] dark:bg-neutral-800 dark:text-neutral-200">
            background
          </p>
          <h2 className="font-space text-3xl font-bold md:text-5xl">
            More than a portfolio introduction.
          </h2>
          <p className="mt-6 text-base text-gray-700 dark:text-neutral-300 md:text-lg">
            I am a computer science student building real frontend projects while
            gaining experience through internship work, AI evaluation, and student
            mentorship.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="border border-gray-200 bg-gray-100/60 p-6 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <p className="font-mono text-xs uppercase tracking-[3px] text-gray-500 dark:text-neutral-400">
                {item.title}
              </p>
              <h4 className="mt-5 font-space text-xl font-semibold">
                {item.label}
              </h4>
              <p className="mt-4 text-sm text-gray-700 dark:text-neutral-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 md:px-20">
        <div className="grid gap-10 border-y border-gray-300 py-16 dark:border-neutral-800 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[3px] text-gray-500 dark:text-neutral-400">
              how i build
            </p>
            <h2 className="font-space text-3xl font-bold md:text-4xl">
              Simple interfaces, strong structure.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((principle) => (
              <span
                key={principle}
                className="border border-gray-200 bg-gray-100 px-4 py-3 font-mono text-xs uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-950"
              >
                {principle}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
