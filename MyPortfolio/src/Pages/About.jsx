import profilePic from "../assets/profilePic-new.png";

function About() {
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

  const tagClassName =
    "text-xs capitalize px-3 py-1 border text-center font-mono font-medium bg-gray-100 shadow-xs border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200";

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-12 md:grid md:grid-cols-2 md:items-center md:gap-12 md:px-10 md:py-16 lg:px-16">
        <div className="w-full">
          <img
            src={profilePic}
            alt="Ejay Gabriel profile"
            className="mx-auto w-full max-w-80 object-cover contrast-110 brightness-105 md:mx-0 md:h-120 md:w-full md:max-w-none lg:h-140 dark:contrast-125 dark:brightness-110"
          />
        </div>

        <div className="w-full">
          <div className="flex items-center space-x-4">
            <p className="my-8 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              about me
            </p>
            <div className="h-0.5 w-16 bg-black dark:bg-white" />
          </div>
          <h3 className="text-4xl font-semibold md:text-5xl">Front-End</h3>
          <h3 className="text-3xl font-semibold text-gray-600 dark:text-white/80 md:text-4xl">
            Developer Intern
          </h3>
          <p className="mt-4 mb-12 max-w-xl text-base text-gray-700 dark:text-neutral-300">
            I build responsive, accessible user interfaces with React,
            JavaScript, and Tailwind CSS. My focus is creating clean frontend
            systems that feel precise, usable, and easy to maintain.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <span className={tagClassName}>
              <i className="bx bx-chevrons-left-right mx-1 align-middle font-mono text-xl font-thin" />
              clean architecture
            </span>
            <span className={tagClassName}>
              <i className="bx bx-cursor-click mx-1 align-middle font-mono text-sm font-thin" />
              ux centric
            </span>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-300 px-6 py-20 dark:border-neutral-800 md:px-20">
        <div className="mx-auto max-w-6xl">
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
        </div>
      </section>

      <section className="px-6 pb-24 md:px-20">
        <div className="mx-auto max-w-6xl">
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
                  className="border border-gray-200 bg-gray-100 px-4 py-3 font-mono text-xs uppercase tracking-wider text-gray-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
