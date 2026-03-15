// ── Sticky Cover 연출 ──
// 커튼 하단이 그라데이션으로 자연스럽게 녹으며
// 뒤에 숨어있던 콘텐츠가 서서히 드러남.
// GPU 가속 + RAF 스로틀로 모바일 성능 최적화.
import { useEffect, useRef } from "react";

export default function StickyCover({ curtain, reveal }) {
  const wrapRef = useRef(null);
  const curtainRef = useRef(null);
  const revealRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current || !curtainRef.current || !revealRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const range = window.innerHeight;
      const p = Math.max(0, Math.min(1, scrolled / range));

      curtainRef.current.style.transform = `translate3d(0,${-p * 100}%,0)`;
      revealRef.current.style.opacity = Math.min(1, p * 1.5);
    };

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        update();
        rafId.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const h = "calc(100 * var(--dvh, 1vh))";
  const h2 = "calc(200 * var(--dvh, 1vh))";

  return (
    <div ref={wrapRef} style={{ position: "relative", height: h2 }}>
      <div style={{ position: "sticky", top: 0, height: h, overflow: "hidden" }}>
        {/* 뒤: 서서히 드러나는 콘텐츠 */}
        <div
          ref={revealRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: 0,
            willChange: "opacity",
          }}
        >
          {reveal}
        </div>
        {/* 앞: 커튼 — 위로 올라가며 하단은 그라데이션으로 녹음 */}
        <div
          ref={curtainRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            willChange: "transform",
          }}
        >
          {curtain}
        </div>
      </div>
    </div>
  );
}
