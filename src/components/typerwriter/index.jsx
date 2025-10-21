import { useEffect, useRef, useState } from "react";

export default function Typewriter({
  text,
  speed = 45,
  startDelay = 0,
  className = "",
  cursor = true,
  onDone,
}) {
  const [out, setOut] = useState("");

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const runIdRef = useRef(0);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const myRun = ++runIdRef.current;
    setOut("");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    timeoutRef.current = setTimeout(() => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        if (runIdRef.current !== myRun) {
          clearInterval(intervalRef.current);
          return;
        }
        setOut(text.slice(0, i + 1));
        i += 1;

        if (i >= text.length) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (onDoneRef.current) onDoneRef.current();
        }
      }, speed);
    }, startDelay);

    return () => {
      runIdRef.current++;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {out}
      {cursor && <span className="inline-block w-[0.6ch] animate-pulse">|</span>}
    </span>
  );
}
