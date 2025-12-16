import "./index.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Header payRate={22} />
      <Body />
      <Footer />
    </>
  );
}

// Navbar component
function Navbar() {
  return (
    <nav className="flex flex-col md:flex-row items-center justify-between mx-2 md:mx-6 md:sticky md:top-0 py-1">
      <div className="p-px glass-effect rounded-xl my-2 md:my-0">
        <div className="flex flex-col sm:flex-row items-center font-semibold text-sm justify-start text-white w-auto py-3 px-2 md:py-6 md:px-4 rounded-xl h-auto md:h-16">
          <div>
            <span className="text-xl md:text-2xl italic">Handshake AI</span>
          </div>
          <ul className="space-x-2 md:space-x-4 mx-0 md:mx-4 flex flex-col sm:flex-row items-center justify-evenly mt-2 sm:mt-0 roboto-regular">
            <li>
              <a href="#">Fellowship</a>
            </li>
            <li>
              <a href="#">Stories</a>
            </li>
            <li>
              <a href="#">Opportunity</a>
            </li>
            <li>
              <a href="#">AI Labs</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-px rounded-xl my-3 md:my-0 roboto-regular">
        <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-3 items-center font-semibold text-sm justify-end text-white w-auto py-2 px-3 md:py-4 md:px-6 rounded-xl glass-effect">
          <a href="#" className="mb-2 sm:mb-0">
            Handshake AI
          </a>
          <a
            href="#"
            className="px-3 py-1.5 rounded-lg text-center bg-[#2e2e2e] outline-1 outline-gray-500 p-px mb-2 sm:mb-0 hover:bg-white hover:text-black transition duration-200 ease-in-out"
          >
            Login
          </a>
          <a
            href="#"
            className="px-2 py-1.5 rounded-lg text-center bg-[#aeff00] text-black hover:bg-[#aeff00cc]"
          >
            Sign Up Now
          </a>
        </div>
      </div>
    </nav>
  );
}


// Header component
function Header({ payRate }) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-1">
      {/* side bar */}
      <div className="text-[#b3b9bc] text-[16px] mx-auto md:ml-20 w-full md:w-64 mt-10 md:mt-20 px-4 md:px-0 roboto-regular">
        <div className="flex items-center mb-4">
          <i className="bx bx-currency-notes text-2xl mr-2"></i>
          <p>
            Up to ${payRate}/hr <br />
            Depending on the project
          </p>
        </div>

        <div className="flex items-center mb-4">
          <i className="bx bx-education text-2xl mr-2"></i>
          <p>Associate's</p>
        </div>
        <div className="flex items-center mb-4">
          <i className="bx bx-location-check text-2xl mr-2"></i>
          <p>Remote</p>
        </div>
        <div className="flex items-center mb-4">
          <i className="bx bx-clock text-2xl mr-2"></i>
          <p>
            Part-time <br />
            Flexible hours
          </p>
        </div>
        <div className="flex items-center mb-4">
          <i className="bx bx-globe-alt-2 text-2xl mr-2"></i>
          <p>OPT/CPT Eligible</p>
        </div>
      </div>

      <div className="text-white my-10 md:my-20 flex flex-col items-center px-4 md:px-0">
        <div className="flex flex-col items-start ">
          <h1 className="text-4xl sm:text-5xl md:text-6xl anton-regular leading-tight text-center md:text-left md:pr-64">
            Generalist - AI Trainer
          </h1>
          <button className="bg-[#aeff00] text-black px-5 py-2 rounded-md font-bold my-6 mx-auto md:mx-0 hover:bg-[#aeff00cc] cursor-pointer roboto-regular">
            Sign Up Now
          </button>
          <div className="w-full border-b border-gray-500 mt-4 mb-8"></div>
        </div>
      </div>
    </div>
  );
}



function Body() {
  return (
    <div className="flex flex-col items-center justify-center max-w-full md:max-w-[700px] mx-auto px-4 md:px-0">
      <div className="text-[#b3b9bc]">
        <h3 className="text-lg font-bold my-6">Overview</h3>
        <p className="roboto-regular">
          Handshake is seeking motivated Associates, Bachelor’s, and Master’s
          students and grads to work remotely to test Large Language Models
          (LLMs) in collaboration with top AI labs. As part of this program,
          you’ll apply your overall skills and academic knowledge to help
          improve the performance of LLMs. All disciplines and majors are
          welcome to apply.
        </p>
        <p className="my-4 roboto-regular">
          Handshake AI projects are remote and part-time opportunities.
        </p>
      </div>

      <div className="my-4 w-full">
        <video controls className="rounded-3xl w-full h-auto" autoPlay muted>
          <source
            src="https://framerusercontent.com/assets/MDeHZEzNxlbdzqLjx7fGDvLPA.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="w-full border-b border-gray-500 mt-4 mb-8"></div>

      <div className="text-[#b3b9bc] text-[16px]">
        <h3 className="text-lg font-bold my-6">Details</h3>
        <p className="text-[16px] roboto-regular">
          <li>
            Work remotely and independently on short-term AI training projects,
            with no minimum commitment to hours.
          </li>
          <li>
            Responsibilities may include: training and evaluating multimedia
            content such as image, video or audio, or assessing and ranking
            outputs produced by AI.
          </li>
          <li>
            No specific expertise required, just attention to detail. We’ll
            provide a brief training, and you’ll take a single assessment before
            starting.
          </li>

          <li>
            {" "}
            Learn how frontier AI labs are training their models while getting
            paid. Successful experience leads to eligibility for more projects
            in the future.
          </li>
        </p>
        <p className="my-4 roboto-regular">
          Shape the future of AI while building skills and confidence to
          navigate an AI-driven job market.
        </p>
      </div>
      <div className="w-full border-b border-gray-500 mt-4 mb-8"></div>

      <div className="text-[#b3b9bc]">
        <h3 className="text-lg font-bold my-6">Qualifications</h3>
        <p className="text-[16px] roboto-regular">
          <li>
            Current students pursuing an Associate’s, Bachelor’s, or Master’s
            degree or those already holding degrees
          </li>
          <li>
            Individuals with exceptional attention to detail and the ability to
            follow detailed instructions accurately
          </li>
          <li>
            Candidates comfortable working in a primarily asynchronous, remote
            environment in collaboration with leading AI research labs
          </li>

          <li>
            {" "}
            People who believe their knowledge and reasoning skills can
            challenge today’s most advanced AI systems
          </li>
        </p>
      </div>
      <div className="w-full border-b border-gray-500 mt-4 mb-8"></div>

      <div className="text-[#b3b9bc] text-[16px]">
        <h3 className="text-lg font-bold my-6">
          Work authorization information
        </h3>
        <p className="text-[16px] roboto-regular">
          F-1 students who are eligible for CPT or OPT may be eligible for
          projects on Handshake AI. Work with your Designated School Official to
          determine your eligibility. If your school requires a CPT course,
          Handshake AI may not meet your school’s requirements. STEM OPT is not
          supported.{" "}
          <a
            href="https://support.joinhandshake.com/hc/en-us/articles/32245223383703-Fellowship-Work-Authorization-Eligibility"
            className="text-blue-500 cursor-pointer"
          >
            {" "}
            See our Help Center article
          </a>{" "}
          for more information on what types of work authorizations are
          supported on Handshake AI.
        </p>
      </div>
      <div className="w-full border-b border-gray-500 mt-4 mb-8"></div>

      <div className="text-white text-center  my-4">
        <h3 className="text-lg font-bold my-6 text-left">
          The application process{" "}
        </h3>

        <div className="flex flex-col sm:flex-row justify-evenly text-white gap-4 sm:gap-8 flex-wrap">
          <div className="bg-linear-to-r from-[#14323744] to-[#597a4255] border-[0.5px] border-[#aeff00] rounded-3xl px-6 py-7 w-full sm:w-36 h-44 mx-auto">
            <div className="flex flex-col items-start text-balance">
              <i
                class="bx  bx-user-square bg-[#aeff00] p-2 w-10 h-10 mb-4 rounded-full text-2xl"
                style={{ color: "#100e0e" }}
              ></i>
              <p className="font-bold text-sm text-left mb-4">
                Sign up and create an account
              </p>
            </div>
          </div>

          <div className="bg-linear-to-r from-[#14323744] to-[#597a4255] border-[0.5px] border-[#aeff00] rounded-3xl px-6 py-7 w-full sm:w-36 h-44 mx-auto">
            <div className="flex flex-col items-start text-balance">
              <i
                class="bx  bx-user-id-card bg-[#aeff00] p-2 w-10 h-10 mb-4 rounded-full text-2xl"
                style={{ color: "#100e0e" }}
              ></i>
              <p className="font-bold text-sm text-left mb-4">
                Verify your identity
              </p>
            </div>
          </div>

          <div className="bg-linear-to-r from-[#14323744] to-[#597a4255] border-[0.5px] border-[#aeff00] rounded-3xl px-6 py-7 w-full sm:w-36 h-44 mx-auto">
            <div className="flex flex-col items-start text-balance">
              <i
                class="bx  bx-form bg-[#aeff00] p-2 w-10 h-10 mb-4 rounded-full text-2xl"
                style={{ color: "#100e0e" }}
              ></i>
              <p className="font-bold text-sm text-left mb-4">
                Join and onboard into relevant projects
              </p>
            </div>
          </div>

          <div className="bg-linear-to-r from-[#14323744] to-[#597a4255] border-[0.5px] border-[#aeff00] rounded-3xl px-6 py-7 w-full sm:w-36 h-44 mx-auto">
            <div className="flex flex-col items-start text-balance">
              <i
                class="bx  bx-tv-alt bg-[#aeff00] p-2 w-10 h-10 mb-4 rounded-full text-2xl"
                style={{ color: "#100e0e" }}
              ></i>
              <p className="font-bold text-sm text-left mb-4">
                Start working and earning
              </p>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#"
        className="px-2 py-2.5 bg-[#aeff00] my-4 w-full text-black text-center font-bold rounded-md hover:bg-[#aeff00cc]"
      >
        Sign Up Now
      </a>
    </div>
  );
}


// Footer Component
function Footer() {
  return (
    <footer className="text-white bg-[#052326] rounded-t-3xl">
      <div className="text-center container mt-12 md:mt-24 text-[#aeff00] leading-tight">
        <h1 className="text-6xl sm:text-8xl md:text-[14rem] anton-regular font-extrabold italic">
          Handshake
        </h1>
      </div>

      {/* footer content and links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-y-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-y-4 sm:gap-x-0.5 mt-8 md:mt-0">
          <div className="bg-[#041b1e] p-8 mx-2 sm:ml-6 my-4 rounded-2xl hover:bg-[#aeff00] hover:text-black cursor-pointer duration-300 transition ease-in-out">
            <a href="https://joinhandshake.com/students/" target="_blank">
              <h4 className="mb-16 text-sm">Students</h4>
              <p className="text-xl font-semibold text-wrap w-32 roboto-regular">
                Find your next job
              </p>
            </a>
          </div>

          <div className="bg-[#041b1e] p-8 mx-2 sm:ml-2 my-4 rounded-2xl hover:bg-[#aeff00] hover:text-black cursor-pointer duration-300 transition ease-in-out">
            <a href="https://joinhandshake.com/employers/" target="_blank">
              <h4 className="mb-16 text-sm">Employers</h4>
              <p className="text-xl font-semibold text-wrap w-32">
                Hire top talent
              </p>
            </a>
          </div>

          <div className="bg-[#041b1e] mx-2 sm:ml-2 p-8 my-4 rounded-2xl hover:bg-[#aeff00] hover:text-black cursor-pointer duration-300 transition ease-in-out">
            <a href="https://joinhandshake.com/career-centers/" target="_blank">
              <h4 className="mb-16 text-sm">Career Centers</h4>
              <p className="text-xl font-semibold text-wrap w-32">
                Support students
              </p>
            </a>
          </div>
        </div>

        {/*links */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:ml-24 px-4 md:px-0">
          <h5 className="text-sm text-gray-400 mb-4">Students</h5>
          <h5 className="text-sm text-gray-400 mb-4">Employers</h5>
          <h5 className="text-sm text-gray-400 mb-4">Career centers</h5>
          <h5 className="text-sm text-gray-400 mb-4">Company</h5>

          <ul className="text-sm">
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                How it works
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Who's hiring
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Career tips
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Companies
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Job roles
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Help center
              </a>
            </li>
          </ul>

          <ul className="text-sm">
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Solutions
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Products
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Customers
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Resources
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Blog
              </a
>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Request demo
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Help center
              </a>
            </li>
          </ul>

          <ul className="text-sm">
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Marketing toolkit
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Resources
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Events
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Security
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Request demo
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Help center
              </a>
            </li>
          </ul
>

          <ul className="text-sm">
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                About
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Handshake AI
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Join us
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Press
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Blog
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Brand guidelines
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-[#aeff00]">
                Your Privacy Choices
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:justify-between mt-8 md:mt-16 px-4 md:px-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 mx-auto md:mx-10 mb-8 md:mb-10">
          <img
            src="/assets/app-store-download-badge_svgstack_com_70131765494567.svg"
            alt="App Store"
            className="w-32"
          />

          <img
            src="/assets/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
            className="w-32"
          />
        </div>

        <div className="flex justify-center items-center space-x-4 md:space-x-8 px-4 md:px-10 mx-auto md:ml-24 cursor-pointer mb-8 md:mb-0">
          <img src="/assets/tiktok.png" className="w-6" />
          <img src="/assets/instagram.png" className="w-6" />
          <img src="/assets/X-logo.png" className="w-6" />
          <img src="/assets/facebook-seeklogo.png" className="w-6" />
          <img src="/assets/linkedin-seeklogo.png" className="w-6" />
        </div>

        <div className="mx-auto md:ml-40 text-center md:text-right mb-10 md:mb-0">
          <p className="text-xs text-gray-500 font-bold mb-3 roboto-regular">
            {" "}
            ©{new Date().getFullYear()} Handshake. All rights reserved{" "}
          </p>
          <ul className="flex flex-col sm:flex-row items-center justify-center md:justify-end space-y-2 sm:space-y-0 sm:space-x-6 text-gray-500 font-bold text-xs roboto-regular">
            <li>
              <a href="">Privacy policy</a>
            </li>
            <li>
              <a href="">Accessibility</a>
            </li>
            <li>
              <a href="">Terms of service</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
