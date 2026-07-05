export default function ExpenseForm() {
  return (
   <form>
    {/* starting balance UI */}
    <div className="border text-center w-1/2 p-3">
        <p className="uppercase text-zinc-700 text-sm">set starting balance</p>
        <input value={1000} className="border w-60 py-1 px-2 rounded-md"/>
    </div>

   </form>
  )
}
