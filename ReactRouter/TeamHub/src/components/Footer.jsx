export default function Footer() {
  return (
    <footer className="border-t bg-[rgb(247,246,248)] px-10 py-16 border-slate-200 text-slate-700 w-full">
      <div className="flex items-center justify-evenly">
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
      </div>

      <div className="text-slate-700 flex items-center justify-center space-x-4 my-8 text-2xl">
      <i class="bx bx-globe" />
      <i class="bxf bx-group" />
      <i class="bxf bx-envelope" />
      </div>

      <div className="text-center">
        <p>@{new Date().getFullYear()} team Hub. All rights reserved.</p>
      </div> 
    </footer>
  );
}