import { useEffect, useRef, useState } from "react";
import { smoothScrollTo } from "../../lib/smoothScroll";
import useActiveSection from "../../lib/useActiveSection";

export default function Navbar() {
  const sectionIds = ["home", "career", "about"];
  const activeId = useActiveSection(sectionIds, 80);

  const linksRef = useRef(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  const updateBar = () => {
    const wrap = linksRef.current;
    if (!wrap) return;
    const activeEl = wrap.querySelector(`[data-id="${activeId}"]`);
    if (!activeEl) return;
    const wrapRect = wrap.getBoundingClientRect();
    const rect = activeEl.getBoundingClientRect();
    setBar({ left: rect.left - wrapRect.left, width: rect.width });
  };

  useEffect(() => { updateBar(); }, [activeId]);

  useEffect(() => {
    const onResize = () => updateBar();
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) document.fonts.ready.then(updateBar);
    const t = setTimeout(updateBar, 0);
    return () => { window.removeEventListener("resize", onResize); clearTimeout(t); };
  }, []);

  const onClick = (e, id) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-black/5">
      <div className="h-full px-6 md:px-12 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-orange-500">AspICT</a>

        <div ref={linksRef} className="relative flex items-center gap-6 md:gap-10">
          {sectionIds.map((id) => {
            const active = activeId === id;
            return (
              <a
                key={id}
                data-id={id}
                href={`#${id}`}
                onClick={(e) => onClick(e, id)}
                className={[
                  "pb-2 text-sm md:text-base transition-colors",
                  active ? "text-orange-600 font-semibold" : "text-gray-600 hover:text-gray-900"
                ].join(" ")}
                aria-current={active ? "true" : undefined}
              >
                {id.toUpperCase()}
              </a>
            );
          })}

          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 h-[2px] bg-orange-500 rounded-full transition-all duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(${bar.left}px)`, width: `${bar.width}px` }}
          />
        </div>
      </div>
    </nav>
  );
}
