import Die from "./Die";
function App() {
  return (
    <main className="h-screen w-full border-70 p-5 mx-auto box-border items-center justify-center flex rounded ">
      <div className="text-[#F5F5F5] border-8 p-20 w-auto lg:space-x-4 grid lg:grid-cols-5 lg:gap-10 md:grid-cols-5 gap-4 space-x-2  grid-cols-2">
        <Die dieNum={1}/>
        <Die dieNum={2}/>
        <Die dieNum={3}/>
        <Die dieNum={4}/>
        <Die dieNum={5}/>
        <Die dieNum={6}/>
        <Die dieNum={1}/>
        <Die dieNum={1}/>
        <Die dieNum={1}/>
        <Die dieNum={1}/>
      </div>
    </main>
  )
}



/*********DO NOT ENTER*********🚫⛔⛔⛔********DO NOT ENTER*************/
export default App;