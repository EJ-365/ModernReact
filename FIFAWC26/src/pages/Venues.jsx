import useFetch from "../Hooks/useFetch";
import { BarLoader } from "react-spinners";
import { createClient } from "pexels";
import { useEffect, useState } from "react";
import { getDataArray, getErrorMessage } from "../utils/apiResponse";
function Venues() {
  const { data, loading, error } = useFetch("/api/venues.json");

  const apikey = import.meta.env.VITE_APIKEY;
  const [photos, setPhotos] = useState({});
  useEffect(() => {
    const venues = getDataArray(data);
    if (!apikey || venues.length === 0) return;

    const client = createClient(apikey);

    venues.forEach((venue) => {
      client.photos.search({ query: venue.name, per_page: 1 }).then((res) => {
        if (res.photos?.length > 0) {
          setPhotos((prev) => ({
            ...prev,
            [venue.id]: res.photos[0].src.medium,
          }));
        }
      });
    });
  }, [apikey, data]);

  // END HERE //
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center w-auto flex-col">
        <BarLoader
          color="#800080"
          size={14}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="text-purple-300 my-4 font-sm text-sm italic text-center">
          Loading...
        </p>
      </div>
    );
  }
  if (error) return <p>Error: {getErrorMessage(error)}</p>;
  const venues = getDataArray(data);
  if (!venues.length) {
    return (
      <main className="container mx-auto mt-20 px-4 text-center text-white">
        <p className="text-zinc-400">No venue data available.</p>
      </main>
    );
  }

  // image api next:
  return (
    <main className="mx-auto container mt-20 md:px-0 px-2 sm:px-4">
      {/* CTA  */}
      <div
        className="animate-fade-in-up bg-[#0d0d0e] text-white md:p-10 p-6 sm:p-8 rounded-4xl"
        style={{ animationDelay: "100ms" }}
      >
        <h1 className="capitalize font-bold  sm:text-3xl text-2xl text-white/70 flex items-center">
          <i className="bx bx-location text-3xl items-center align-middle mr-2 text-purple-500/60" />
          Host Venues
        </h1>
        <p className="text-zinc-500 text-[16px] sm:text-[17px] font-medium my-3 text-nowrap">
          The 16 iconic stadiums hosting the 2026 tournament
        </p>
        <span className="text-purple-400 border px-3 rounded-md border-purple-700/40 bg-[#170f20] w-full sm:w-[160px] py-0.5 mt-4 text-sm text-center block sm:inline-block md:text-nowrap">
          Showing all the venues
        </span>
        <p className="mt-5 italic px-2 text-xs rounded-2xl font-medium text-red-400">
          * Note: that images of the stadiums might not be fully accurate.
        </p>
      </div>

      {/* venues*/}
      <section className="text-white mt-4">
        <div className="grid xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 sm:gap-8 xl:gap-x-10 mx-auto px-1 sm:px-3 md:px-0 text-center cursor-pointer">
          {venues.map((venue, index) => {
            return (
              <div
                key={venue.id}
                style={{ animationDelay: `${index * 70}ms` }}
                className="animate-fade-in-up card-hover direct-parent border border-zinc-700 w-full max-w-full sm:max-w-none rounded-2xl my-3 flex flex-col bg-[#161618] hover:bg-[#242427] hover:border-purple-700/40"
              >
                {/*image div */}
                <div className="relative w-full overflow-hidden rounded-t-2xl">
                  <div className="flex h-40 w-full items-center justify-center bg-[#232325] sm:h-40 md:h-48">
                    {photos[venue.id] ? (
                      <img
                        src={photos[venue.id]}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        alt={venue.name}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <i className="bx bx-stadium text-4xl text-purple-500/40" />
                        <span className="text-xs">Photo loading…</span>
                      </div>
                    )}
                    <span className="absolute right-3 top-2 rounded-lg bg-[#161618]/90 px-3 py-1 text-sm font-medium text-purple-400">
                      {venue.country}
                    </span>
                  </div>
                </div>
                {/* stadium name and city */}
                <div className="mx-3 sm:mx-4 pt-2 text-left">
                  <h2 className="text-lg sm:text-xl font-medium text-white/90 mb-1">
                    {venue.name}
                  </h2>
                  <p className="text-[15px] text-zinc-400 flex items-center">
                    <i className="bx bx-location text-[18px] sm:text-[19px] mr-1 text-zinc-400" />
                    {venue.city}
                  </p>
                </div>
                {/* capacity info and match count */}
                <div className="border-t p-4 mt-6 sm:mt-10 mb-2 border-gray-800/40 text-left">
                  <p className="flex items-center text-[15px]">
                    <i className="bx bx-group text-[18px] sm:text-[19px] mr-1 text-purple-400/90" />
                    {venue.capacity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Venues;
