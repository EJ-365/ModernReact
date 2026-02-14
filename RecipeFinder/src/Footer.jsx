export default function Footer({ toggle }) {
    return (
        <footer className={`flex items-center flex-col p-12   text-sm border-t ${toggle ? "bg-gray-900 border-gray-100 text-gray-200" : "bg-gray-100/80 text-gray-400"} h-10`}>
            <p>All right reserved @ {new Date().getFullYear()}</p>
            <p className="underline">Designed and built by Ejay Gabriel</p>
        </footer>
    )
}