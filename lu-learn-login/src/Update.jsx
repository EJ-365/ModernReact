import updateData from "./updateData";
export default function Update() {
  return (
    <section className="w-full bg-[#ffffff] px-20 py-10 shadow-2xs border-t border-b border-[#d3d3d3] flex items-center md:justify-start justify-center md:mx-auto md:container">
      <Alert />
    </section>
  );
}

function Alert() {
  return (
    <div className="md:ml-16">
      {updateData.map((item) => (
        <div key={item.id} className="mb-4">
          <h2 className="text-2xl font-bold mb-3">{item.title}</h2>
          <p className="whitespace-pre-line text-[#666666] text-lg">
            {item.segments ? (
              /* Handle Item 3 & 4 with multiple links */
              item.segments.map((seg, index) => (
                <span key={index}>
                  {seg.link ? (
                    <a
                      href={seg.link}
                      className="text-[#c20d0f] hover:underline decoration-dotted"
                    >
                      {seg.text}
                    </a>
                  ) : (
                    seg.text
                  )}
                </span>
              ))
            ) : (
              /* Handle Item 1 & 2 with single link structure */
              <>
                {item.textBefore}
                {item.linkText && (
                  <a
                    href={item.linkUrl}
                    className="text-[#c20d0f] underline hover:decoration-dotted"
                  >
                    {item.linkText}
                  </a>
                )}
                {item.textAfter}
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
