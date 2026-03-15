// ── 스크롤 등장 연출 ──
// 뷰포트에 들어오면 opacity 0→1, translateY → 0
// 한 번만 발동. delay로 시차 가능.
import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({ children, delay = 0, distance = 12, duration = 0.5, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity ${duration}s ease, transform ${duration}s ease`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
