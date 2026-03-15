// ── 글쓰기 에디터 ──
import { useState } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";
import { SP_C, SC_C, OB_C, FS_C, TAG_GROUPS } from "../data/constants";
import ImageUpload from "./ImageUpload";

export default function WriteEditor({ editorId, isAdmin, userId, isStaff, onClose, onSaved, editItem }) {
  const mob = typeof window !== "undefined" && window.innerWidth < 768;
  const isEdit = !!editItem;

  const [root, setRoot] = useState(editItem?.root || "space");
  const [title, setTitle] = useState(editItem?.title || "");
  const [note, setNote] = useState(editItem?.note || "");
  const [sub, setSub] = useState(editItem?.sub || "");
  // photos: 배열로 관리, 기존 단일 photo와 호환
  const initPhotos = editItem?.photos?.length ? editItem.photos : editItem?.photo ? [editItem.photo] : [];
  const [photos, setPhotos] = useState(initPhotos);
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

  const subCats = root === "space" ? SP_C : root === "scene" ? SC_C : root === "from_sloist" ? FS_C : OB_C;
  const ASPECT_OPTIONS = root === "space" ? ["4/5","3/4","1/1"] : root === "scene" ? ["3/4","16/9"] : root === "from_sloist" ? ["3/4","16/9","1/1"] : ["1/1","4/5","3/4"];

  async function handleSave() {
    if (!title.trim()) { setMsg("제목을 입력하세요"); return; }
    setSaving(true); setMsg(null);

    const prefix = root === "space" ? "s" : root === "scene" ? "m" : root === "from_sloist" ? "f" : "o";
    const id = isEdit ? editItem.id : prefix + Date.now();

    const row = {
      id, root,
      title: title.trim(),
      note: note.trim() || null,
      sub: sub.trim() || null,
      photo: photos[0] || null,
      photos: photos.length > 0 ? photos : [],
      tags: tags.trim() || null,
      location: location.trim() || null,
      cat: root === "space" ? cat || null : null,
      type: (root === "scene" || root === "from_sloist") ? type || null : null,
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

  const g = mob ? 20 : 18;
  const inputStyle = { width: "100%", background: "transparent", border: "none", borderBottom: "1px solid " + S.ln, padding: "10px 0", fontFamily: S.bd, fontSize: 14, color: S.tx, outline: "none" };
  const textareaStyle = { ...inputStyle, resize: "none", minHeight: mob ? 280 : 420, lineHeight: 2 };
  const labelStyle = { fontSize: 10, letterSpacing: 4, color: S.txGh, marginBottom: 4, display: "block" };
  const catBtn = (active) => ({ fontFamily: S.sf, fontSize: 12, letterSpacing: 3, color: active ? S.tx : S.txGh, fontWeight: active ? 400 : 300, background: "none", border: "none", borderBottom: active ? "1px solid " + S.ac : "1px solid transparent", padding: "6px 0", cursor: "pointer" });

  const rootLabel = root === "space" ? "장소" : root === "scene" ? "장면" : root === "from_sloist" ? "from" : "물건";

  // ── 공통 필드 블록들 ──
  const CategorySelect = !isEdit && (
    <div style={{ marginBottom: g + 4 }}>
      <div style={{ display: "flex", gap: 0 }}>
        {[
          { k: "space", label: "space", desc: "장소의 기록" },
          { k: "scene", label: "scene", desc: "장면의 기록" },
          { k: "objet", label: "objet", desc: "물건의 기록" },
          { k: "from_sloist", label: "from", desc: "슬로이스트의 시선" },
        ].map(({ k, label, desc }) => (
          <button key={k} onClick={() => { setRoot(k); setCat(""); setType(""); setOtype(""); }}
            style={{
              flex: 1, padding: "12px 0 10px", cursor: "pointer",
              background: root === k ? "rgba(184,164,140,.06)" : "none",
              border: "none", borderBottom: root === k ? "2px solid " + S.ac : "2px solid transparent",
              transition: "all .3s",
            }}>
            <div style={{ fontFamily: S.sf, fontSize: 13, letterSpacing: 3, color: root === k ? S.tx : S.txGh, fontWeight: root === k ? 400 : 300 }}>{label}</div>
            <div style={{ fontFamily: S.ui, fontSize: 9, color: S.txF, marginTop: 3, letterSpacing: 1, opacity: root === k ? 1 : 0, transition: "opacity .3s" }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const SubCatFilter = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>{root === "space" ? "장소 분류" : root === "scene" ? "장면 분류" : root === "from_sloist" ? "글 유형" : "물건 분류"}</span>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 6 }}>
        {subCats.map(c => {
          const val = root === "space" ? cat : (root === "scene" || root === "from_sloist") ? type : otype;
          const setter = root === "space" ? setCat : (root === "scene" || root === "from_sloist") ? setType : setOtype;
          return <button key={c} onClick={() => setter(val === c ? "" : c)} style={catBtn(val === c)}>{c}</button>;
        })}
      </div>
    </div>
  );

  const TitleField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>제목</span>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="기록의 제목" style={inputStyle} />
    </div>
  );

  const LocationField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>위치</span>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <input value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); geocodeAddress(location); } }} placeholder="주소 입력 (예: 충남 공주 한옥마을)" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => geocodeAddress(location)} disabled={geoLoading} style={{ fontFamily: S.ui, fontSize: 10, letterSpacing: 2, color: S.txQ, background: "none", border: "none", borderBottom: "1px solid " + S.ln, padding: "10px 0", cursor: "pointer", whiteSpace: "nowrap", opacity: geoLoading ? 0.5 : 1 }}>{geoLoading ? "검색 중..." : "좌표 검색"}</button>
      </div>
      {(lat && lng) && <div style={{ fontFamily: S.ui, fontSize: 10, color: S.txF, marginTop: 6, letterSpacing: 1 }}>📍 {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</div>}
    </div>
  );

  const MakerField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>만든 이</span>
      <input value={maker} onChange={e => setMaker(e.target.value)} placeholder="공방 이름" style={inputStyle} />
    </div>
  );

  const SubField = (label) => (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>{label}</span>
      <input value={sub} onChange={e => setSub(e.target.value)} placeholder="이름" style={inputStyle} />
    </div>
  );

  const NoteField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>본문</span>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="느리게 기록하세요" style={textareaStyle} />
    </div>
  );

  const ImageField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>{root === "from_sloist" ? "이미지 (선택, 최대 3장)" : "이미지 (최대 3장)"}</span>
      <ImageUpload value={photos} onChange={setPhotos} folder="contents" multiple max={3} />
    </div>
  );

  const AspectField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>썸네일 비율</span>
      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
        {ASPECT_OPTIONS.map(a => <button key={a} onClick={() => setAspect(aspect === a ? "" : a)} style={catBtn(aspect === a)}>{a}</button>)}
        <span style={{ fontFamily: S.ui, fontSize: 10, color: S.txGh, alignSelf: "center" }}>미선택 시 기본값</span>
      </div>
    </div>
  );

  const TagField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>태그 (최대 3개)</span>
      {Object.entries(TAG_GROUPS).map(([group, items]) => (
        <div key={group} style={{ marginTop: 10 }}>
          <div style={{ fontFamily: S.ui, fontSize: 9, color: S.txGh, letterSpacing: 2, marginBottom: 5 }}>{group}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {items.map(t => {
              const sel = tags.split(" · ").filter(Boolean);
              const active = sel.includes(t);
              return <button key={t} onClick={() => { if (active) setTags(sel.filter(x => x !== t).join(" · ")); else if (sel.length < 3) setTags([...sel, t].join(" · ")); }} style={{ fontFamily: S.ui, fontSize: 11, fontWeight: active ? 400 : 300, color: active ? S.tx : S.txGh, background: active ? "rgba(184,164,140,.12)" : "none", border: "1px solid " + (active ? S.ac : S.lnL), borderRadius: 20, padding: "4px 10px", cursor: sel.length >= 3 && !active ? "default" : "pointer", opacity: sel.length >= 3 && !active ? 0.4 : 1, transition: "all .3s" }}>{t}</button>;
            })}
          </div>
        </div>
      ))}
      {tags && <div style={{ fontFamily: S.ui, fontSize: 11, color: S.txQ, marginTop: 10, letterSpacing: 1 }}>{tags}</div>}
    </div>
  );

  const LinkField = (
    <div style={{ marginBottom: g }}>
      <span style={labelStyle}>링크 (선택)</span>
      <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." style={inputStyle} />
    </div>
  );

  // ── 카테고리별 필드 순서 ──
  // space: 카테고리 → 필터 → 제목 → 위치 → 본문 → 이미지 → 비율 → 태그 → 링크
  // objet: 카테고리 → 필터 → 제목 → 만든이 → 본문 → 이미지 → 비율 → 태그 → 링크
  // scene: 카테고리 → 필터 → 제목 → 출처 → 본문 → 이미지 → 비율 → 태그 → 링크
  // from_sloist: 카테고리 → 필터 → 제목 → 글쓴이 → 본문 → 이미지 → 비율 → 태그 → 링크

  const fieldOrder = () => {
    const fields = [CategorySelect, SubCatFilter, TitleField];
    if (root === "space") fields.push(LocationField);
    else if (root === "objet") fields.push(MakerField);
    else if (root === "scene") fields.push(SubField("출처"));
    else if (root === "from_sloist") fields.push(SubField("글쓴이"));
    fields.push(NoteField, ImageField, AspectField, TagField, LinkField);
    return fields;
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: mob ? "14px 16px" : "16px 36px", borderBottom: "1px solid " + S.lnL }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: S.sf, fontSize: mob ? 14 : 15, letterSpacing: 4, fontWeight: 300 }}>{isEdit ? "수정하기" : "새 기록"}</span>
          {isEdit && <span style={{ fontFamily: S.ui, fontSize: 9, letterSpacing: 2, color: S.txF, background: "rgba(184,164,140,.08)", padding: "3px 10px", borderRadius: 10 }}>{rootLabel}</span>}
        </div>
        <button onClick={() => { const hasContent = title.trim() || note.trim() || photos.length > 0; if (hasContent && !confirm("작성 중인 내용이 있습니다. 닫으시겠습니까?")) return; onClose(); }} style={{ fontFamily: S.sf, fontSize: 10, letterSpacing: 6, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>닫기</button>
      </div>

      {/* ─── 단일 컬럼 레이아웃 ─── */}
      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: mob ? "20px 16px" : "32px 36px" }}>
        {fieldOrder().map((field, i) => <div key={i}>{field}</div>)}
      </div>

      {/* ─── 발행 버튼 ─── */}
      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: mob ? "0 16px 48px" : "0 36px 48px" }}>
        {msg && <div style={{ fontSize: 12, letterSpacing: 2, marginBottom: 16, textAlign: "center", color: msg.includes("완료") ? S.ac : "#c47" }}>{msg}</div>}
        <button onClick={handleSave} disabled={saving} style={{ width: "100%", fontFamily: S.sf, fontSize: 12, letterSpacing: 4, color: "#fff", background: S.tx, border: "none", padding: "14px 0", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
          {saving ? "저장 중..." : isEdit ? "수정하기" : "발행하기"}
        </button>
      </div>
    </div>
  );
}
