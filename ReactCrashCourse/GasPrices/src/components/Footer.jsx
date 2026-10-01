export default function Footer() {
  return (
    <footer className="my-10">
      <h4 className=" text-wrap text-sm text-gay-300/90 text-center mb-3 uppercase mt-24">
        api providers and loader
      </h4>

      <div className="text-center flex flex-col items-center justify-evenly mx-auto container">
        <a
          href="https://www.eia.gov/opendata/"
          className=" text-wrap text-xs text-gray-300/90"
        >
          U.S. Energy Information Administration (EIA)
        </a>

        <a
          href="  https://www.loading-ui.com/"
          className=" text-wrap text-xs text-gray-300/90"
        >
          www.loading-ui.com
        </a>
      </div>
      <div className=" text-center my-3">
        <small className="block text-wrap text-xs font-light text-[#f5d34f]">
          @ {new Date().getFullYear()} Ejay Gabriel. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
