export default function Footer() {
  return (
    <footer className="my-10">

      <h4 className=" text-wrap text-sm text-gay-300/90 text-center mb-3 uppercase mt-24">api providers</h4>

      <div className="text-center flex flex-col items-center justify-evenly mx-auto container">
        <a
          href="https://www.eia.gov/opendata/"
          className=" text-wrap text-xs text-gray-300/90"
        >
          U.S. Energy Information Administration (EIA)
        </a>
        <a
          href=" https://rapidapi.com/twohundredok-twohundredok-default/api/us-fuel-energy-prices."
          className=" text-wrap text-xs text-gray-300/90"
        >
          RapidAPI (US Fuel & Energy Prices)
        </a>
      </div>
      <div className=" text-center my-3">
        <small className="block text-wrap text-xs text-orange-300/90">
          @ {new Date().getFullYear()} Ejay Gabriel. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
