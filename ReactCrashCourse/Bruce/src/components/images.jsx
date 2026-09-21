import { useState } from "react";
import imageData from "../data/imageData";
import featureData from "../data/feature";

export default function Images() {
  const images = imageData;
  const features = featureData;
  // image pop up logic
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <main className="md:my-30">
      <div className="flex md:flex-row flex-col items-center md:justify-evenly justify-center my-8 md:px-100">
        <div>
          <p className="text-[#d8a15a] font-plex md:text-left text-center md:text-[15px] text-xs capitalize font-semibold my-4 ">
            02 / Details
          </p>
          <h2 className="font-bricolage md:text-7xl text-3xl font-extrabold md:w-120 w-auto text-wrap text-center md:text-left mx-10 md:mx-0">
            The makings of Bruce.
          </h2>
        </div>

        <div className="md:mt-28 mt-4 text-center md:text-left mx-10 md:mx-0">
          <p className="font-plex text-normal text-[#8b5e2b] text-lg md:w-96 max-w-full my-8 text-wrap">
            A closer look at the features that give this fox his unmistakable
            personality.
          </p>
        </div>
      </div>

      {/* 6 images section  */}

      <div className="md:grid md:grid-cols-3 grid-cols-1 md:gap-5 gap-10 w-full mx-auto container md:px-75">
        {images.map((image) => {
          return (
            <div
              key={image.id}
              className="w-auto border-4 border-[#d8a15a] relative shadow-[14px_14px_0_black] md:p-0 md:mx-3 md:my-3  p-3"
            >
              <img
                onClick={() => setSelectedImg(image.image)}
                src={image.image}
                alt="bruce-images"
                className=" md:my-0  my-14 w-full  object-cover cursor-pointer hover:scale-104 hover:transition-transform hover:duration-200 duration-300 rounded-sm hover:border-2 hover:border-[black]"
              />
              <button className="uppercase font-semibold text-sm  px-4 py-2 shadow-sm absolute bottom-3 left-3 bg-slate-50  border border-gray-100">
                {image.label}
              </button>
            </div>
          );
        })}

        {/* pop up image ternary logic */}
        {selectedImg && (
          <div
            onClick={() => setSelectedImg(null)}
            className="inset-0 fixed bg-black/80 flex items-center justify-center z-50"
          >
            <img
              src={selectedImg}
              className="max-w-[90%] max-h-[90%] shadow-2xl rounded-3xl border-4 border-[#d8a15a] inset-0"
            />
          </div>
        )}
      </div>

      {/*featured content */}
      <div className=" flex md:flex-row flex-col items-center justify-center md:mx-auto mx-auto md:px-60 container my-16">
        {features.map((feature) => (
          <div key={feature.id} className="border border-gray-200 w-full p-4 ml-4">
            <h4 className="font-bold md:text-[1.54rem] text-[1.2rem] font-bricolage text-black/80 mb-2">
              {feature.title}
            </h4>
            <p className="font-plex text-normal text-[#8b5e2b] text-[15px] ">
              {feature.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
