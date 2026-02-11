import Header from "./Header";
import SideBar from "./SideBar";
import sampleData from "./sideBarData";
import Footer from "./Footer";
import { useState } from "react";
export default function App() {
  // state for toggling sidebar 
  const[isOpen, setIsOpen]= useState(false);
  return (
    <div className="">
      <Header onMenuClick={() => setIsOpen(!isOpen)} />
      <SideBar sampleData={sampleData} isOpen={isOpen} onClose={() => setIsOpen(false)}/>
      <Footer/>
    </div>
  );
}
