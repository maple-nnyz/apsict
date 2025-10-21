import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "../../typerwriter";

import ictImg from "../../../assets/ictImg.png"

export default function CareerSection({ holdMs = 7200, fadeMs = 220 }) {
  const variants = useMemo(
    () => [
      {
        title: "สาย Game",
        desc:
          "สายอาชีพที่เน้นการออกแบบ พัฒนา และสร้างประสบการณ์ความบันเทิงผ่านเกมดิจิทัล ผู้ที่สนใจในด้านนี้มักมีความคิดสร้างสรรค์ ชอบการออกแบบ การเขียนโปรแกรม และเข้าใจพฤติกรรมของผู้เล่น",
      },
      {
        title: "สาย Network",
        desc:
          "สายอาชีพที่เกี่ยวข้องกับระบบเครือข่าย การเชื่อมต่อข้อมูล และความปลอดภัยทางไซเบอร์ เหมาะสำหรับผู้ที่มีทักษะด้านการวิเคราะห์ การแก้ปัญหา และสนใจการทำงานกับโครงสร้างพื้นฐานของระบบ IT",
      },
      {
        key: "digital",
        title: "สาย Digital",
        desc:
          "สายอาชีพที่เน้นการประยุกต์ใช้เทคโนโลยีเพื่อสร้างสรรค์นวัตกรรมในโลกดิจิทัล เหมาะกับผู้ที่สนใจการออกแบบ การสื่อสาร และเทคโนโลยีดิจิทัลสมัยใหม่",
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
        setIdx(i => (i + 1) % variants.length);
      }, fadeMs);
    }, holdMs);

    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [descDone, holdMs, fadeMs, variants.length]);

  const v = variants[idx];

  const toCareer = () => {
    setLoading(true)
    setTimeout(() => {
      navigate("/careerslist");
    }, 300);
  }

  return (
    <>
      <div className="mx-auto px-16 md:px-24 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="pr-16">
            <h1 className="text-3xl md:text-4xl pb-4 font-semibold">
              อาชีพด้านเทคโนโลยีสารสนเทศและการสื่อสาร
            </h1>
            <p className="text-base md:text-xl pb-4 opacity-90">
              ในยุคดิจิทัลที่เทคโนโลยีเข้ามามีบทบาทสำคัญในทุกด้านของชีวิตประจำวัน
              สาขาเทคโนโลยีสารสนเทศและการสื่อสาร จึงเป็นสาขาที่มีความสำคัญและมีอาชีพที่หลากหลายให้เลือกตามความสนใจและความถนัด
              โดยสามารถแบ่งออกได้เป็น 3 สายหลัก ดังนี้
            </p>

            <div className="relative">
              <div className="invisible block text-xl md:text-2xl font-bold tracking-tight whitespace-pre-wrap">
                {v.title}
              </div>
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  fading ? "opacity-0" : "opacity-100"
                }`}
              >
                <Typewriter
                  text={v.title}
                  speed={40}
                  className="block text-xl md:text-2xl font-bold tracking-tight whitespace-pre-wrap"
                  onDone={() => setTitleDone(true)}
                />
              </div>
            </div>

            <div className="relative pr-24 mt-2 mr-12">
              <div className="invisible block text-base sm:text-lg md:text-xl leading-relaxed opacity-90 whitespace-pre-wrap">
                {v.desc}
              </div>
              {titleDone ? (
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    fading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <Typewriter
                    text={v.desc}
                    speed={18}
                    startDelay={150}
                    className="block text-base sm:text-lg md:text-xl leading-relaxed opacity-90 whitespace-pre-wrap"
                    onDone={() => setDescDone(true)}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-4">
                <button onClick={toCareer} className="inline-flex items-center justify-center
                       rounded-xl px-6 py-2.5 sm:px-8 sm:py-3
                       text-sm sm:text-base
                       h-[46px] sm:h-[56px]
                       text-white bg-[#141414]/80 border border-[#141414]/20
                       shadow-[0_0_10px_rgba(0,0,0,0.4)]
                       hover:bg-orange-500 hover:shadow-orange-500 transition"
                >
                    รายการอาชีพ
                </button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <img src={ictImg} alt="ictImg" />
          </div>
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
