// ── Sticky Cover 연출 ──
// 커튼 하단이 그라데이션으로 자연스럽게 녹으며
// 뒤에 숨어있던 콘텐츠가 서서히 드러남.
import { useEffect, useRef, useState } from "react";

export default function StickyCover({ curtain, reveal }) {
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const range = window.innerHeight;
      const p = Math.max(0, Math.min(1, scrolled / range));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const revealOpacity = Math.min(1, progress * 1.5);
  const h = "calc(100 * var(--dvh, 1vh))";
  const h2 = "calc(200 * var(--dvh, 1vh))";

  return (
    <div ref={wrapRef} style={{ position: "relative", height: h2 }}>
      <div style={{ position: "sticky", top: 0, height: h, overflow: "hidden" }}>
        {/* 뒤: 서서히 드러나는 콘텐츠 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: revealOpacity,
            transition: "none",
            willChange: "opacity",
          }}
        >
          {reveal}
        </div>
        {/* 앞: 커튼 — 위로 올라가며 하단은 그라데이션으로 녹음 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            transform: `translateY(${-progress * 100}%)`,
            transition: "none",
            willChange: "transform",
          }}
        >
          {curtain}
        </div>
      </div>
    </div>
  );
}
