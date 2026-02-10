import Header from "./Header";
import SideBar from "./SideBar";
import sampleData from "./sideBarData";
export default function App() {
  return (
    <div className="">
      <Header />
      <SideBar sampleData={sampleData} />
    </div>
  );
}
