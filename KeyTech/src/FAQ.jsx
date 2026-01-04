import faqData from "./faqData"
export default function FAQ() {
    return (
      <section className="text-white ">
        <h1 className="text-center text-3xl font-bold my-20">
          Frequently Asked Question
        </h1>
        <div className="flex justify-center items-center flex-col p-3">
          {faqData.map((faq) => (
            <FaQDiv key={faq.id} faq={faq} />
          ))}
        </div>
      </section>
    );
}
function FaQDiv({faq}) {
    return (
      <div className="md:p-5 border border-zinc-700 md:w-1/2 my-3 rounded-2xl px-12 py-10 w-full brightness-75 cursor-pointer bg-zinc-900">
        {/* accordion questions */}
        <div className="flex items-center justify-between ">
                <h2 className="text-lg md:font-semibold">{faq.question}</h2>
                <i className="bx bx-chevron-down mx-2 text-2xl md:font-semibold"></i>
        </div>
        {/* accordion answers */}
        <div>
          <p className="my-2 text-lg text-zinc-400">{faq.answer}</p>
        </div>
      </div>
    );
}