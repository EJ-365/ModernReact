import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [id]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent(
      `Portfolio message from ${formData.name || "website visitor"}`,
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    );

    window.location.href = `mailto:eebudonihian@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="bg-white py-16 text-black dark:bg-black dark:text-white min-h-screen md:py-24">
      <div className="mx-6 flex flex-col gap-12 md:mx-auto md:max-w-5xl md:flex-row md:items-start md:justify-center md:gap-20">
        {/* left: contact info */}
        <div className="flex flex-col justify-between md:w-100">
          <div>
            <h1 className="font-space text-4xl font-semibold md:text-5xl">
              Contact
            </h1>

            <div className="mt-14">
              <p className="font-mono text-xs uppercase tracking-[3px] text-gray-500 dark:text-neutral-400">
                Email
              </p>
              <a
                href="mailto:eebudonihian@gmail.com"
                className="mt-3 inline-block text-lg hover:underline"
              >
                eebudonihian@gmail.com
              </a>
            </div>

            <div className="mt-10">
              <p className="font-mono text-xs uppercase tracking-[3px] text-gray-500 dark:text-neutral-400">
                Socials
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <a
                  href="https://github.com/EJ-365"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  GitHub{" "}
                  <i className="bx bx-arrow-up-right-stroke align-middle text-lg font-thin" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ejay-gabriel-24a7261bb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  LinkedIn{" "}
                  <i className="bx bx-arrow-up-right-stroke align-middle text-lg font-thin" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 hidden h-0.5 w-16 bg-black dark:bg-white md:block" />
        </div>

        {/* right: contact form */}
        <div className="w-full border border-gray-200 bg-gray-50 p-8 dark:border-neutral-800 dark:bg-neutral-950 md:w-100 md:p-10">
          <form
            className="space-y-8"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="name"
                className="font-mono text-xs uppercase tracking-[3px] text-gray-500 dark:text-neutral-400"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-3 w-full border-b border-gray-300 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400 dark:border-neutral-700 dark:placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="font-mono text-xs uppercase tracking-[3px] text-gray-500 dark:text-neutral-400"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-3 w-full border-b border-gray-300 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400 dark:border-neutral-700 dark:placeholder:text-neutral-500"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="font-mono text-xs uppercase tracking-[3px] text-gray-500 dark:text-neutral-400"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me about your project..."
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-3 w-full resize-none border-b border-gray-300 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400 dark:border-neutral-700 dark:placeholder:text-neutral-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 bg-black py-4 text-xs font-semibold uppercase tracking-[2px] text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Send Message
              <i className="bx bx-right-arrow-alt text-xl" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
