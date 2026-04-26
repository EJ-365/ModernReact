import Cards from "./Cards";
import SideBar from "./Cart";
import Navbar from "./Navbar";
function Home() {
  return (
    <main>
      <Navbar />
      <section className="flex-1 flex justify-center p-10">
        <div>
          <h1 className="uppercase mb-4 ml-4 font-bold">products</h1>

          <div className="max-w-xl   mx-4 flex flex-wrap justify-evenly items-center gap-6 md:grid md:grid-cols-2 mr-10 p-4">
            {/* individual cards component goes here */}
            <Cards />
          </div>
        </div>
        <SideBar />
      </section>
    </main>
  );
}

export default Home;
