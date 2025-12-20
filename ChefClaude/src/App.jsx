import "./index.css";
export default function App() {
  return (
    <div>
      <Header />
      <Form />
    </div>
  );
}

// header componet
function Header() {
  return (
    <header className="bg-slate-200 p-4 shadow-md">
      <h1 className="text-center md:text-4xl text-2xl md:font-semibold capitalize md:my-4 my-2">
        {" "}
        <i className="bx bx-chef-hat mx-3"></i>Chef Claude
      </h1>
    </header>
  );
}

// form component
function Form() { 
  return (
    <main>
      <form className="flex md:flex-row flex-col justify-center md:my-16 my-20">
        {/* input form div */}

        <div className="md:mx-10 mx-auto md:my-0 my-10  ">
          <input type="text" aria-label="Add ingredient" placeholder="e.g. oregano" className="md:w-90 w-full px-2 py-2 outline-1 rounded-sm active:ring-2 active:ring-blue-800 hover:outline-2"/>
        </div>

        {/* add ingredient button div */}
        <div className="text-white text-center ">
          <button className="bg-black py-2 px-4 rounded-md cursor-pointer"> <i className="bx bx-plus mx-1"></i> Add ingredient</button>
        </div>
      </form>
    </main>
  );
}
