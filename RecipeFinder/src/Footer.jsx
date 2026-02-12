export default function Footer(){
    return(
        <footer className="flex items-center flex-col p-12 text-gray-500 bg-zinc-100 text-sm border-t border-gray-200 h-10">
            <p>All right reserved @ {new Date().getFullYear()}</p>
            <p className="underline">Designed and built by Ejay Gabriel</p>
        </footer>
    )
}