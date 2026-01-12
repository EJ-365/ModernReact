export const Footer = ({toggle}) => {
    return (
        <footer className={`text-center ${toggle && 'bg-purple-300'}  p-10 px-20 text-purple-600 bg-purple-200`}>
            <p>
                <span>All right reserved &copy; {new Date().getFullYear()}</span>
            </p>
            <p>Designed with 💜 by Ejay Gabriel</p>
        </footer>
    )
}