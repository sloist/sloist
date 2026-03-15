// ── 슬로이스트 디자인 토큰 v2 ──
// Cereal 뼈대 + & Premium 공기

const S = {
  // ── 색상 ──
  bg: "#FAFAF8",
  bgAlt: "#F5F3EF",
  tx: "#2C2B28",
  txM: "#4A4844",
  txQ: "#636160",
  txF: "#8A8880",
  txGh: "#B5B3AB",
  ac: "#6B6560",
  ln: "#E8E6E1",
  lnL: "rgba(232,230,225,.5)",

  // 카테고리 컬러 (라벨에만)
  cSpace: "#7A8B6E",
  cObjet: "#9B8574",
  cScene: "#7E8B9B",
  cFrom: "#8B7E74",

  // ── 서체 ──
  // display / 영문 포인트
  sf: "'Cormorant Garamond', Georgia, serif",
  // heading / label / UI
  ui: "'Pretendard Variable', 'Pretendard', -apple-system, sans-serif",
  // body 본문
  bd: "'Noto Serif KR', serif",

  // ── 전환 ──
  easeOut: "cubic-bezier(.2,0,.3,1)",
  easeInOut: "cubic-bezier(.4,0,.2,1)",
  dur: {
    fast: ".4s",
    mid: ".6s",
    slow: ".8s",
    hover: ".5s",
  },
};

// ── 마이페이지 톤 ──
export const TONES = {
  cream: { bg:"#FAFAF8", bgAlt:"#F5F3EF", tx:"#2C2B28", txM:"#4A4844", txQ:"#636160", txF:"#8A8880", txGh:"#B5B3AB", ln:"#E8E6E1", lnL:"rgba(232,230,225,.5)" },
  cool:  { bg:"#F4F5F7", bgAlt:"#ECEEF2", tx:"#2A2D33", txM:"#484C54", txQ:"#60646C", txF:"#888C94", txGh:"#B0B4BC", ln:"#E2E4E8", lnL:"rgba(226,228,232,.5)" },
  warm:  { bg:"#F7F5F3", bgAlt:"#F0EDE9", tx:"#2E2B28", txM:"#4C4844", txQ:"#666260", txF:"#8C8880", txGh:"#B8B4AC", ln:"#EAE6E0", lnL:"rgba(234,230,224,.5)" },
};

export default S;
