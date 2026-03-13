// ── Space 지도 컴포넌트 (Mapbox GL) ──
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import S from "../styles/tokens";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function SpaceMap({ spaces, hovId, onHover, onClick, style }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const popupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!spaces || spaces.length === 0) return;

    // 범위 계산
    const lats = spaces.map(s => s.lat);
    const lngs = spaces.map(s => s.lng);
    const bounds = [
      [Math.min(...lngs) - 0.3, Math.min(...lats) - 0.3],
      [Math.max(...lngs) + 0.3, Math.max(...lats) + 0.3],
    ];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      bounds,
      fitBoundsOptions: { padding: 50 },
      scrollZoom: false,
      dragPan: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
      attributionControl: false,
    });

    map.on("load", () => {
      // 따뜻한 톤 필터 적용
      const canvas = containerRef.current.querySelector(".mapboxgl-canvas");
      if (canvas) canvas.style.filter = "saturate(0.3) sepia(0.12) brightness(1.03)";
    });

    // 마커 생성
    spaces.forEach(s => {
      const el = document.createElement("div");
      el.className = "sloist-pin";
      el.dataset.id = s.id;
      Object.assign(el.style, {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "rgba(184,164,140,.5)",
        border: "1.5px solid rgba(249,248,247,.8)",
        cursor: "pointer",
        transition: "all .4s ease",
      });

      el.addEventListener("mouseenter", () => {
        onHover?.(s.id);
        // 툴팁 표시
        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 14,
          className: "sloist-popup",
        })
          .setLngLat([s.lng, s.lat])
          .setHTML(
            `<div style="font-family:${S.sf};font-size:13px;font-weight:300;letter-spacing:2px;color:${S.tx};margin-bottom:2px">${s.title}</div>` +
            `<div style="font-family:${S.sf};font-size:10px;letter-spacing:1px;color:${S.txQ}">${s.location || ""}</div>`
          )
          .addTo(map);
      });

      el.addEventListener("mouseleave", () => {
        onHover?.(null);
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });

      el.addEventListener("click", () => onClick?.(s));

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([s.lng, s.lat])
        .addTo(map);

      markersRef.current[s.id] = { marker, el };
    });

    // 팝업 스타일 주입
    const popupStyle = document.createElement("style");
    popupStyle.textContent = `
      .sloist-popup .mapboxgl-popup-content { background:rgba(249,248,247,.95); border:1px solid rgba(130,125,118,.1); border-radius:3px; padding:8px 12px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
      .sloist-popup .mapboxgl-popup-tip { border-top-color:rgba(249,248,247,.95); }
      .mapboxgl-canvas { outline:none; }
    `;
    document.head.appendChild(popupStyle);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [spaces]);

  // 호버 상태 업데이트 — 핀 크기/색 변경
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, { el }]) => {
      const active = id === hovId;
      Object.assign(el.style, {
        width: active ? "18px" : "10px",
        height: active ? "18px" : "10px",
        background: active ? "#B8A48C" : "rgba(184,164,140,.5)",
        border: active ? "2.5px solid rgba(249,248,247,1)" : "1.5px solid rgba(249,248,247,.8)",
        boxShadow: active ? "0 0 0 6px rgba(184,164,140,.12)" : "none",
        zIndex: active ? "10" : "1",
      });
    });
  }, [hovId]);

  return <div ref={containerRef} style={{ ...style, background: "#f4f3f0" }} />;
}
