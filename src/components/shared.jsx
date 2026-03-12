// ── 공용 유틸리티 + 공용 컴포넌트 ──

import S from "../styles/tokens";
import { ED } from "../data";

// 에디터 라벨
export function aLabel(it) {
  if (it.isOfficial) return "by sloist";
  if (it.editor && ED[it.editor]) return "sloist " + ED[it.editor].name;
  return "";
}

// 링크 라벨
export function lLabel(it) {
  if (!it.link) return null;
  const t = it.type || it.otype || "";
  return t === "음악" ? "listen" : t === "영상" ? "watch" : t === "서적" ? "read" : "visit";
}

// 이미지 컴포넌트
export function Img({ grad, photo, aspect = "4/3", r = 2 }) {
  return (
    <div style={{ width: "100%", aspectRatio: aspect, background: grad, borderRadius: r, position: "relative", overflow: "hidden" }}>
      {photo && <img src={photo} alt="" loading="lazy" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }} />}
    </div>
  );
}

// 검색 아이콘
export const SIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.txQ} strokeWidth="1.4">
    <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

// 유저 아이콘
export const UIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.txQ} strokeWidth="1.4">
    <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0112 0v1" />
  </svg>
);

// 저장 표시 점
export const SavedDot = ({ isSaved }) =>
  isSaved ? <div style={{ position: "absolute", bottom: 10, right: 10, width: 6, height: 6, borderRadius: "50%", background: S.txGh, zIndex: 3 }} /> : null;
