export default function CTA() {
    return (
      <>
    <main className="bg-zinc-950 text-zinc-400 flex sm:justify-center items-center  md:flex-row flex-col justify-center">
      <div className="p-10 text-start md:w-1/2 md:ml-20">
        <p className="my-4 bg-orange-950 text-[#dd6713] rounded-full md:px-5  px-10 py-0.5 items-center md:max-w-1/2 md:w-52  border-[1.5px] border-yellow-900 uppercase md:font-semibold text-xs w-60 whitespace-normal">
          <i className="bx bx-bolt md:text-center items-center"></i> Future-Ready Learning
        </p>
        <h1 className="md:text-7xl  text-4xl font-bold leading-tight">
          Unlock Your <br />
          <span className="text-[#dd6713]">Potential</span>
        </h1>
        <p className="my-2 md:text-xl text-lg leading-loose">
          Join KeyTech today. Master tech, business, and creative <br />
          skills with our immersive, expert-led learning platform <br />
          tailored for your growth.
        </p>

        {/* start learning button*/}
        <div className="text-white capitalize my-10 flex md:flex-row flex-col items-center">
          <a
            href="#"
            className="md:px-6 md:py-2 px-10 py-1 bg-[#dd6713] rounded-full   text-white cursor-pointer hover:opacity-80 whitespace-nowrap md:font-semibold"
          >
            Start learning Free
          </a>
          <a
            href="#"
            className="md:px-6 md:py-2 mx-10 px-4 py-1 bg-zinc-900 rounded-full  text-white cursor-pointer hover:opacity-80 border-zinc-700 border mt-3 whitespace-nowrap md:font-semibold"
          >
            Browse Catalog
          </a>
        </div>

        {/* overlaping images div 12k+ students.... */}
        <div className="flex items-center mt-8">
          <div className="flex -space-x-3 mr-3">
            <img
              className="w-8 h-8 border-2 border-zinc-950 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1636910043919-c3792c7a0f60?q=80&w=1046&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="student"
            />
            <img
              className="w-8 h-8 border-2 border-zinc-950 rounded-full object-cover"
              src="https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="student"
            />

            <img
              className="h-8 w-8 border-2 border-zinc-950 rounded-full object-cover "
              src="https://plus.unsplash.com/premium_photo-1689977871600-e755257fb5f8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <p className="text-zinc-400 mx-8 text-sm">
              <span>
                {" "}
                <strong className="font-bold text-white">12K+</strong> students
                joined this week
              </span>
            </p>
          </div>
        </div>
      </div>

      {/*CTA image */}
      <div className="md:w-1/2 p-10">
        <img
          className="object-cover w-full h-auto rounded-lg md:m-0 my-3"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
          </div>
            </main>
            <Partnership/>
            </>
  );
}

function Partnership() {
    const partner = ["Google", "Amazon", "Meta", "Netflix", "Saleforce"];
    return (
        <ul className="text-white md:mt-28 flex md:justify-between md:flex-row flex-col justify-center bg-zinc-950 space-x-4 p-2 border border-zinc-800 border-x-0 items-center">
            <p className="text-center my-6 text-zinc-400"><i className="bx bx-business text-2xl mx-1.5 text-center items-center "></i> Trusted by leading tech firms</p>
           <div className="flex items-center flex-col">
            <li>
                {partner.map(item => (
                    <a className="md:mx-4 mx-1 md:text-lg text-zinc-500 md:font-bold uppercase" href="#">{ item}</a>
                ))}
                </li>
                </div>
        </ul>
    )
}