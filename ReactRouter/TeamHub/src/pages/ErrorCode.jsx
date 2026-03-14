import React from "react";
import { Link } from "react-router-dom";
export default function ErrorCode() {
  return (
    <section className="md:my-0 my-20">
      <div className="flex items-center justify-center flex-col mt-24">
        <div>
          <img
            className="w-70 h-54 rounded-md"
            src="/Images/404-image.png"
            alt=""
          />
        </div>
        <button className="bg-violet-200 text-violet-900 my-4 px-2 uppercase font-medium text-[13px] rounded-full">
          error 404
        </button>
      </div>
      {/* text content */}
      <div className="flex justify-center items-center flex-col">
        <h1 className="md:text-5xl text-3xl font-extrabold capitalize">
          oops! <span className="text-violet-800 mb-2">offside</span>
        </h1>
        <p className="my-4 md:w-100 text-center text-zinc-800 dark:text-zinc-200">
          It looks like the page you are looking for has been red- carded. We
          couldn't find the match you were looking for.
        </p>

        <div className="flex items-center justify-center space-x-6">
          <button className="text-sm shadow-sm font-medium bg-amber-600 text-white px-4 py-1 rounded-md hover:bg-amber-600/90 ease-in-out duration-200 cursor-pointer">
            <i className="bx bx-home-alt mr-1 align-middle" />
            <Link to="/players">Return to Pitch</Link>
          </button>
          <button className="cursor-pointer text-sm shadow-xs bg-white text-black px-4 py-1 capitalize rounded-md dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-white/10">
            <i className="bx bx-message-circle-question-mark mr-1 align-middle" />
            help center
          </button>
        </div>
      </div>
    </section>
  );
}
