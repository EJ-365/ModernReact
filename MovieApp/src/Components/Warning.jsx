const MESSAGE =
  "Work in progress — not fully done, thank you for understanding";

function Warning() {
  return (
    <div className="w-full shrink-0 overflow-hidden bg-red-500">
      <div className="flex w-max animate-warning-marquee">
        <span className="mx-8 py-1 text-sm font-medium uppercase text-white whitespace-nowrap shrink-0">
          {MESSAGE} ⚠️
        </span>
        <span className="mx-8 py-1 text-sm font-medium uppercase text-white whitespace-nowrap shrink-0">
          {MESSAGE} ⚠️
        </span>
      </div>
    </div>
  );
}

export default Warning;
