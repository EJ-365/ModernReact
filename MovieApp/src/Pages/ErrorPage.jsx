import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  const redirectToHomePage = () => (
     navigate("/home")
  )
  return (
    <section>
      <div className="flex items-center justify-center flex-col w-1/2 mx-auto md:my-50 my-20">
        <span class=" dark:text-zinc-500 text-red-500 text-center align-middle px-4 dark:bg-[#262645] bg-zinc-200 rounded-full text-[3rem] py-7 font-bold">
          {" "}
          4<i class="bx bx-alert-circle align-middle" />4
        </span>
        <div>
          <h3 className="dark:text-white text-2xl md:font-bold font-semibold text-center mt-8 mb-4 text-red-500">
            ...Oops the page you're looking for doesn't exit
          </h3>
          <p className="text-zinc-400 md:text-lg  mb-4 text-center">
            we couldn't find this page maybe it's been removed or completely{" "}
            <br />
            deleted by our server
            <span className=" text-violet-300 italic font-normal">
              {" "}
              click the button below to go back home.
            </span>
          </p>
          <div className="flex items-center justify-center my-10">
            <button onClick={redirectToHomePage} className="capitalize dark:bg-violet-500 bg-violet-400 text-white/90 px-7 py-3 rounded-xl font-medium  dark:text-white md:text-[17px] cursor-pointer dark:hover:bg-violet-600 duration-300 transition-colors hover:bg-violet-300">
              <i className="bx bx-caret-left font-bold text-xl align-middle " />{" "}
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
