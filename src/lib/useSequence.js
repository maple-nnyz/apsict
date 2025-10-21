import { useMemo } from "react";

// เรียงคีย์แบบ FC01, FC02 ... ตามตัวเลข
const sortEntries = (obj = {}) =>
  Object.entries(obj ?? {}).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

export default function useSequence(quizData) {
  return useMemo(() => {
    if (!quizData) return [];

    const FC = quizData.FC ?? {};
    const LIKERT = quizData.LIKERT ?? {};
    const SJT = quizData.SJT ?? {};

    const fc = sortEntries(FC).map(([id, item]) => ({
      type: "FC",
      id,
      q: item.Q,
      options: ["1", "2", "3", "4"].map((k) => ({ key: k, label: item[k] })),
    }));

    const lk = sortEntries(LIKERT).map(([id, item]) => ({
      type: "LIKERT",
      id,
      q: item.Q,
      options: ["1", "2", "3", "4", "5"].map((k) => ({ key: k, label: item[k] })),
    }));

    const sj = sortEntries(SJT).map(([id, item]) => ({
      type: "SJT",
      id,
      q: item.Q,
      options: ["1", "2", "3", "4"].map((k) => ({ key: k, label: item[k] })),
    }));

    return [...fc, ...lk, ...sj];
  }, [quizData]);
}
