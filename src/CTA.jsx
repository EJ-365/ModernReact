import Lulearn from "./assets/LULearn-Blackboard.png";
export default function CTA() {
  return (
    <section className="bg-[#ffffff]">
      <div className="w-full h-full p-14 text-center justify-center flex items-center">
        <img src={Lulearn} className="w-116" />
      </div>

      <div className="flex items-center justify-center text-white ">
        <button className="uppercase bg-[#313131] py-3 px-4 rounded-lg text-lg font-bold hover:bg-[#757779] cursor-pointer">
          Log in with your lea
        </button>
      </div>

      {/* Forgot password and other links */}
      <div className="text-center bg-[#f4f4f4] w-full h-auto mt-10 p-5 text-[#c20d0f] text-[16px]">
        <a
          href="https://passwordreset.lamar.edu/showLogin.cc"
          className="hover:underline decoration-dotted"
        >
          Forgot Password?
        </a>
      </div>

      {/* Do not include @lamar.edu to your username when logging in */}
      <div className="italic text-center mt-0">
        <p>Do not include @lamar.edu to your username when logging in</p>
      </div>

      {/* Help Privacy and Terms of Use Accessibility */}
      <div className="my-8">
        <ul className="text-[#c20d0f] text-center text-xl leading-relaxed space-x-6 flex items-center justify-center">
          <a href="#" className="hover:underline decoration-dotted">
            Help
          </a>
          <a href="#" className="hover:underline decoration-dotted">
            Privacy and Terms of Use
          </a>
        </ul>

        <ul className="text-[#c20d0f] text-center text-xl space-x-6 flex items-center justify-center">
          <a href="#" className="hover:underline decoration-dotted">
            Accessibility
          </a>
        </ul>
      </div>
    </section>
  );
}
