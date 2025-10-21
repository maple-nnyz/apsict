import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useSequence from "../../lib/useSequence";

const rawModules = import.meta.glob("../../data/quiz/*.json", { eager: true });
const QUIZ_POOL = Object.entries(rawModules).map(([path, mod]) => {
  const base = path.split("/").pop().replace(".json", ""); // e.g. quiz_chatgpt
  return { key: base, data: mod.default };
});

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateUserId() {
  return "user_" + (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10));
}

export default function Quiz() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userId, setUserId] = useState("");
    useEffect(() => {
        let uid = localStorage.getItem("quiz.user_id");
        if (!uid) {
        uid = generateUserId();
        localStorage.setItem("quiz.user_id", uid);
        }
        setUserId(uid);
    }, []);

    const [selected, setSelected] = useState(() => pickRandom(QUIZ_POOL));
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [sjtStage, setSjtStage] = useState(null);
    const [showUnanswered, setShowUnanswered] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const next = pickRandom(QUIZ_POOL);
        setSelected(next);
        setIdx(0);
        setAnswers({});
        setShowUnanswered(false);
        setSjtStage(null);
    }, [location.key]);

    const seq = useSequence(selected?.data);
    const total = seq.length;

    const current = seq[idx];
    const isLast = idx === total - 1;
    const isSJT = current?.type === "SJT";
    const sjtBest = isSJT ? answers[current?.id]?.best : undefined;
    const sjtSecond = isSJT ? answers[current?.id]?.second : undefined;

    const isAnswered = (q) => {
        const a = answers[q.id];
        if (!a) return false;
        if (q.type === "SJT") return !!(a.best && a.second);
        return true;
    };

    const indexById = useMemo(
        () => Object.fromEntries(seq.map((q, i) => [q.id, i])),
        [seq]
    );

    const answeredCount = useMemo(
        () => seq.reduce((acc, q) => (isAnswered(q) ? acc + 1 : acc), 0),
        [seq, answers]
    );

    const isAllAnswered = answeredCount === total;

    const unanswered = useMemo(
        () => seq.filter((q) => !isAnswered(q)),
        [seq, answers]
    );

    useEffect(() => {
        if (!current) return;
        if (current.type !== "SJT") {
        setSjtStage(null);
        return;
        }
        const a = answers[current.id];
        if (!a?.best) setSjtStage("best");
        else if (!a?.second) setSjtStage("second");
        else setSjtStage(null);
    }, [idx, current, answers]);

    const goNext = () => setIdx((p) => Math.min(p + 1, total - 1));
    const goPrev = () => setIdx((p) => Math.max(p - 1, 0));

    const handlePick = (choiceKey) => {
        if (!current) return;
        if (current.type === "FC" || current.type === "LIKERT") {
        setAnswers((prev) => ({ ...prev, [current.id]: choiceKey }));
        if (idx + 1 < total) goNext();
        return;
        }
        if (current.type === "SJT") {
        const curr = answers[current.id] ?? {};
        if (sjtStage === "best") {
            setAnswers((prev) => ({ ...prev, [current.id]: { best: choiceKey } }));
            setSjtStage("second");
            return;
        }
        if (sjtStage === "second") {
            if (curr.best === choiceKey) return; // ห้ามซ้ำ
            setAnswers((prev) => ({
            ...prev,
            [current.id]: { ...curr, second: choiceKey },
            }));
            if (idx + 1 < total) goNext();
            return;
        }
        }
    };

    const handleFinish = async () => {
        try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                answers, 
                user_id: userId,
                set_code: selected.key,
            }),
        });
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        navigate("/results", {
        state: {
            traits: data.traits_keys,
            user_vector: data.user_vector, 
            top: data.top,
        },
        });
        } catch (e) {
        console.error(e);
        alert("ส่งคำตอบไม่สำเร็จ ลองใหม่อีกครั้ง");
        } finally {
        setLoading(false);
        }
    };

    const handleFinishClickAtLast = () => {
        if (isAllAnswered) handleFinish();
        else setShowUnanswered(true);
    };

    return (
        <>
            <nav className="fixed top-0 inset-x-0 z-50 h-16">
                <div className="h-full px-6 md:px-12 flex items-center justify-between">
                    <a href="/" className="text-xl font-bold text-orange-500">AspICT</a>
                </div>
            </nav>
            <div className="w-screen h-screen pt-16">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold pt-6">แบบทดสอบ</h1>
                    <p className="text-[clamp(0.7rem,0.2rem+1.2vw,1rem)] px-8 py-5">แบบทดสอบ 40 ข้อ คำถามแบบ 4 ตัวเลือก คำถามระดับความถูกต้อง คำถามจำลองสถานการณ์</p>
                </div>

                <form className="place-items-center" onSubmit={(e) => e.preventDefault()}>
                    <div className="w-full max-w-[28rem] sm:max-w-[36rem] md:max-w-[48rem] lg:max-w-[86rem] min-w-0 min-h-[calc(80dvh-10rem)] mx-auto flex flex-col p-4 sm:p-6 md:p-8">
                        <span className="text-[clamp(0.1rem,0.3rem+1vw,0.9rem)]">ข้อ {Math.min(idx + 1, total)} / {total}</span>
                        <h1 className="text-[clamp(1.125rem,0.9rem+1.2vw,1.7rem)] font-bold border-b border-[#141414]/50 pt-2 pb-2">{current?.q}</h1>
                        
                        {current?.type === "SJT" && (
                            <div className="mt-2 text-sm opacity-80">
                            {sjtStage === "best" && "โปรดเลือกคำตอบที่เหมาะสมที่สุด (Best)"}
                            {sjtStage === "second" && (
                                <div className="flex items-center gap-2">
                                <span>โปรดเลือกคำตอบที่เหมาะสมรอง (Second)</span>
                                <SelectedBadge label={`Best: ข้อ ${answers[current.id]?.best}`} />
                                </div>
                            )}
                            </div>
                        )}

                        <div className="mt-3 grid gap-3">
                            {current?.options.map((opt) => {
                                const isDisabled = isSJT && sjtStage === "second" && sjtBest === opt.key;
                                const isBest = isSJT && sjtBest === opt.key;
                                const isSecond = isSJT && sjtSecond === opt.key;
                                const isPickedNonSJT = !isSJT && answers[current.id] === opt.key;

                                let pickedClass =
                                    "border-[#141414]/15 hover:bg-orange-500 hover:text-white transition";
                                if (isBest) pickedClass = "border-emerald-400 bg-emerald-500/15";
                                else if (isSecond) pickedClass = "border-sky-400 bg-sky-500/15";
                                else if (isPickedNonSJT) pickedClass = "font-bold border-orange-400 bg-orange-500/20";

                                return (
                                    <button
                                    type="button"
                                    key={opt.key}
                                    disabled={isDisabled}
                                    onClick={() => handlePick(opt.key)}
                                    className={[
                                        "w-full text-left text-[clamp(0.8rem,0.2rem+1vw,1.2rem)] rounded-lg border px-6 py-4 transition",
                                        pickedClass,
                                        isDisabled ? "opacity-40 cursor-not-allowed" : "",
                                    ].join(" ")}
                                    >
                                    <div className="flex items-start gap-3">
                                        <span>{opt.label}</span>
                                        {isBest && (
                                        <span className="ml-auto inline-flex items-center rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 text-[11px]">
                                            Best
                                        </span>
                                        )}
                                        {isSecond && (
                                        <span className="ml-auto inline-flex items-center rounded-full border border-sky-400/60 bg-sky-500/10 px-2 py-0.5 text-[11px]">
                                            Second
                                        </span>
                                        )}
                                    </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-auto pt-1 border-t border-white/10">
                                <div className="text-sm opacity-70">
                                ตอบแล้ว {answeredCount}/{total}
                                </div>
                                <div className="h-2 bg-[#141414]/10 rounded mt-2">
                                <div
                                    className="h-full bg-orange-500 rounded"
                                    style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
                                />
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="mt-6 flex items-center justify-between">
                                    <button
                                    onClick={goPrev}
                                    disabled={idx === 0}
                                    className="px-4 py-2 hover:text-orange-500 transition disabled:opacity-40"
                                    >
                                    ย้อนกลับ
                                    </button>

                                    {isLast ? (
                                    <button
                                        onClick={handleFinishClickAtLast}
                                        className={[
                                        "px-4 py-2 rounded-lg border transition",
                                        isAllAnswered
                                            ? "text-white bg-[#141414]/60 border border-[#141414]/20 shadow-[0_0_10px_rgba(0,0,0,0.4)] hover:bg-emerald-500/30 hover:border-emerald-500/30 hover:shadow-emerald-500 hover:text-emerald-900"
                                            : "text-white bg-red-500/80 border border-[#141414]/20 shadow-[0_0_10px_rgba(0,0,0,0.4)] hover:bg-red-500 hover:border-red-500/30 hover:shadow-red-500",
                                        ].join(" ")}
                                    >
                                        {isAllAnswered ? "ส่งคำตอบ" : "คำตอบไม่ครบ"}
                                    </button>
                                    ) : (
                                    <button
                                        onClick={goNext}
                                        className="px-4 py-2 rounded-lg text-white bg-[#141414]/60 border border-[#141414]/20 shadow-[0_0_10px_rgba(0,0,0,0.4)] hover:bg-orange-500 hover:shadow-orange-500 transition"
                                    >
                                        ต่อไป
                                    </button>
                                    )}
                                </div>

                                {/* Bottom sheet แจ้งข้อที่ยังไม่ได้ตอบ */}
                                {showUnanswered && !isAllAnswered && (
                                    <div className="fixed inset-x-0 bottom-0 z-50 md:bottom-6">
                                        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 backdrop-blur p-4 shadow-2xl">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="font-medium">
                                                    ยังไม่ได้ตอบ <span className="font-bold">{unanswered.length}</span> ข้อ
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                    onClick={() => setShowUnanswered(false)}
                                                    className="text-sm px-3 py-1.5 rounded-lg hover:text-red-500"
                                                    >
                                                    ปิด
                                                    </button>
                                                    {!isAllAnswered && (
                                                    <button
                                                        onClick={() => {
                                                        const first = unanswered[0];
                                                        if (first) setIdx(indexById[first.id] ?? 0);
                                                        setShowUnanswered(false);
                                                        }}
                                                        className="text-sm px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-400/40 hover:bg-orange-500/30 hover:text-white transiton"
                                                    >
                                                        ไปข้อถัดไปที่ยังไม่ได้ตอบ
                                                    </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 grid md:grid-cols-10 gap-2">
                                            {unanswered.map((q) => {
                                                const jumpTo = indexById[q.id] ?? 0;
                                                return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => {
                                                    setIdx(jumpTo);
                                                    setShowUnanswered(false);
                                                    }}
                                                    className="text-sm px-3 py-1.5 rounded-lg hover:bg-white transition"
                                                >
                                                    ข้อ {jumpTo + 1}
                                                </button>
                                                );
                                            })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                    </div>
                </form>
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                </div>
            )}
        </>
    )
}

function SelectedBadge({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 px-2.5 py-0.5 text-xs">
      {label}
    </span>
  );
}