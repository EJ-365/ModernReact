import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { FuelProvider } from "./context/FuelProvider";
function App() {
  return (
    <FuelProvider>
      <div className="bg-slate-950 text-white mx-auto ">
        <Header />
        <Dashboard />
        <Footer />
      </div>
    </FuelProvider>
  );
}
export default App;
