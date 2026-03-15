// ── 상수 ──
// 카테고리, 필터, 태그, 일일 문장 등

export const SP_C = ["카페", "식당", "숙소", "휴식", "영감"];
export const SC_C = ["음악", "영상", "서적", "장면", "루틴"];
export const OB_C = ["가구", "조명", "그릇", "의류", "소품"];
export const FS_C = ["매거진", "에세이", "인터뷰", "큐레이션", "가이드"];
export const CATS = ["space", "objet", "scene", "from_sloist"];
export const NAV_CATS = ["space", "objet", "scene"];

// 슬로이스트 태그 체계 — 결을 잡는 단어들
export const TAG_GROUPS = {
  계절: ["봄", "여름", "가을", "겨울"],
  감각: ["빛", "그림자", "바람", "비", "향", "소리"],
  상태: ["고요", "여백", "느림", "정갈", "낡음", "묵직"],
  장소감: ["창가", "마당", "골목", "숲", "바다", "산"],
  행위: ["산책", "정리", "기다림", "쉼", "독서", "손질"],
};
export const TAGS = Object.values(TAG_GROUPS).flat();

export const DAILY_QUOTES = [
  "느리게 걷는 사람만이 길 위의 이끼를 본다.",
  "고요함은 아무것도 하지 않는 것이 아니라, 모든 것을 느끼는 것이다.",
  "숨을 고르세요. 여기서부터는 당신의 속도입니다.",
  "멈춰야 보이는 것들이 있다.",
  "서두르지 않는 하루가, 가장 오래 남는다.",
];
