import { useState } from "react";
import faqData from "./faqData";
export default function FAQ() {
  const [isOpenId, setIsOpenId] = useState(null);
  return (
    <section className="text-white border-b border-zinc-800  mb-10">
      <h1 className="text-center text-3xl font-bold my-20 p-4 leading-snug">
        Frequently Asked Questions.
      </h1>
      <div className="flex justify-center items-center flex-col p-3 md:mb-56 mb-20">
        {faqData.map((faq) => (
          <FaQDiv
            key={faq.id}
            faq={faq}
            isOpen={isOpenId === faq.id}
            handleClick={() => setIsOpenId(isOpenId === faq.id ? null : faq.id)}
          />
        ))}
      </div>
    </section>
  );
}
function FaQDiv({ faq, isOpen, handleClick }) {
  return (
    <div className="md:p-5 border border-zinc-700 md:w-1/2 my-3 rounded-2xl px-12 py-10 w-full brightness-75 cursor-pointer bg-zinc-900 hover:bg-zinc-800">
      {/* accordion questions */}
      <div className="flex items-center justify-between " onClick={handleClick}>
        <h2 className="text-lg md:font-semibold">{faq.question}</h2>
        <i
          className={`bx bx-chevron-down ${
            isOpen ? "rotate-180" : ""
          } mx-2 text-2xl md:font-semibold`}
        ></i>
      </div>
      {/* accordion answers */}
      <div
        className={`transition-all duration-400 ease-in-out overflow-hidden ${
          isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="my-2 text-lg text-zinc-400">{isOpen && faq.answer}</p>
      </div>
    </div>
  );
}
