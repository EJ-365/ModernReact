import seeForYourself from "./assets/see-for-yourself.webp";
export default function Footer() {
  return (
    <footer className="flex bg-[#313131] text-center md:justify-evenly  justify-centerpx-20 text-gray-200 items-center md:flex-row  flex-col">
      <div className="py-10">
        <img src={seeForYourself} />
      </div>
      <div className="flex items-center">
        <p className="text-xs">
          © 1997-2026 Blackboard Inc. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
