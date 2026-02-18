import Cards from "./Cards"

export default function CardList({data, toggle}) {
  return (
   <div className="mx-3 grid grid-cols-1 md:flex md:flex-row md:justify-center md:flex-wrap xl:grid-cols-4 sm:grid-cols-1 gap-4 md:mt-4 mt-10">
    {
    data.map(item => (
       <Cards item={item} key={item.id} toggle={toggle}/>
    ))
    }
   </div>
  )
}
