import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "../../typerwriter";

export default function HeroSection({ holdMs = 7200, fadeMs = 220 }) {
  const variants = useMemo(
    () => [
      {
        title: "Welcome to ICT Career",
        desc: "ระบบแนะนำอาชีพสำหรับนักศึกษา ICT วิเคราะห์ความถนัด-ความสนใจจากแบบทดสอบ 40 ข้อ แล้วบอกคุณว่าเหมาะกับอาชีพไหน",
      },
      {
        title: "ค้นหาอาชีพที่ “ใช่” สำหรับคุณ",
        desc: "ทำแบบทดสอบ ไม่กี่นาที ระบบจะแปลงคำตอบเป็นโปรไฟล์ทักษะและแนะอาชีพที่เหมาะกับคุณ",
      },
      {
        title: "Aspire Career",
        desc: "แพลตฟอร์มแนะแนวอาชีพโดยใช้เวกเตอร์คุณลักษณะและความคล้ายคลึงกับผู้เชี่ยวชาญ เพื่อเสนอ Top 3 อาชีพที่เหมาะสม",
      },
      {
        title: "ยังไม่แน่ใจจะไปสายไหนดี?",
        desc: "ทำแบบทดสอบสั้น ๆ แล้วดูว่าโปรไฟล์ของคุณใกล้กับอาชีพไหนมากที่สุด",
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [titleDone, setTitleDone] = useState(false);
  const [descDone, setDescDone] = useState(false);
  const [fading, setFading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const holdTimer = useRef(null);
  const fadeTimer = useRef(null);

  useEffect(() => {
    setTitleDone(false);
    setDescDone(false);
    setFading(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
  }, [idx]);

  useEffect(() => {
    if (!descDone) return;
    holdTimer.current = setTimeout(() => {
      setFading(true);
      fadeTimer.current = setTimeout(() => {
        setIdx((i) => (i + 1) % variants.length);
      }, fadeMs);
    }, holdMs);

    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [descDone, holdMs, fadeMs, variants.length]);

  const v = variants[idx];

  const toQuiz = () => {
    setLoading(true)
    setTimeout(() => {
      navigate("/quiz");
    }, 300);
  }

  return (
    <>
      <div className="w-full px-6 text-center">
        <div
          className={`transition-opacity duration-200 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
            <div className="min-h-[4.5rem] sm:min-h-[5.5rem] md:min-h-[6.5rem] flex items-end justify-center">
                <Typewriter
                    text={v.title}
                    speed={40}
                    className="block text-5xl md:text-6xl font-bold tracking-tight"
                    onDone={() => setTitleDone(true)}
                />
            </div>

          <div className="mt-3 sm:mt-4 mx-auto max-w-3xl min-h-[5.5rem] sm:min-h-[4.5rem] grid items-start justify-items-center">
            {titleDone ? (
              <Typewriter
                text={v.desc}
                speed={18}
                startDelay={150}
                className="block text-base sm:text-lg md:text-2xl leading-relaxed opacity-90 text-center"
                onDone={() => setDescDone(true)}
              />
            ) : (
              <span className="invisible text-base sm:text-lg md:text-2xl leading-relaxed">
                placeholder
              </span>
            )}
          </div>
        </div>
        <div className="pt-4 sm:pt-6">
            <button
              onClick={toQuiz}
              className="inline-flex items-center justify-center
                       rounded-xl px-6 py-2.5 sm:px-8 sm:py-3
                       text-sm sm:text-base
                       h-[46px] sm:h-[56px]
                       text-white bg-[#141414]/80 border border-[#141414]/20
                       shadow-[0_0_10px_rgba(0,0,0,0.4)]
                       hover:bg-orange-500 hover:shadow-orange-500 transition"
            >
              เริ่มต้นทำแบบทดสอบ
            </button>
          </div>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </>
  );
}
