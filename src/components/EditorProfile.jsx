// ── 슬로이스트 프로필 만들기/수정 ──
import { useState } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";
import ImageUpload from "./ImageUpload";

export default function EditorProfile({ userId, existingEditor, onClose, onSaved }) {
  const mob = typeof window !== "undefined" && window.innerWidth < 768;
  const isEdit = !!existingEditor;

  const [name, setName] = useState(existingEditor?.name || "");
  const [bio, setBio] = useState(existingEditor?.bio || "");
  const [tag1, setTag1] = useState(existingEditor?.tags?.[0] || "");
  const [tag2, setTag2] = useState(existingEditor?.tags?.[1] || "");
  const [tag3, setTag3] = useState(existingEditor?.tags?.[2] || "");
  const [img, setImg] = useState(existingEditor?.img || "");

  const initLinks = existingEditor?.links || [];
  const [link1Label, setLink1Label] = useState(initLinks[0]?.label || "");
  const [link1Url, setLink1Url] = useState(initLinks[0]?.url || "");
  const [link2Label, setLink2Label] = useState(initLinks[1]?.label || "");
  const [link2Url, setLink2Url] = useState(initLinks[1]?.url || "");
  const [link3Label, setLink3Label] = useState(initLinks[2]?.label || "");
  const [link3Url, setLink3Url] = useState(initLinks[2]?.url || "");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSave() {
    if (!name.trim()) { setMsg("이름을 입력하세요"); return; }
    if (!bio.trim()) { setMsg("소개를 입력하세요"); return; }
    setSaving(true);
    setMsg(null);

    const tags = [tag1, tag2, tag3].filter(t => t.trim()).map(t => t.trim());
    const links = [
      { label: link1Label.trim(), url: link1Url.trim() },
      { label: link2Label.trim(), url: link2Url.trim() },
      { label: link3Label.trim(), url: link3Url.trim() },
    ].filter(l => l.label && l.url);

    const editorId = existingEditor?.id || name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_가-힣]/g, "") || "ed_" + Date.now();

    const row = {
      id: editorId,
      name: name.trim(),
      bio: bio.trim(),
      tags,
      img: img || null,
      links,
      user_id: userId,
      status: isEdit && existingEditor?.status === "approved" ? "approved" : "pending",
    };

    let error;
    if (isEdit) {
      const { error: e } = await supabase.from("editors").update(row).eq("id", existingEditor.id);
      error = e;
    } else {
      const { error: e } = await supabase.from("editors").insert(row);
      error = e;
      if (!e) {
        const { error: linkErr } = await supabase.from("profiles").update({ editor_id: editorId }).eq("id", userId);
        if (linkErr) { error = linkErr; }
      }
    }

    if (error) {
      setMsg("저장 실패: " + error.message);
    } else {
      setMsg(isEdit ? "수정 완료" : "프로필이 저장되었습니다. 검토 후 공개됩니다");
      if (onSaved) setTimeout(() => onSaved(), 1500);
    }
    setSaving(false);
  }

  const inputStyle = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid " + S.ln, padding: "12px 0",
    fontFamily: S.bd, fontSize: 14, color: S.tx, outline: "none",
  };
  const labelStyle = { fontSize: 10, letterSpacing: 4, color: S.txGh, marginBottom: 6, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: mob ? "16px" : "20px 36px", borderBottom: "1px solid " + S.lnL }}>
        <span style={{ fontFamily: S.sf, fontSize: mob ? 14 : 16, letterSpacing: 4, fontWeight: 300 }}>{isEdit ? "프로필 수정" : "프로필 만들기"}</span>
        <button onClick={onClose} style={{ fontFamily: S.sf, fontSize: 10, letterSpacing: 6, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>닫기</button>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", padding: mob ? "28px 16px" : "48px 24px" }}>
        {!isEdit && <div style={{ marginBottom: 36, padding: "20px 0", borderBottom: "1px solid " + S.lnL }}><p style={{ fontSize: 13, color: S.txQ, lineHeight: 2 }}>슬로이스트는 자기만의 속도로 살아가는 사람들의 시선을 기록합니다<br/>당신의 시선을 남겨주세요</p></div>}

        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>프로필 사진</span>
          <ImageUpload value={img} onChange={setImg} folder="profiles" shape="circle" />
        </div>
        <div style={{ marginBottom: 28 }}><span style={labelStyle}>이름</span><input value={name} onChange={e => setName(e.target.value)} placeholder="이름을 입력하세요" style={inputStyle} /></div>
        <div style={{ marginBottom: 28 }}><span style={labelStyle}>한 줄 소개</span><input value={bio} onChange={e => setBio(e.target.value)} placeholder="한 줄을 남겨보세요" style={inputStyle} /></div>
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>관심 태그 (최대 3개)</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <input value={tag1} onChange={e => setTag1(e.target.value)} placeholder="태그 1" style={inputStyle} />
            <input value={tag2} onChange={e => setTag2(e.target.value)} placeholder="태그 2" style={inputStyle} />
            <input value={tag3} onChange={e => setTag3(e.target.value)} placeholder="태그 3" style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 36 }}>
          <span style={labelStyle}>외부 링크</span>
          {[
            { label: link1Label, url: link1Url, setLabel: setLink1Label, setUrl: setLink1Url },
            { label: link2Label, url: link2Url, setLabel: setLink2Label, setUrl: setLink2Url },
            { label: link3Label, url: link3Url, setLabel: setLink3Label, setUrl: setLink3Url },
          ].map((l, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 }}>
              <input value={l.label} onChange={e => l.setLabel(e.target.value)} placeholder="이름" style={{ ...inputStyle, fontSize: 12 }} />
              <input value={l.url} onChange={e => l.setUrl(e.target.value)} placeholder="https://..." style={{ ...inputStyle, fontSize: 12 }} />
            </div>
          ))}
        </div>
        {msg && <div style={{ fontSize: 12, letterSpacing: 2, marginBottom: 20, textAlign: "center", color: msg.includes("실패") ? "#B07060" : S.ac, lineHeight: 1.8 }}>{msg}</div>}
        <button onClick={handleSave} disabled={saving} style={{ width: "100%", fontFamily: S.sf, fontSize: 12, letterSpacing: 4, color: "#fff", background: S.tx, border: "none", padding: "14px 0", cursor: "pointer", opacity: saving ? 0.5 : 1, marginBottom: 60 }}>
          {saving ? "저장 중..." : isEdit ? "수정하기" : "저장하기"}
        </button>
      </div>
    </div>
  );
}
