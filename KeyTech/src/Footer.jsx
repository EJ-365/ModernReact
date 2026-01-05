import { LogoIcon } from "./Icons";
export default function Footer() {
  return (
      <footer className="text-white">
        <section className="grid md:grid-cols-4 grid-cols-1 md:mt-16">
          {/* logo and about area */}
          <div className="flex-col mx-10 mt-10 md:mt-0">
            <div className="flex items-center space-x-2 justify-start px-3">
              <LogoIcon className="md:w-10 w-10 h-10" />
              <span className="text-2xl font-semibold"> KeyTech</span>
            </div>

            <div className="mx-4 mt-3">
              <p className="text-zinc-400">
                KeyTech is a premier learning platform empowering individuals to
                master the skills of the future. From coding to creative design,
                we help you achieve your career goals.
              </p>

              {/* icons */}
              <div className="flex items-center space-x-3 justify-start my-4">
                <i className="bx bx-like text-xl"></i>
                <i className="bx bx-message-reply text-xl"></i>
                <i className="bx bx-video bx-rotate-270 text-xl "></i>
                <i className="bx bx-camera bx-rotate-270 text-xl "></i>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="text-center md:text-start mx-10 mt-10 md:mt-0">
            <h4 className="text-sm font-semibold uppercase">Platform</h4>
            <ul>
              <li className="my-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  Browse Courses
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  Learning Paths
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  For business
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  success stories
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  community
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="text-center md:text-start mx-10 mt-10 md:mt-0">
            <h4 className="text-sm font-semibold uppercase">company</h4>
            <ul>
              <li className="my-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  about us
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  careers
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  blog
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  press
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-sm text-zinc-400 capitalize hover:text-white"
                >
                  contact
                </a>
              </li>
            </ul>
          </div>

          {/* Stay updated */}
          <div className="text-center md:text-start mx-10 mt-10 md:mt-0">
            <h4 className="text-sm font-semibold uppercase">Stay updated</h4>
            <p className="text-sm text-zinc-400 my-4">
              Get the latest course updates and tech <br /> news delivered to
              your inbox.
            </p>
            <form>
              <label htmlFor="subscribe" className="hidden">
                Subscribe
              </label>
              <input
                type="email"
                required
                id="subscribe"
                className="border px-3 py-1 rounded-2xl border-zinc-800 w-full md:w-3/4 bg-transparent"
                placeholder="Enter your email"
              />
              <div className="my-3">
                <button
                  type="button"
                  className="bg-[#dd6713] px-10 py-1 font-semibold text-sm w-full md:w-3/4 rounded-full cursor-pointer hover:opacity-75"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </section>
 

      <div className="text-zinc-600 flex md:flex-row md:justify-between my-10 border-t border-zinc-800 flex-col">
        <p className="md:my-8 mx-3 md:text-start text-center">
          @ {new Date().getFullYear()} KeyTech Inc. All right reserved.
        </p>
        <div className="md:my-8 my-2">
          <ul className="flex items-center justify-center space-x-3 mx-10">
            <li>
              <a
                href="#"
                className="text-sm text-zinc-600 capitalize hover:text-white"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-zinc-600 capitalize  hover:text-white"
              >
                Terms of service{" "}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-zinc-600 capitalize  hover:text-white"
              >
                cookie settings
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
