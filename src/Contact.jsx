export default function Contact() {
  return (
    <section className="bg-[#dedede] w-full">
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8">
        {/* Header Section */}
        <div className="text-center md:text-left">
          <h3 className="uppercase font-bold">Still need help?</h3>
          <p className="text-sm">
            Contact the support team at Lamar University.
          </p>
        </div>

        {/* Contact Info Section */}
        <div className="flex flex-col gap-4">
          {/* Phone */}
          <div className="flex items-center gap-3">
            <i className="bx bx-phone text-3xl"></i>
            <div className="flex flex-col">
              <span className="font-semibold">409-880-2222</span>
              <p className="text-sm text-gray-600">
                Toll Free: 1-866-585-1738.
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <i className="bx bx-envelope text-3xl"></i>
            <div className="flex flex-col">
              <a
                className="font-semibold text-[#c20d0f] hover:underline decoration-dotted"
                href=""
              >
                blackboard@lamar.edu
              </a>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="flex items-center gap-3">
          <i className="bx bx-calendar-alt text-3xl"></i>
          <div className="flex flex-col">
            <p className="font-semibold">24/7 Support available via phone</p>
            <p className="text-sm text-gray-600">
              Email support available during business hours (CST)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
