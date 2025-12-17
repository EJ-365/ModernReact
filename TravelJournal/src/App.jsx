import "./index.css";
import { data } from "./journalData";
function App(){
  return (
    <>
    <Header/>
    <Body/>
    </>
  )
}

function Header(){
  return (
    <header>
      <h1 className="text-center text-3xl bg-rose-500  p-8 text-white font-semibold w-full">
      <i class='bx  bx-globe text-center'></i> My Travel Journal
       </h1>
    </header>
  )
}

function Body(){
  return (
    <div>
      {data.map((item) => {
        return <Item item={item} key={item.id}/>
      })}
    </div>
  )
}

function Item({item}){
return(
  <div className="flex flex-col items-center mb-10 mx-auto container my-20 md:flex-row md:justify-start">
    <div className="flex flex-col items-center mx-4 md:flex-row md:justify-start md:mx-24">
      {/*images */}
     <img src={item.image} alt={`${item.place}, ${item.countryName}`} className="w-auto md:w-80 rounded-2xl mb-4 md:mb-0 md:mr-8" />
 
      {/*text contens */}
      <div className="text-center md:text-left">
      <h3 className="text-xl font-semibold mx-4 md:mx-0"><i className="bx bx-location mx-4 text-xl"></i>{item.countryName.toUpperCase()} <a href={item.googleMapLink} 
      className="text-blue-600 text-sm font-normal mx-4 md:mx-0 underline">View on Google Maps</a></h3>
       <h1 className="text-4xl font-bold mx-4 my-4 md:mx-0">{item.place}</h1>
       <h4 className="font-semibold text-xl mx-4 md:mx-0">{item.date}</h4>
       <p className="text-base max-w-full mx-4 my-4 md:text-lg md:max-w-1/2 md:mx-0">{item.content}</p>
      </div>

    </div>

  </div>
)
}

/****************************************END************************************* */
export default App;
