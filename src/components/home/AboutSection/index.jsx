export default function AboutSection() {
    return (
        <>
            <div className="w-full items-center text-white bg-[#141414]">
                <div className="p-12">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        เกี่ยวกับระบบแนะนำอาชีพ <span className="text-orange-500">ICT</span>
                    </h1>
                    <p className="mt-3 text-lg md:text-xl opacity-90">
                        ระบบนี้ออกแบบมาเพื่อช่วยนักศึกษา/ผู้สนใจด้านเทคโนโลยีสารสนเทศและการสื่อสาร (ICT) 
                        ค้นหา “เส้นทางอาชีพที่เหมาะสม” โดยอาศัยแบบทดสอบ 40 ข้อ
                        แล้วคำนวณความสอดคล้องกับอาชีพในสาย Game, Network, Digital (รวม 24 อาชีพยอดนิยม เช่น Game Dev, UX/UI, Front-End, Data Analyst, DevOps, Cloud, Cybersecurity ฯลฯ) 
                        ก่อนสรุป Top-3 อาชีพ
                    </p>

                    <div className="mt-4">
                        <h2 className="text-2xl md:text-3xl font-bold">ระบบทำงานอย่างไร</h2>
                            <ol className="mt-4 grid md:grid-cols-4 gap-4">
                            {[
                                { n: 1, t: "ตอบแบบทดสอบ 40 ข้อ" },
                                { n: 2, t: "วิเคราะห์ 10 มิติทักษะ" },
                                { n: 3, t: "จับคู่กับโปรไฟล์อาชีพ" },
                                { n: 4, t: "สรุป Top-3 + แผนพัฒนา" },
                            ].map((s) => (
                                <li key={s.n} className="rounded-2xl grid place-items-center p-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white grid place-items-center font-bold mr-4">
                                        {s.n}
                                    </div>
                                    <p className="mt-2 font-medium">{s.t}</p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="mt-4">
                        <h3 className="text-xl md:text-2xl font-bold">เกี่ยวกับแบบทดสอบ 40 ข้อ</h3>
                        <ul className="mt-3 list-disc pl-5 space-y-1">
                            <li>Forced-choice 28 ข้อ · Likert 10 ข้อ · สถานการณ์ (SJT) 2 ข้อ</li>
                            <li>ออกแบบคำถามแบบ “อ้อม ๆ” ไม่เอ่ยชื่ออาชีพเพื่อลดอคติ</li>
                            <li>คำตอบถูกแม็ปสู่ 10 มิติ: proto, ops, debug, data, aesthetic, security, collab, product, cloud_arch, communication</li>
                            <li> ใช้เวลา 5 – 8 นาที</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}