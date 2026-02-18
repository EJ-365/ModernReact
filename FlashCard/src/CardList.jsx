import Cards from "./Cards"

export default function CardList({data}) {
  return (
   <div className="mx-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 sm:grid-cols-1 gap-4">
    {
    data.map(item => (
       <Cards item={item} key={item.id}/>
    ))
    }
   </div>
  )
}
