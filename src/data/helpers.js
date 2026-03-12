// ── 콘텐츠 생성 헬퍼 ──
// 모든 콘텐츠 데이터에서 공통으로 사용합니다.
// id: 고유 아이디, root: 카테고리(space/scene/objet), o: 나머지 정보

export const mk = (id, root, o) => ({ id, root, saved: false, ...o });
