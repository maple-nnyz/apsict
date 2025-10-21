import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import careers from "../../data/career/careers.json";
import CareerDetail from "../../components/careerdetail";

const TAGS = ["ALL", "GAME", "NETWORK", "DIGITAL"];
const toTagKey = (id) => id.toLowerCase();

export default function CareersList() {
    const [q, setQ] = useState("");
    const tabsWrapRef = useRef(null);
    const [activeTag, setActiveTag] = useState("ALL");
    const barRef = useRef(null);
    const labelRefs = useRef({});
    const updateBar = () => {
        const wrap = tabsWrapRef.current;
        const bar = barRef.current;
        const lab = labelRefs.current[activeTag];
        if (!wrap || !bar || !lab) return;
        const wrapBox = wrap.getBoundingClientRect();
        const labBox = lab.getBoundingClientRect();
        const left = labBox.left - wrapBox.left;
        bar.style.width = `${labBox.width}px`;
        bar.style.transform = `translateX(${left}px)`;
        bar.style.opacity = "1";
    };

    useLayoutEffect(() => {
        updateBar();
    }, [activeTag]);
    useEffect(() => {
        const onResize = () => updateBar();
        window.addEventListener("resize", onResize);
        if (document.fonts?.ready) document.fonts.ready.then(updateBar);
        const t = setTimeout(updateBar, 0);
        return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(t);
        };
    }, []);

    const items = useMemo(() => {
        const kw = q.trim().toLowerCase();
        let list = careers;

        if (activeTag !== "ALL") {
        const k = toTagKey(activeTag);
        list = list.filter((c) => Array.isArray(c.tags) && c.tags.includes(k));
        }
        if (kw) {
        list = list.filter(
            (c) =>
            (c.name_th || "").toLowerCase().includes(kw) ||
            (c.overview || "").toLowerCase().includes(kw)
        );
        }
        return list;
    }, [q, activeTag]);

    const [showModal, setShowModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selected, setSelected] = useState(null);
    const openDetail = (c) => {
        setSelected(c);
        setShowModal(true);
        requestAnimationFrame(() => {
        setModalVisible(true);
        });
    };

    useEffect(() => {
        if (showModal) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
        document.body.style.overflow = "";
        };
    }, [showModal]);

    useEffect(() => {
        if (!showModal) return;
        const onKey = (e) => e.key === "Escape" && closeDetail();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [showModal]);

    const closeDetail = () => {
        setModalVisible(false);
    };

    const TOOL_LEVELS = {
        basic: {
        label: "พื้นฐาน",
        badge: "bg-emerald-900/20 border-emerald-500/30",
        },
        intermediate: {
        label: "ระดับกลาง",
        badge: "bg-sky-900/20 border-sky-500/30",
        },
        advanced: {
        label: "ขั้นสูง",
        badge: "bg-fuchsia-900/20 border-fuchsia-500/30",
        },
    };

    function normalizeTools(t) {
        if (!t) return [];
        if (Array.isArray(t))
        return [{ key: "all", label: "เครื่องมือ", items: t }];
        if (typeof t === "object") {
        return Object.keys(TOOL_LEVELS)
            .map((k) => ({
            key: k,
            label: TOOL_LEVELS[k].label,
            items: Array.isArray(t[k]) ? t[k] : [],
            }))
            .filter((g) => g.items.length > 0);
        }
        return [];
    }

    function badgeClass(levelKey) {
        const base = "text-sm px-2 py-1 rounded-lg border whitespace-nowrap";
        return TOOL_LEVELS[levelKey]
        ? `${base} ${TOOL_LEVELS[levelKey].badge}`
        : `${base} bg-white/10 border-white/10`;
    }

    return (
        <>
        <div className="w-screen h-screen">
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-[#141414]/10">
                <div className="h-16 px-6 md:px-12 relative flex items-center">
                    {/* โลโก้ซ้าย */}
                    <a href="/" className="text-xl font-bold text-orange-500">AspICT</a>

                    {/* ช่องค้นหากึ่งกลางแท้ ๆ */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full max-w-xl px-4 pointer-events-auto">
                        <label htmlFor="search" className="sr-only">ค้นหาอาชีพ</label>
                        <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="ค้นหาอาชีพ…"
                        className="w-full h-10 rounded-lg border border-[#141414]/20 px-4 outline-none focus:ring"
                        />
                    </div>
                    </div>
                </div>
            </nav>
            <main className="pt-24">
                <h1 className="text-3xl font-semibold text-center mb-6">อาชีพด้านเทคโนโลยีสารสนเทศและการสื่อสาร</h1>
                <div
                    ref={tabsWrapRef}
                    onScroll={updateBar}
                    className="relative flex justify-center gap-8 overflow-y-visible mx-12 pb-2 scrollbar-none border-b border-[#141414]/10"
                    role="tablist"
                    aria-label="Career tags"
                >
                    {TAGS.map((id) => {
                        const active = activeTag === id;
                        return (
                            <button
                                key={id}
                                role="tab"
                                aria-selected={active}
                                onClick={() => setActiveTag(id)}
                                className={`text-base md:text-md transition-colors ${
                                    active
                                    ? "text-orange-500"
                                    : "text-[#141414]/80 hover:text-[#141414]"
                                }`}
                            >
                                <span
                                    ref={(el) => (labelRefs.current[id] = el)}
                                    className="inline-block px-0.5"
                                >
                                    {id}
                                </span>
                            </button>
                        );
                    })}
                    <span
                        ref={barRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full bg-orange-500 transition-[transform,width,opacity] duration-300 ease-out"
                        style={{ width: 0, transform: "translateX(0px)", opacity: 0 }}
                    />
                </div>
                <div className="w-full max-w-[128rem] mx-auto mt-4
                    flex flex-col h-[calc(90dvh-10rem)] max-h-[calc(90dvh-10rem)]"
                >
                    <div className="flex-1 min-h-0 overflow-y-auto mx-10">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-3 items-stretch">
                            {items.map((c) => (
                                <article
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => openDetail(c)}
                                className="group relative flex flex-col h-64
                                            rounded-2xl p-5 cursor-pointer overflow-hidden
                                            border border-transparent hover:border-orange-500
                                            shadow shadow-[0_0_10px_rgba(0,0,0,0.4)] hover:shadow-orange-500/50
                                            hover:bg-white/10 transition"
                                >
                                    <h3 className="text-lg text-center font-semibold">{c.name_th}</h3>

                                    <p className="mt-2 text-sm opacity-80 line-clamp-3" title={c.overview}>
                                        {c.overview}
                                    </p>

                                    <div className="mt-3 text-sm flex-1 min-h-0 opacity-80 overflow-hidden">
                                        {Array.isArray(c.responsibilities) && (
                                        <ul className="list-disc pl-5 space-y-1">
                                            {c.responsibilities.slice(0, 3).map((r, i) => (
                                            <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                        )}

                                    </div>
                                    <span className="pointer-events-none absolute bottom-4 right-5 text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform">
                                        ดูรายละเอียด
                                    </span>
                                </article>
                            ))}
                        </div>
                    </div>
                    {showModal && (
                        <CareerDetail
                            selected={selected}
                            modalVisible={modalVisible}
                            closeDetail={closeDetail}
                            setShowModal={setShowModal}
                            setSelected={setSelected}
                            normalizeTools={normalizeTools}
                            badgeClass={badgeClass}
                            TOOL_LEVELS={TOOL_LEVELS}
                        />
                        )}
                </div>
            </main>
        </div>
        </>
  );
}
