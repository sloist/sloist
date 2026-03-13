// ── 슬로이스트 디자인 토큰 ──
// 색상, 폰트, 간격, 전환 등 사이트 전체 스타일을 여기서 관리합니다.

const S = {
  // ── 색상 ──
  bg: "#f9f8f7",
  tx: "#2A2926",
  txM: "#4A4844",
  txQ: "#7A7774",
  txF: "#A0A09C",
  txGh: "#C8C5C0",
  ac: "#B8A48C",
  ln: "rgba(130,125,118,.12)",
  lnL: "rgba(130,125,118,.06)",

  // ── 서체 ──
  // display / title — 에디토리얼 무드
  sf: "'Cormorant Garamond','Noto Serif KR',serif",
  // body — 본문 가독성
  bd: "'Noto Serif KR',serif",
  // caption / label / UI — 기능적 명료함
  sn: "'Noto Sans KR','Helvetica Neue',sans-serif",

  // ── 여백 스케일 (desktop / mobile = ×0.5) ──
  // xs:32  sm:64  md:120  lg:200
  // 사용: padding, margin, section gap에 이 값을 기준으로

  // ── 전환 ──
  easeOut: "cubic-bezier(.2,0,.3,1)",
  easeInOut: "cubic-bezier(.4,0,.2,1)",
  dur: {
    fast: ".28s",   // 필터, 탭 전환
    mid: ".5s",     // 뷰 전환
    slow: ".8s",    // 페이드, 등장
    hover: ".5s",   // hover 효과
  },
};

export default S;
