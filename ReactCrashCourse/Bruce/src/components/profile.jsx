function Profile() {
  return (
    <>
      <section id="profile-section" className="flex md:flex-row flex-col items-center md:justify-evenly justify-center w-full max-w-full my-10 bg-[#8b5e2b] text-white px-6 py-16 md:p-18 overflow-x-hidden">
        {/* text content  A */}
        <div className="md:mr-0">
          <p className="text-[#d8a15a] font-plex md:text-left text-center md:text-[15px] text-xs capitalize font-semibold my-4 ">
            01/profile
          </p>
          <h2 className="text-gray-100/95 text-center md:text-left md:text-7xl text-2xl font-bricolage font-black md:w-100 w-full">
            Small paws. Big character.
          </h2>
          <p className="md:text-[17px] text-sm md:w-100 text-gray-100/80 mt-8 md:text-left  text-center mb-20">
            Bruce balances a bold fox face with an unmistakably huggable
            silhouette. The blue eyes bring the spark; the oversized paws keep
            him grounded.
          </p>
        </div>


        {/* text content B */}
        <div className="md:mx-0 mx-0 w-full max-w-full md:w-auto min-w-0">
          <div className="md:w-160 w-full h-px bg-gray-100/30" /> {/* decor */}
          <div className="flex items-center text-left my-5 min-w-0">
            <span className="text-gray-100/80 mr-6 md:mr-18 font-light uppercase font-plex tracking-wide md:text-[14px] text-[12px] align-middle text-left shrink-0">
              Species
            </span>
            <h3 className="text-gray-100/95  font-bricolage font-black md:text-[2rem] text-[0.99rem] text-left">
              Fox, plush variety
            </h3>
          </div>
          <div className="md:w-160 w-full h-px bg-gray-100/30" /> {/* decor */}
          <div className="flex items-center text-left my-5 min-w-0">
            <span className="text-gray-100/80 mr-6 md:mr-18 font-light uppercase font-plex tracking-wide md:text-[14px] text-[12px] align-middle text-left shrink-0">
              Palette
            </span>
            <h3 className="text-gray-100/95  font-bricolage font-black md:text-[2rem] text-[0.99rem] text-left">
              Russet, white & midnight
            </h3>
          </div>
          <div className="md:w-160 w-full h-px bg-gray-100/30" /> {/* decor */}
          <div className="flex items-center text-left my-5 min-w-0">
            <span className="text-gray-100/80 mr-6 md:mr-18 font-light uppercase font-plex tracking-wide md:text-[14px] text-[12px] align-middle text-left shrink-0">
              Signature
            </span>
            <h3 className="text-gray-100/95  font-bricolage font-black md:text-[2rem] text-[0.99rem] text-left">
              Bright blue eyes
            </h3>
          </div>
          <div className="md:w-160 w-full h-px bg-gray-100/30" /> {/* decor */}
          <div className="flex items-center text-left my-5 min-w-0">
            <span className="text-gray-100/80 mr-6 md:mr-18 font-light uppercase font-plex tracking-wide md:text-[14px] text-[12px] align-middle text-left shrink-0">
              Energy
            </span>
            <h3 className="text-gray-100/95  font-bricolage font-black md:text-[2rem] text-[0.99rem] text-left">
              Calm, curious, loyal
            </h3>
          </div>
          <div className="md:w-160 w-full h-px bg-gray-100/30" /> {/* decor */}
        </div>
      </section>
    </>
  );
}

export default Profile;
