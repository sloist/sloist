// ── Space 지도 컴포넌트 (Mapbox GL) ──
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import S from "../styles/tokens";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// 두 좌표 간 거리 (km, Haversine)
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SpaceMap({ spaces, hovId, onHover, onClick, style }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const popupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!spaces || spaces.length === 0) return;

    // 기본 범위: 모든 space
    const lats = spaces.map(s => s.lat);
    const lngs = spaces.map(s => s.lng);
    const defaultBounds = [
      [Math.min(...lngs) - 0.3, Math.min(...lats) - 0.3],
      [Math.max(...lngs) + 0.3, Math.max(...lats) + 0.3],
    ];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      bounds: defaultBounds,
      fitBoundsOptions: { padding: 50 },
      scrollZoom: false,
      dragPan: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    map.on("load", () => {
      // 따뜻한 톤 필터
      const canvas = containerRef.current?.querySelector(".mapboxgl-canvas");
      if (canvas) canvas.style.filter = "saturate(0.3) sepia(0.12) brightness(1.03)";

      // Geolocation: 사용자 위치 기반으로 반경 50km 내 콘텐츠 우선 표시
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          const nearby = spaces.filter(s => distKm(uLat, uLng, s.lat, s.lng) <= 50);
          if (nearby.length > 0) {
            const nLats = nearby.map(s => s.lat);
            const nLngs = nearby.map(s => s.lng);
            map.fitBounds(
              [[Math.min(...nLngs) - 0.05, Math.min(...nLats) - 0.05],
               [Math.max(...nLngs) + 0.05, Math.max(...nLats) + 0.05]],
              { padding: 60, duration: 1200 }
            );
          }
        }, () => { /* 권한 거부 시 기본 범위 유지 */ });
      }
    });

    // 마커 생성
    spaces.forEach(s => {
      const el = document.createElement("div");
      el.className = "sloist-pin";
      el.dataset.id = s.id;
      Object.assign(el.style, {
        width: "10px", height: "10px", borderRadius: "50%",
        background: "rgba(184,164,140,.5)",
        border: "1.5px solid rgba(249,248,247,.8)",
        cursor: "pointer", transition: "all .4s ease",
      });

      el.addEventListener("mouseenter", () => {
        onHover?.(s.id);
        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({
          closeButton: false, closeOnClick: false, offset: 14, className: "sloist-popup",
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

    // 스타일 주입 (Mapbox 로고 숨김 포함)
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .sloist-popup .mapboxgl-popup-content { background:rgba(249,248,247,.95); border:1px solid rgba(130,125,118,.1); border-radius:3px; padding:8px 12px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
      .sloist-popup .mapboxgl-popup-tip { border-top-color:rgba(249,248,247,.95); }
      .mapboxgl-canvas { outline:none; }
      .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display:none !important; }
    `;
    document.head.appendChild(styleEl);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [spaces]);

  // 호버 핀 업데이트
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
