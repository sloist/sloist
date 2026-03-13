// ── 글쓰기 에디터 ──
import { useState } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";
import { SP_C, SC_C, OB_C } from "../data/constants";

export default function WriteEditor({ editorId, isAdmin, onClose, onSaved, editItem }) {
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
  const [lat, setLat] = useState(editItem?.lat || "");
  const [lng, setLng] = useState(editItem?.lng || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const subCats = root === "space" ? SP_C : root === "scene" ? SC_C : OB_C;

  async function handleSave() {
    if (!title.trim()) { setMsg("제목을 입력하세요"); return; }
    setSaving(true);
    setMsg(null);

    const prefix = root === "space" ? "s" : root === "scene" ? "m" : "o";
    const id = isEdit ? editItem.id : prefix + Date.now();

    const row = {
      id,
      root,
      title: title.trim(),
      note: note.trim() || null,
      sub: sub.trim() || null,
      photo: photo.trim() || null,
      tags: tags.trim() || null,
      location: location.trim() || null,
      cat: root === "space" ? cat || null : null,
      type: root === "scene" ? type || null : null,
      otype: root === "objet" ? otype || null : null,
      maker: maker.trim() || null,
      link: link.trim() || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      editor: editorId || null,
      is_official: !editorId,
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

    if (error) {
      setMsg("저장 실패: " + error.message);
    } else {
      setMsg(isEdit ? "수정 완료" : "발행 완료");
      if (onSaved) setTimeout(() => onSaved(), 800);
    }
    setSaving(false);
  }

  const inputStyle = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid " + S.ln, padding: "12px 0",
    fontFamily: S.bd, fontSize: 14, color: S.tx, outline: "none",
  };

  const textareaStyle = {
    ...inputStyle, resize: "vertical", minHeight: 120,
    lineHeight: 2, borderBottom: "1px solid " + S.ln,
  };

  const labelStyle = {
    fontSize: 10, letterSpacing: 4, color: S.txGh, marginBottom: 6, display: "block",
  };

  const catBtnStyle = (active) => ({
    fontFamily: S.sf, fontSize: 12, letterSpacing: 3,
    color: active ? S.tx : S.txGh, fontWeight: active ? 400 : 300,
    background: "none", border: "none",
    borderBottom: active ? "1px solid " + S.ac : "1px solid transparent",
    padding: "8px 0", cursor: "pointer", transition: "all .3s",
  });

  return (
    <div style={{
      minHeight: "100vh", background: S.bg,
      display: "flex", flexDirection: "column",
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: mob ? "16px" : "20px 36px",
        borderBottom: "1px solid " + S.lnL,
      }}>
        <span style={{ fontFamily: S.sf, fontSize: mob ? 14 : 16, letterSpacing: 4, fontWeight: 300 }}>
          {isEdit ? "수정하기" : "새 기록"}
        </span>
        <button onClick={onClose} style={{
          fontFamily: S.sf, fontSize: 10, letterSpacing: 6,
          color: S.txGh, background: "none", border: "none", cursor: "pointer",
        }}>닫기</button>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", width: "100%", padding: mob ? "28px 16px" : "48px 24px" }}>
        {/* 카테고리 선택 */}
        {!isEdit && (
          <div style={{ marginBottom: 36 }}>
            <span style={labelStyle}>카테고리</span>
            <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
              {["space", "scene", "objet"].map(k => (
                <button key={k} onClick={() => { setRoot(k); setCat(""); setType(""); setOtype(""); }}
                  style={catBtnStyle(root === k)}>{k}</button>
              ))}
            </div>
          </div>
        )}

        {/* 하위 분류 */}
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>
            {root === "space" ? "장소 분류" : root === "scene" ? "장면 분류" : "물건 분류"}
          </span>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            {subCats.map(c => {
              const val = root === "space" ? cat : root === "scene" ? type : otype;
              const setter = root === "space" ? setCat : root === "scene" ? setType : setOtype;
              return (
                <button key={c} onClick={() => setter(val === c ? "" : c)}
                  style={catBtnStyle(val === c)}>{c}</button>
              );
            })}
          </div>
        </div>

        {/* 제목 */}
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>제목</span>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="기록의 제목" style={inputStyle} />
        </div>

        {/* 부제 (scene) */}
        {root === "scene" && (
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>부제 (저자 / 감독)</span>
            <input value={sub} onChange={e => setSub(e.target.value)}
              placeholder="저자 또는 감독" style={inputStyle} />
          </div>
        )}

        {/* 본문 */}
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>본문</span>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="느리게 기록하세요" style={textareaStyle} />
        </div>

        {/* 이미지 URL */}
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>이미지 URL</span>
          <input value={photo} onChange={e => setPhoto(e.target.value)}
            placeholder="https://..." style={inputStyle} />
          {photo && (
            <div style={{ marginTop: 12, borderRadius: 2, overflow: "hidden" }}>
              <img src={photo} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
                onError={e => e.target.style.display = "none"} />
            </div>
          )}
        </div>

        {/* 장소 정보 (space) */}
        {root === "space" && (
          <>
            <div style={{ marginBottom: 28 }}>
              <span style={labelStyle}>위치</span>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="충남 천안" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <span style={labelStyle}>태그</span>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="카페 · 핸드드립" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div>
                <span style={labelStyle}>위도</span>
                <input value={lat} onChange={e => setLat(e.target.value)}
                  placeholder="36.815" style={inputStyle} />
              </div>
              <div>
                <span style={labelStyle}>경도</span>
                <input value={lng} onChange={e => setLng(e.target.value)}
                  placeholder="127.114" style={inputStyle} />
              </div>
            </div>
          </>
        )}

        {/* 제작자 (objet) */}
        {root === "objet" && (
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>제작자</span>
            <input value={maker} onChange={e => setMaker(e.target.value)}
              placeholder="공방 이름" style={inputStyle} />
          </div>
        )}

        {/* 링크 */}
        <div style={{ marginBottom: 36 }}>
          <span style={labelStyle}>링크 (선택)</span>
          <input value={link} onChange={e => setLink(e.target.value)}
            placeholder="https://..." style={inputStyle} />
        </div>

        {/* 메시지 */}
        {msg && (
          <div style={{
            fontSize: 12, letterSpacing: 2, marginBottom: 20, textAlign: "center",
            color: msg.includes("완료") ? S.ac : "#c47",
          }}>{msg}</div>
        )}

        {/* 저장 버튼 */}
        <button onClick={handleSave} disabled={saving}
          style={{
            width: "100%", fontFamily: S.sf, fontSize: 12, letterSpacing: 4,
            color: "#fff", background: S.tx, border: "none",
            padding: "14px 0", cursor: "pointer",
            opacity: saving ? 0.5 : 1, transition: "opacity .3s",
            marginBottom: 60,
          }}>
          {saving ? "저장 중..." : isEdit ? "수정하기" : "발행하기"}
        </button>
      </div>
    </div>
  );
}
