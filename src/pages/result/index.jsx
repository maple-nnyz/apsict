import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import careers from "../../data/career/careers.json";
import CareerDetail from "../../components/careerdetail";
import TraitRadar from "../../components/traitradar";

const TH_LABELS = {
  proto: "สร้างต้นแบบ",
  ops: "ปฏิบัติการระบบ",
  debug: "ดีบัก/แก้ปัญหา",
  data: "วิเคราะห์ข้อมูล",
  aesthetic: "ความสวยงาม/ดีไซน์",
  security: "ความปลอดภัย",
  collab: "ทำงานเป็นทีม",
  product: "มุมมองผลิตภัณฑ์",
  cloud_arch: "สถาปัตยกรรมคลาวด์",
  communication: "การสื่อสาร",
};

function topNTraits(traits, vector, n = 3) {
  const arr = traits.map((t, i) => ({
    key: t,
    th: TH_LABELS[t] || t,
    val: vector[i] ?? 0,
  }));
  arr.sort((a, b) => b.val - a.val);
  return arr.slice(0, n);
}

const TOOL_LEVELS = ["all", "basic", "intermediate", "advanced"];
const GROUP_LABEL = {
  all: "All Tools",
  basic: "พื้นฐาน",
  intermediate: "ระดับกลาง",
  advanced: "ขั้นสูง",
};
const badgeClass = (groupKey = "all") =>
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs " +
  (groupKey === "advanced"
    ? "border-emerald-400/60 bg-emerald-500/10"
    : groupKey === "intermediate"
      ? "border-sky-400/60 bg-sky-500/10"
      : groupKey === "basic"
        ? "border-orange-400/60 bg-orange-500/10"
        : "border-white/20 bg-white/10");

function normalizeTools(tools) {
  if (!tools) return [];
  if (Array.isArray(tools))
    return [{ key: "all", label: GROUP_LABEL.all, items: tools }];
  const out = [];
  for (const k of TOOL_LEVELS) {
    const items = Array.isArray(tools[k]) ? tools[k] : [];
    if (items.length) out.push({ key: k, label: GROUP_LABEL[k] || k, items });
  }
  return out;
}

function findCareerDetail(roleName) {
  if (!roleName || !Array.isArray(careers)) return null;
  const norm = (s) =>
    String(s || "").toLowerCase().replace(/[\s\-_/]/g, "");

  const q = norm(roleName);
  let hit =
    careers.find((c) => norm(c.id) === q) ||
    careers.find((c) =>
      [c.name_en, c.name_th, ...(Array.isArray(c.alias) ? c.alias : [])]
        .map(norm)
        .some((x) => x === q)
    ) ||
    careers.find((c) => {
      const keys = [c.id, c.name_en, c.name_th, ...(c.alias || [])]
        .filter(Boolean)
        .map(norm);
      return keys.some((x) => x.includes(q) || q.includes(x));
    });

  return hit || null;
}

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  if (!state) {
    return (
      <div className="min-h-screen grid place-items-center text-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">ไม่มีข้อมูลผลลัพธ์</h2>
          <p className="opacity-80">กรุณาทำแบบทดสอบและส่งคำตอบอีกครั้ง</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const { traits = [], user_vector = [], top = [] } = state;

  const items = useMemo(() => {
    return (top || [])
      .map((t) => {
        const det = findCareerDetail(t.role);
        if (det) {
          return {
            ...det,
            score: t.score || 0,
            role: t.role,
            vector: t.vector || [],
          };
        }
        return {
          id: t.role,
          name_en: t.role,
          name_th: t.role,
          overview: " ",
          tags: [],
          score: t.score || 0,
          role: t.role,
          vector: t.vector || [],
        };
      })
      .filter(Boolean);
  }, [top]);

  const top3 = useMemo(
    () => topNTraits(traits, user_vector, 3),
    [traits, user_vector]
  );

  const [compareList, setCompareList] = useState(() =>
    (top || []).slice(0, 3).map((t) => ({
      label: t.role,
      vector: t.vector || [],
      visible: true,
    }))
  );

  useEffect(() => {
    setCompareList(
      (top || []).slice(0, 3).map((t) => ({
        label: t.role,
        vector: t.vector || [],
        visible: true,
      }))
    );
  }, [top]);

  const addOrToggleCompare = (label, vector) => {
    setCompareList((list) => {
      const idx = list.findIndex((i) => i.label === label);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
        return updated;
      }
      return [...list, { label, vector: vector || [], visible: true }];
    });
  };

  const openDetail = (careerObj) => {
    setSelected(careerObj);
    setShowModal(true);
    requestAnimationFrame(() => setModalVisible(true));
  };
  const closeDetail = () => setModalVisible(false);

  return (
    <>
    <nav className="fixed top-0 inset-x-0 z-50 h-16">
        <div className="h-full px-6 md:px-12 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-orange-500">AspICT</a>
        </div>
    </nav>
    <div className="w-screen h-screen pt-16">
      <div className="w-full max-w-[80%] h-[80vh]
                flex flex-col rounded-xl mx-auto text-[#141414] overflow-hidden">
                  
        <div className="grid h-full md:grid-cols-2 gap-4 m-5 place-items-center">
          <div className="w-full h-full rounded-lg flex flex-col">
            <TraitRadar
              traits={traits}
              vector={user_vector}
              title="ความถนัด"
              compareList={compareList}
            />
          </div>

          <div className="w-full h-full flex flex-col pt-6 px-6 pb-6 overflow-y-auto border-l">
            <div className="grid gap-4 overflow-y-auto ml-5 mr-5 p-2">
              <h4 className="text-xl font-semibold">อาชีพที่เหมาะสม</h4>

              {items.slice(0, 3).map((c) => (
                <article
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(c);
                    }
                  }}
                  className="group relative rounded-lg p-5 shadow cursor-pointer
                   hover:bg-white/10 border border-transparent hover:border-orange-500
                   shadow-[0_0_5px_rgba(0,0,0,0.4)] hover:shadow-orange-500/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <h3 className="text-lg font-semibold">
                      {c.name_th}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm opacity-80 line-clamp-3">
                    {c.overview}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addOrToggleCompare(c.role, c.vector);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-400/40 hover:bg-orange-500/30"
                      title="แสดง/ซ่อนอาชีพนี้บนกราฟ"
                    >
                      แสดง/ซ่อนบนกราฟ
                    </button>
                  </div>

                  <span className="pointer-events-none absolute bottom-4 right-5 text-sm opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform">
                    ดูรายละเอียด →
                  </span>
                </article>
              ))}
              <div>
                <h4 className="text-xl font-semibold mt-2 mb-2">
                  ความถนัดที่โดดเด่น
                </h4>
                <ol className="space-y-2">
                  {top3.map((t, i) => (
                    <li key={t.key} className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 border border-white/20">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{t.th}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[80%] mx-auto mt-4 flex items-center justify-between gap-5">
        <button
          className="px-4 py-2 text-xl rounded-lg hover:text-orange-500"
          onClick={() => navigate(-1)}
        >
          ย้อนกลับ
        </button>
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
    </>
  );
}
