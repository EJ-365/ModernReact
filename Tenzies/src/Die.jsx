
function Die({ dieNum, isHeld, hold, gameWon }) {
   return (
<div>
<button className={`w-12 h-14 p-2 shadow-xl border rounded-2xl  text-black text-3xl font-bold border-none ${isHeld ? "bg-[#59E391]" : "bg-[#F5F5F5]"} ${gameWon ? "disabled:cursor-not-allowed" : "cursor-pointer" }`} onClick={hold} disabled={gameWon }>{dieNum}</button>
</div>
      


   )

}

export default Die;


