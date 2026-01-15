export default function Footer() {
    return (
        <footer className="bg-black/90 text-zinc-400 p-4">
            <div className="flex items-center justify-center my-4">
                <p>&copy; {new Date().getFullYear()} All rights reserved.</p>

            </div>
        </footer>
    )
}