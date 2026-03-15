// ── 공용 유틸리티 + 공용 컴포넌트 ──

import S from "../styles/tokens";

// 에디터 라벨 (ED를 외부에서 받음)
export function aLabel(it, ED) {
  if (it.isOfficial) return "by sloist";
  if (ED && it.editor && ED[it.editor]) return "sloist " + ED[it.editor].name;
  return "";
}

// 링크 라벨
export function lLabel(it) {
  if (!it.link) return null;
  const t = it.type || it.otype || "";
  return t === "음악" ? "듣기" : t === "영상" ? "보기" : t === "서적" ? "읽기" : "방문";
}

// 카테고리 컬러
export function catColor(root) {
  if (root === "space") return S.cSpace;
  if (root === "scene") return S.cScene;
  if (root === "objet") return S.cObjet;
  if (root === "from_sloist") return S.cFrom;
  return S.txF;
}

// 이미지 컴포넌트
import { useState, useRef, useEffect } from "react";

const _imgCache = new Set();
const IMG_FILTER = "saturate(.88) contrast(1.04) sepia(.06) brightness(1.01)";

export function Img({ grad, photo, aspect = "4/3", r = 2 }) {
  const cached = photo && _imgCache.has(photo);
  const [loaded, setLoaded] = useState(cached);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!photo) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      _imgCache.add(photo);
      setLoaded(true);
    }
  }, [photo]);

  return (
    <div style={{ width: "100%", aspectRatio: aspect, background: grad || S.bgAlt, borderRadius: r, position: "relative", overflow: "hidden" }}>
      {photo && <img
        ref={imgRef}
        src={photo}
        alt=""
        loading="lazy"
        onLoad={() => { _imgCache.add(photo); setLoaded(true); }}
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "cover", zIndex: 1,
          opacity: loaded ? 1 : 0,
          transition: "opacity .6s cubic-bezier(.2,0,.3,1)",
          filter: IMG_FILTER,
        }}
      />}
    </div>
  );
}

// 검색 아이콘
export const SIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.txF} strokeWidth="1.4">
    <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

// 유저 아이콘
export const UIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={S.txF} strokeWidth="1.4">
    <circle cx="12" cy="8" r="4" /><path d="M4 21 v-1 a 8 8 0 0 1 16 0 v1" />
  </svg>
);
