// ── Space 지도 컴포넌트 (Mapbox GL, 네이티브 레이어) ──
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import S from "../styles/tokens";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default function SpaceMap({ spaces, hovId, onHover, onClick, style }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const styleRef = useRef(null);
  const callbacksRef = useRef({ onHover, onClick });
  const spacesRef = useRef(spaces);

  callbacksRef.current = { onHover, onClick };
  spacesRef.current = spaces;

  // 맵 초기화 — 한 번만
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const sp = spacesRef.current;
    if (!sp || sp.length === 0) return;

    const valid = sp.filter(s => s.lat && s.lng);
    if (valid.length === 0) return;

    const lats = valid.map(s => s.lat);
    const lngs = valid.map(s => s.lng);
    const defaultBounds = [
      [Math.min(...lngs) - 0.3, Math.min(...lats) - 0.3],
      [Math.max(...lngs) + 0.3, Math.max(...lats) + 0.3],
    ];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      bounds: defaultBounds,
      fitBoundsOptions: { padding: 50 },
      scrollZoom: true,
      dragPan: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
      attributionControl: false,
      logoPosition: "bottom-right",
      locale: { "NavigationControl.ZoomIn": "확대", "NavigationControl.ZoomOut": "축소" },
    });

    map.on("load", () => {
      const canvas = containerRef.current?.querySelector(".mapboxgl-canvas");
      if (canvas) canvas.style.filter = "saturate(0.3) sepia(0.12) brightness(1.03)";

      // 한글 레이블로 전환
      const layers = map.getStyle().layers || [];
      for (const layer of layers) {
        if (layer.layout && layer.layout["text-field"]) {
          map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name_ko"], ["get", "name"]]);
        }
      }

      // GeoJSON 소스
      map.addSource("spaces", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: valid.map(s => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [s.lng, s.lat] },
            properties: { id: s.id, title: s.title, location: s.location || "", photo: s.photo || "" },
          })),
        },
      });

      // 핀 — 네이티브 circle 레이어 (GPU 렌더링)
      map.addLayer({
        id: "spaces-pins",
        type: "circle",
        source: "spaces",
        paint: {
          "circle-radius": 6,
          "circle-color": "rgba(184,164,140,0.6)",
          "circle-stroke-width": 1.8,
          "circle-stroke-color": "rgba(249,248,247,0.8)",
          "circle-radius-transition": { duration: 400, delay: 0 },
          "circle-color-transition": { duration: 400, delay: 0 },
          "circle-stroke-width-transition": { duration: 400, delay: 0 },
        },
      });

      // 호버 핀 — 별도 레이어
      map.addLayer({
        id: "spaces-pins-hover",
        type: "circle",
        source: "spaces",
        paint: {
          "circle-radius": 8,
          "circle-color": "#B8A48C",
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(249,248,247,1)",
          "circle-opacity": 0.9,
          "circle-radius-transition": { duration: 500, delay: 0 },
          "circle-opacity-transition": { duration: 500, delay: 0 },
        },
        filter: ["==", ["get", "id"], ""],
      });

      // 커서
      map.on("mouseenter", "spaces-pins", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "spaces-pins", () => {
        map.getCanvas().style.cursor = "";
        callbacksRef.current.onHover?.(null);
        if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      });

      // 호버
      map.on("mousemove", "spaces-pins", (e) => {
        if (!e.features || e.features.length === 0) return;
        const f = e.features[0];
        const id = f.properties.id;
        callbacksRef.current.onHover?.(id);

        if (popupRef.current) popupRef.current.remove();
        const photoHtml = f.properties.photo
          ? `<img src="${escHtml(f.properties.photo)}" style="width:120px;height:80px;object-fit:cover;border-radius:2px;display:block;margin-bottom:6px;filter:saturate(.88) contrast(1.04) sepia(.06) brightness(1.01)"/>`
          : "";
        popupRef.current = new mapboxgl.Popup({
          closeButton: false, closeOnClick: false, offset: 14, className: "sloist-popup",
        })
          .setLngLat(f.geometry.coordinates)
          .setHTML(
            photoHtml +
            `<div style="font-family:${S.sf};font-size:12px;font-weight:300;letter-spacing:1px;color:${S.tx};max-width:120px;line-height:1.4">${escHtml(f.properties.title)}</div>`
          )
          .addTo(map);
      });

      // 클릭/터치 — 모바일: 첫 탭=미리보기, 두 번째 탭=상세 진입
      let lastTappedId = null;
      map.on("click", "spaces-pins", (e) => {
        if (!e.features || e.features.length === 0) return;
        const f = e.features[0];
        const id = f.properties.id;
        const isMobile = "ontouchstart" in window;
        if (isMobile && lastTappedId !== id) {
          // 첫 터치: 미리보기 팝업 표시
          lastTappedId = id;
          callbacksRef.current.onHover?.(id);
          if (popupRef.current) popupRef.current.remove();
          const photoHtml = f.properties.photo
            ? `<img src="${escHtml(f.properties.photo)}" style="width:120px;height:80px;object-fit:cover;border-radius:2px;display:block;margin-bottom:6px;filter:saturate(.88) contrast(1.04) sepia(.06) brightness(1.01)"/>`
            : "";
          popupRef.current = new mapboxgl.Popup({
            closeButton: false, closeOnClick: false, offset: 14, className: "sloist-popup",
          })
            .setLngLat(f.geometry.coordinates)
            .setHTML(
              photoHtml +
              `<div style="font-family:${S.sf};font-size:12px;font-weight:300;letter-spacing:1px;color:${S.tx};max-width:120px;line-height:1.4">${escHtml(f.properties.title)}</div>`
            )
            .addTo(map);
          return;
        }
        // 두 번째 탭 또는 데스크톱 클릭 → 상세 진입
        lastTappedId = null;
        const sp = spacesRef.current;
        const s = sp?.find(x => x.id === id);
        if (s) callbacksRef.current.onClick?.(s);
      });
      // 지도 빈 영역 클릭 시 미리보기 리셋
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["spaces-pins"] });
        if (!features.length) {
          lastTappedId = null;
          if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
          callbacksRef.current.onHover?.(null);
        }
      });

    });

    // 스타일 주입
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      .sloist-popup .mapboxgl-popup-content { background:rgba(249,248,247,.95); border:1px solid rgba(130,125,118,.1); border-radius:3px; padding:8px; box-shadow:0 2px 12px rgba(0,0,0,.06); max-width:140px; }
      .sloist-popup .mapboxgl-popup-tip { border-top-color:rgba(249,248,247,.95); }
      .mapboxgl-canvas { outline:none; }
      .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display:none !important; }
    `;
    document.head.appendChild(styleEl);
    styleRef.current = styleEl;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, []);

  // 호버 핀 필터 + 부드러운 패닝
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (!map.getLayer("spaces-pins-hover")) return;
    map.setFilter("spaces-pins-hover", hovId ? ["==", ["get", "id"], hovId] : ["==", ["get", "id"], ""]);
    if (hovId) {
      const sp = spacesRef.current;
      const s = sp?.find(x => x.id === hovId);
      if (s?.lat && s?.lng) {
        const bounds = map.getBounds();
        const pad = 0.15;
        const inView = s.lng > bounds.getWest() + pad && s.lng < bounds.getEast() - pad
                     && s.lat > bounds.getSouth() + pad && s.lat < bounds.getNorth() - pad;
        if (!inView) {
          map.easeTo({ center: [s.lng, s.lat], duration: 1200 });
        }
      }
    }
  }, [hovId]);

  return <div ref={containerRef} style={{ ...style, background: "#f4f3f0" }} />;
}
