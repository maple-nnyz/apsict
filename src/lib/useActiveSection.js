import { useEffect, useState } from "react";

/**
 * ติดตามว่า section ไหนกำลังอยู่ใน viewport
 * @param {string[]} ids - ["home","career","about"]
 * @param {number} offset - กันชนบน (px) ประมาณความสูง navbar
 */
export default function useActiveSection(ids, offset = 80) {
  const [activeId, setActiveId] = useState(ids[0] ?? null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    // ให้จุดโฟกัสอยู่ประมาณ 35% จากบนจอ จะได้เปลี่ยน active ตรงใจ
    const obs = new IntersectionObserver(
      (entries) => {
        // เลือกอันที่กินพื้นที่ใน viewport มากสุด
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id;
          setActiveId(id);
        } else {
          // ถ้าเลื่อนผ่าน ๆ ใช้ตัวที่อยู่เหนือสุดในหน้าต่าง
          const topMost = entries
            .slice()
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (topMost) setActiveId(topMost.target.id);
        }
      },
      {
        root: null,
        // เลื่อนกรอบตรวจลงมาประมาณ offset และยกฐานล่างขึ้นเพื่อกันชน
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids, offset]);

  return activeId;
}
