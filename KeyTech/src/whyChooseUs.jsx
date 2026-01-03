import { GraduationCap, AwardStarOutlineRounded, Time } from "./Icons";
export default function WhyChooseUs() {
    return (
      <section className="text-white border-b border-zinc-800 my-20">
        <div className="mx-10 my-20">
          <h2 className="font-bold text-3xl my-4 leading-tight">
            Why Choose KeyTech
          </h2>
          <p className="text-zinc-400 leading-snug">
            {" "}
            We provide a premium learning experience designed for the modern
            tech landscape, <br /> focusing on skills that actually matter.
          </p>
        </div>

        {/*Card session */}
        <div className="flex md:gap-7 my-10  items-center md:justify-center md:flex-row flex-col gap-5 p-10 ">
          <div className="p-10 border-[1.5px] border-zinc-700 bg-zinc-800 opacity-65 rounded-2xl hover:opacity-75 hover:cursor-pointer md:w-96 w-auto">
            <div>
              <i>
                <GraduationCap className="w-10 h-10 bg-orange-900 rounded-full px-2 py-2 opacity-80" />
              </i>
            </div>
            <p className="font-semibold text-2xl mt-3">Expert-Led Courses</p>
            <p className="text-zinc-400 my-3">
              Learn directly from industry experts with <br /> real-world
              experience at top tech <br /> companies. No fluff, just skills.
            </p>
          </div>

          <div className="p-10 border-[1.5px] border-zinc-700 bg-zinc-800 opacity-65 rounded-2xl hover:opacity-75 hover:cursor-pointer md:w-96 w-auto">
            <div>
              <i>
                <AwardStarOutlineRounded className="w-10 h-10 bg-orange-900 rounded-full px-2 py-2 opacity-80" />
              </i>
            </div>
            <p className="font-semibold text-2xl mt-3">
              Recognized Certificates
            </p>
            <p className="text-zinc-400 my-3">
              Earn certificates upon completion to <br /> validate your skills
              and boost your Linkedin <br /> profile and resume.
            </p>
          </div>

          <div className="p-10 border-[1.5px] border-zinc-700 bg-zinc-800 opacity-65 rounded-2xl hover:opacity-75 hover:cursor-pointer md:w-96 w-auto">
            <div>
              <i>
                <Time className="w-10 h-10 bg-orange-900 rounded-full px-2 py-2 opacity-80" />
              </i>
            </div>
            <p className="font-semibold text-2xl mt-3">Self-Paced Learning</p>
            <p className="text-zinc-400 my-3">
              Learn at your own speed with lifetime <br /> access to course
              materials and updates. Fit <br /> earning into your life.
            </p>
          </div>
        </div>
      </section>
    );
}