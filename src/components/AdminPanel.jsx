// ── 관리자 패널 ──
import { useState, useEffect } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";

export default function AdminPanel({ onClose }) {
  const mob = typeof window !== "undefined" && window.innerWidth < 768;
  const [users, setUsers] = useState([]);
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [tab, setTab] = useState("pending");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("editors").select("*").order("created_at"),
    ]);
    setUsers(p || []);
    setEditors(e || []);
    setLoading(false);
  }

  async function changeRole(uid, newRole) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", uid);
    if (error) flash("역할 변경 실패: " + error.message);
    else { flash("역할 변경 완료"); load(); }
  }

  async function approveEditor(editorId) {
    const { error } = await supabase.from("editors").update({ status: "approved" }).eq("id", editorId);
    if (error) flash("승인 실패: " + error.message);
    else { flash("승인 완료"); load(); }
  }

  async function rejectEditor(editorId) {
    const { error } = await supabase.from("editors").delete().eq("id", editorId);
    if (error) flash("삭제 실패: " + error.message);
    else { flash("프로필 삭제 완료"); load(); }
  }

  function flash(m) { setMsg(m); setTimeout(() => setMsg(null), 2500); }

  const pending = editors.filter(e => e.status === "pending");
  const approved = editors.filter(e => e.status === "approved");

  const tabStyle = (active) => ({
    fontFamily: S.sf, fontSize: 12, letterSpacing: 3,
    color: active ? S.tx : S.txGh, fontWeight: active ? 400 : 300,
    background: "none", border: "none",
    borderBottom: active ? "1px solid " + S.ac : "1px solid transparent",
    padding: "8px 0", cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: S.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: mob ? "16px" : "20px 36px", borderBottom: "1px solid " + S.lnL }}>
        <span style={{ fontFamily: S.sf, fontSize: mob ? 14 : 16, letterSpacing: 4, fontWeight: 300 }}>관리자</span>
        <button onClick={onClose} style={{ fontFamily: S.sf, fontSize: 10, letterSpacing: 6, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>닫기</button>
      </div>
      {msg && <div style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: 2, color: S.ac }}>{msg}</div>}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, padding: "20px 0", borderBottom: "1px solid " + S.lnL }}>
        <button onClick={() => setTab("pending")} style={tabStyle(tab === "pending")}>검토 대기{pending.length > 0 ? ` (${pending.length})` : ""}</button>
        <button onClick={() => setTab("users")} style={tabStyle(tab === "users")}>사용자</button>
        <button onClick={() => setTab("editors")} style={tabStyle(tab === "editors")}>슬로이스트</button>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: mob ? "28px 16px" : "48px 24px" }}>
        {loading ? <div style={{ textAlign: "center", padding: 60, color: S.txGh }}>...</div> : <>
          {tab === "pending" && <div>{pending.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: S.txGh, fontSize: 13 }}>검토 대기 없음</div> : pending.map(ed => <div key={ed.id} style={{ padding: "24px 0", borderBottom: "1px solid " + S.lnL }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              {ed.img && <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}><img src={ed.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 300, marginBottom: 4 }}>{ed.name}</div>
                <div style={{ fontSize: 12, color: S.txQ, marginBottom: 4 }}>{ed.bio}</div>
                {ed.tags?.length > 0 && <div style={{ fontSize: 11, color: S.txGh }}>{ed.tags.join(" · ")}</div>}
                {ed.links?.length > 0 && <div style={{ marginTop: 8 }}>{ed.links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: S.ac, marginRight: 16, textDecoration: "none" }}>{l.label}</a>)}</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => approveEditor(ed.id)} style={{ fontFamily: S.sf, fontSize: 11, letterSpacing: 3, color: "#fff", background: S.tx, border: "none", padding: "8px 20px", cursor: "pointer" }}>승인</button>
              <button onClick={() => rejectEditor(ed.id)} style={{ fontFamily: S.sf, fontSize: 11, letterSpacing: 3, color: S.txGh, background: "none", border: "1px solid " + S.ln, padding: "8px 20px", cursor: "pointer" }}>거절</button>
            </div>
          </div>)}</div>}
          {tab === "users" && <div>{users.map(u => <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "16px 0", borderBottom: "1px solid " + S.lnL }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 14, fontWeight: 300, marginBottom: 2 }}>{u.name || "이름 없음"}</div>
              <div style={{ fontSize: 11, color: S.txQ }}>{u.email}</div>
            </div>
            <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{ fontFamily: S.sf, fontSize: 11, color: S.tx, background: S.bg, border: "1px solid " + S.ln, padding: "6px 12px", cursor: "pointer" }}>
              <option value="user">user</option>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
            {(u.role === "editor" || u.role === "admin") && <select value={u.editor_id || ""} onChange={async e => { const val = e.target.value || null; const { error } = await supabase.from("profiles").update({ editor_id: val }).eq("id", u.id); if (error) flash("연결 실패: " + error.message); else { flash(val ? "슬로이스트 연결 완료" : "슬로이스트 연결 해제"); load(); } }} style={{ fontFamily: S.sf, fontSize: 11, color: S.tx, background: S.bg, border: "1px solid " + S.ln, padding: "6px 12px", cursor: "pointer" }}>
              <option value="">슬로이스트 없음</option>
              {editors.map(ed => <option key={ed.id} value={ed.id}>{ed.name} ({ed.id})</option>)}
            </select>}
          </div>)}</div>}
          {tab === "editors" && <div>{approved.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: S.txGh, fontSize: 13 }}>아직 승인된 슬로이스트 없음</div> : approved.map(ed => <div key={ed.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 0", borderBottom: "1px solid " + S.lnL }}>
            {ed.img && <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}><img src={ed.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
            <div><div style={{ fontSize: 14, fontWeight: 300 }}>{ed.name} <span style={{ fontSize: 10, color: S.txGh }}>({ed.id})</span></div><div style={{ fontSize: 12, color: S.txQ }}>{ed.bio}</div></div>
          </div>)}</div>}
        </>}
      </div>
    </div>
  );
}
