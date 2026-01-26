import hourClcok from "./assets/24-hours-black.png";
import checkMark from "./assets/checkmark.png";
import playButton from "./assets/play-button.png";

export default function Cards() {
  return (
    <section className="w-full my-10">
      {/* support divider */}
      <div className="flex items-center text-center my-6  ">
        <div className="grow h-px bg-gray-300"></div>{" "}
        <span className="px-4 text-sm font-bold text-[#808080] tracking-widest uppercase">
          Support
        </span>
        <div className="grow h-px bg-gray-300"></div>
      </div>

      {/* card area */}
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start px-4 md:px-10 mt-10 gap-6">
        {/* Card 1 */}
        <div className="flex items-center justify-center flex-col bg-[#ffffff] w-full max-w-[400px] md:w-96 pb-8 pt-2 h-auto md:h-80 rounded shadow-sm">
          <div className="flex text-[#c20d0f] pt-8">
            <img src={hourClcok} className="w-10 h-10 mx-4" />
            <div className="w-3/4">
              <a
                href=""
                className="uppercase font-bold text-xl hover:underline decoration-dotted text-start"
              >
                BLACKBOARD SUPPORT WEBSITE
              </a>
            </div>
          </div>

          <div className="text-start w-60 my-4 flex items-center justify-start text-wrap">
            <p>
              Create a support ticket, chat with a support representative or
              search the knowledge base. Available 24/7.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center justify-center flex-col bg-[#ffffff] w-full max-w-[400px] md:w-96 pb-8 pt-2 h-auto md:h-80 rounded shadow-sm">
          <div className="flex text-[#c20d0f] pt-8">
            <img src={hourClcok} className="w-10 h-10 mx-4" />
            <div className="w-3/4">
              <a
                href=""
                className="uppercase font-bold text-xl hover:underline decoration-dotted text-start"
              >
                VIDEO TUTORIALS
              </a>
            </div>
          </div>

          <div className="text-start w-60 my-4 flex items-center justify-start text-wrap">
            <p>
              Learn Blackboard, manage tasks, and communicate with others. These
              short on demand video tutorials will help get you started.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center justify-center flex-col bg-[#ffffff] w-full max-w-[400px] md:w-96 pb-8 pt-2 h-auto md:h-80 rounded shadow-sm">
          <div className="flex text-[#c20d0f] pt-8">
            <img src={hourClcok} className="w-10 h-10 mx-4" />
            <div className="w-3/4">
              <a
                href=""
                className="uppercase font-bold text-xl hover:underline decoration-dotted text-start"
              >
                REQUIRED SOFTWARE
              </a>
            </div>
          </div>

          <div className="text-start w-60 my-4 flex items-center justify-start text-wrap">
            <ul className="text-left list-disc ml-5">
              <li className="mb-2">
                <a href="" className="text-left">
                  Check{" "}
                  <span className="text-[#c20d0f] font-semibold">
                    browser compatibility
                  </span>
                </a>
              </li>
              <li className="mb-2">
                <a href="" className="text-left">
                  Update{" "}
                  <span className="text-[#c20d0f] font-semibold">
                    browser settings
                  </span>
                </a>
              </li>
              <li>
                <a href="" className="text-left">
                  Download{" "}
                  <span className="text-[#c20d0f] font-semibold">
                    Honorlock
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
