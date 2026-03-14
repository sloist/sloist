// ── 글쓰기 에디터 ──
import { useState } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";
import { SP_C, SC_C, OB_C, TAG_GROUPS } from "../data/constants";
import ImageUpload from "./ImageUpload";

export default function WriteEditor({ editorId, isAdmin, userId, isStaff, onClose, onSaved, editItem }) {
  const mob = typeof window !== "undefined" && window.innerWidth < 768;
  const isEdit = !!editItem;

  const [root, setRoot] = useState(editItem?.root || "space");
  const [title, setTitle] = useState(editItem?.title || "");
  const [note, setNote] = useState(editItem?.note || "");
  const [sub, setSub] = useState(editItem?.sub || "");
  const [photo, setPhoto] = useState(editItem?.photo || "");
  const [location, setLocation] = useState(editItem?.location || "");
  const [cat, setCat] = useState(editItem?.cat || "");
  const [type, setType] = useState(editItem?.type || "");
  const [otype, setOtype] = useState(editItem?.otype || "");
  const [maker, setMaker] = useState(editItem?.maker || "");
  const [link, setLink] = useState(editItem?.link || "");
  const [tags, setTags] = useState(editItem?.tags || "");
  const [aspect, setAspect] = useState(editItem?.aspect || "");
  const [lat, setLat] = useState(editItem?.lat || "");
  const [lng, setLng] = useState(editItem?.lng || "");
  const [geoLoading, setGeoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function geocodeAddress(addr) {
    if (!addr.trim()) return;
    setGeoLoading(true);
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addr.trim())}.json?country=kr&limit=1&access_token=${token}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [foundLng, foundLat] = data.features[0].center;
        setLat(foundLat);
        setLng(foundLng);
        setMsg("좌표 자동 입력 완료");
      } else {
        setMsg("주소를 찾을 수 없습니다");
      }
    } catch { setMsg("주소 검색 실패"); }
    setGeoLoading(false);
  }

  const subCats = root === "space" ? SP_C : root === "scene" ? SC_C : OB_C;
  const ASPECT_OPTIONS = root === "space" ? ["4/5","3/4","1/1"] : root === "scene" ? ["3/4","16/9"] : ["1/1","4/5","3/4"];

  async function handleSave() {
    if (!title.trim()) { setMsg("제목을 입력하세요"); return; }
    setSaving(true); setMsg(null);

    const prefix = root === "space" ? "s" : root === "scene" ? "m" : "o";
    const id = isEdit ? editItem.id : prefix + Date.now();

    const row = {
      id, root,
      title: title.trim(),
      note: note.trim() || null,
      sub: sub.trim() || null,
      photo: photo || null,
      tags: tags.trim() || null,
      location: location.trim() || null,
      cat: root === "space" ? cat || null : null,
      type: root === "scene" ? type || null : null,
      otype: root === "objet" ? otype || null : null,
      maker: maker.trim() || null,
      aspect: aspect || null,
      link: link.trim() || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      editor: editorId || null,
      author_id: userId || null,
      is_official: isStaff ? true : !editorId,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (isEdit) {
      const { error: e } = await supabase.from("contents").update(row).eq("id", id);
      error = e;
    } else {
      row.created_at = new Date().toISOString();
      const { error: e } = await supabase.from("contents").insert(row);
      error = e;
    }

    if (error) setMsg("저장 실패: " + error.message);
    else { setMsg(isEdit ? "수정 완료" : "발행 완료"); if (onSaved) setTimeout(() => onSaved(), 800); }
    setSaving(false);
  }

  const inputStyle = { width: "100%", background: "transparent", border: "none", borderBottom: "1px solid " + S.ln, padding: "12px 0", fontFamily: S.bd, fontSize: 14, color: S.tx, outline: "none" };
  const textareaStyle = { ...inputStyle, resize: "vertical", minHeight: 120, lineHeight: 2 };
  const labelStyle = { fontSize: 10, letterSpacing: 4, color: S.txGh, marginBottom: 6, display: "block" };
  const catBtn = (active) => ({ fontFamily: S.sf, fontSize: 12, letterSpacing: 3, color: active ? S.tx : S.txGh, fontWeight: active ? 400 : 300, background: "none", border: "none", borderBottom: active ? "1px solid " + S.ac : "1px solid transparent", padding: "8px 0", cursor: "pointer" });

  // 카테고리별 부가 필드 라벨
  const rootLabel = root === "space" ? "장소" : root === "scene" ? "장면" : "물건";
  const rootIcon = root === "space" ? "◯" : root === "scene" ? "△" : "□";


  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: mob ? "16px" : "20px 36px", borderBottom: "1px solid " + S.lnL }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: S.sf, fontSize: mob ? 14 : 16, letterSpacing: 4, fontWeight: 300 }}>{isEdit ? "수정하기" : "새 기록"}</span>
          {isEdit && <span style={{ fontFamily: S.sn, fontSize: 9, letterSpacing: 2, color: S.txF, background: "rgba(184,164,140,.08)", padding: "3px 10px", borderRadius: 10 }}>{rootLabel}</span>}
        </div>
        <button onClick={() => { const hasContent = title.trim() || note.trim() || photo; if (hasContent && !confirm("작성 중인 내용이 있습니다. 닫으시겠습니까?")) return; onClose(); }} style={{ fontFamily: S.sf, fontSize: 10, letterSpacing: 6, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>닫기</button>
      </div>

      {/* ─── 모바일: 단일 컬럼 / 데스크톱: 좌우 분할 ─── */}
      <div style={{ maxWidth: mob ? 600 : 960, margin: "0 auto", width: "100%", padding: mob ? "28px 16px" : "48px 36px", display: mob ? "block" : "flex", gap: mob ? 0 : 48 }}>

        {/* ──── 좌측: 핵심 정보 ──── */}
        <div style={{ flex: mob ? undefined : "0 0 42%", minWidth: 0 }}>

          {/* 카테고리 선택 (새 글만) */}
          {!isEdit && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 0 }}>
                {[
                  { k: "space", label: "space", desc: "장소의 기록" },
                  { k: "scene", label: "scene", desc: "장면의 기록" },
                  { k: "objet", label: "objet", desc: "물건의 기록" },
                ].map(({ k, label, desc }) => (
                  <button key={k} onClick={() => { setRoot(k); setCat(""); setType(""); setOtype(""); }}
                    style={{
                      flex: 1, padding: "16px 0 12px", cursor: "pointer",
                      background: root === k ? "rgba(184,164,140,.06)" : "none",
                      border: "none", borderBottom: root === k ? "2px solid " + S.ac : "2px solid transparent",
                      transition: "all .3s",
                    }}>
                    <div style={{ fontFamily: S.sf, fontSize: 13, letterSpacing: 3, color: root === k ? S.tx : S.txGh, fontWeight: root === k ? 400 : 300 }}>{label}</div>
                    <div style={{ fontFamily: S.sn, fontSize: 9, color: S.txF, marginTop: 4, letterSpacing: 1, opacity: root === k ? 1 : 0, transition: "opacity .3s" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 분류 */}
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>{root === "space" ? "장소 분류" : root === "scene" ? "장면 분류" : "물건 분류"}</span>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
              {subCats.map(c => {
                const val = root === "space" ? cat : root === "scene" ? type : otype;
                const setter = root === "space" ? setCat : root === "scene" ? setType : setOtype;
                return <button key={c} onClick={() => setter(val === c ? "" : c)} style={catBtn(val === c)}>{c}</button>;
              })}
            </div>
          </div>

          {/* 제목 */}
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>제목</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="기록의 제목" style={inputStyle} />
          </div>

          {/* scene: 저자/감독 */}
          {root === "scene" && (
            <div style={{ marginBottom: 28 }}>
              <span style={labelStyle}>저자 / 감독</span>
              <input value={sub} onChange={e => setSub(e.target.value)} placeholder="이름" style={inputStyle} />
            </div>
          )}

          {/* 본문 */}
          <div style={{ marginBottom: mob ? 28 : 0 }}>
            <span style={labelStyle}>본문</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="느리게 기록하세요" style={{ ...textareaStyle, minHeight: mob ? 120 : 200 }} />
          </div>
        </div>

        {/* ──── 우측 (데스크톱) / 하단 (모바일): 이미지 + 상세 설정 ──── */}
        <div style={{ flex: mob ? undefined : 1, minWidth: 0 }}>

          {/* 이미지 */}
          <div style={{ marginBottom: 32 }}>
            <span style={labelStyle}>이미지</span>
            <ImageUpload value={photo} onChange={setPhoto} folder="contents" />
          </div>

          {/* 썸네일 비율 */}
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>썸네일 비율</span>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              {ASPECT_OPTIONS.map(a => <button key={a} onClick={() => setAspect(aspect === a ? "" : a)} style={catBtn(aspect === a)}>{a}</button>)}
              <span style={{ fontFamily: S.sn, fontSize: 10, color: S.txGh, alignSelf: "center" }}>미선택 시 기본값</span>
            </div>
          </div>

          {/* space: 위치 */}
          {root === "space" && (
            <div style={{ marginBottom: 28 }}>
              <span style={labelStyle}>위치</span>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <input value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); geocodeAddress(location); } }} placeholder="주소 입력 (예: 충남 공주 한옥마을)" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => geocodeAddress(location)} disabled={geoLoading} style={{ fontFamily: S.sn, fontSize: 10, letterSpacing: 2, color: S.txQ, background: "none", border: "none", borderBottom: "1px solid " + S.ln, padding: "12px 0", cursor: "pointer", whiteSpace: "nowrap", opacity: geoLoading ? 0.5 : 1 }}>{geoLoading ? "검색 중..." : "좌표 검색"}</button>
              </div>
              {(lat && lng) && <div style={{ fontFamily: S.sn, fontSize: 10, color: S.txF, marginTop: 8, letterSpacing: 1 }}>📍 {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</div>}
            </div>
          )}

          {/* objet: 제작자 */}
          {root === "objet" && (
            <div style={{ marginBottom: 28 }}>
              <span style={labelStyle}>제작자</span>
              <input value={maker} onChange={e => setMaker(e.target.value)} placeholder="공방 이름" style={inputStyle} />
            </div>
          )}

          {/* 태그 */}
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>태그 (최대 3개)</span>
            {Object.entries(TAG_GROUPS).map(([group, items]) => (
              <div key={group} style={{ marginTop: 12 }}>
                <div style={{ fontFamily: S.sn, fontSize: 9, color: S.txGh, letterSpacing: 2, marginBottom: 6 }}>{group}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {items.map(t => {
                    const sel = tags.split(" · ").filter(Boolean);
                    const active = sel.includes(t);
                    return <button key={t} onClick={() => { if (active) setTags(sel.filter(x => x !== t).join(" · ")); else if (sel.length < 3) setTags([...sel, t].join(" · ")); }} style={{ fontFamily: S.sn, fontSize: 11, fontWeight: active ? 400 : 300, color: active ? S.tx : S.txGh, background: active ? "rgba(184,164,140,.12)" : "none", border: "1px solid " + (active ? S.ac : S.lnL), borderRadius: 20, padding: "5px 12px", cursor: sel.length >= 3 && !active ? "default" : "pointer", opacity: sel.length >= 3 && !active ? 0.4 : 1, transition: "all .3s" }}>{t}</button>;
                  })}
                </div>
              </div>
            ))}
            {tags && <div style={{ fontFamily: S.sn, fontSize: 11, color: S.txQ, marginTop: 12, letterSpacing: 1 }}>{tags}</div>}
          </div>

          {/* 링크 */}
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>링크 (선택)</span>
            <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
        </div>
      </div>

      {/* ─── 발행 버튼 (하단 고정) ─── */}
      <div style={{ maxWidth: mob ? 600 : 960, margin: "0 auto", width: "100%", padding: mob ? "0 16px 60px" : "0 36px 60px" }}>
        {msg && <div style={{ fontSize: 12, letterSpacing: 2, marginBottom: 20, textAlign: "center", color: msg.includes("완료") ? S.ac : "#c47" }}>{msg}</div>}
        <button onClick={handleSave} disabled={saving} style={{ width: "100%", fontFamily: S.sf, fontSize: 12, letterSpacing: 4, color: "#fff", background: S.tx, border: "none", padding: "14px 0", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
          {saving ? "저장 중..." : isEdit ? "수정하기" : "발행하기"}
        </button>
      </div>
    </div>
  );
}
