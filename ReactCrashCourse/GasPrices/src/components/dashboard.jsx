import QuickSummary from "./quickSummary";
import Region from "./region";
import SinglePriceCardDisplay from "./singlePriceCardDisplay";

function Dashboard() {
  return (
    <main>
      <div className="my-4 flex xl:flex-row flex-col items-center container mx-auto ">
        <SinglePriceCardDisplay />
        <QuickSummary/>
      </div>

       <Region/>
    </main>
  );
}

export default Dashboard;

{/**Note: Remove justify center  */}