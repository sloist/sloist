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

  // 새 에디터 추가 폼
  const [newEd, setNewEd] = useState({ id: "", name: "", bio: "", ig: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("editors").select("*"),
    ]);
    setUsers(p || []);
    setEditors(e || []);
    setLoading(false);
  }

  async function changeRole(uid, newRole) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", uid);
    if (error) setMsg("역할 변경 실패: " + error.message);
    else { setMsg("역할 변경 완료"); load(); }
    setTimeout(() => setMsg(null), 2000);
  }

  async function linkEditor(uid, editorId) {
    const { error } = await supabase.from("profiles").update({ editor_id: editorId || null }).eq("id", uid);
    if (error) setMsg("연결 실패: " + error.message);
    else { setMsg("에디터 연결 완료"); load(); }
    setTimeout(() => setMsg(null), 2000);
  }

  async function addEditor() {
    if (!newEd.id.trim() || !newEd.name.trim()) { setMsg("아이디와 이름을 입력하세요"); return; }
    const { error } = await supabase.from("editors").insert({
      id: newEd.id.trim(),
      name: newEd.name.trim(),
      bio: newEd.bio.trim() || null,
      ig: newEd.ig.trim() || null,
      tags: [],
    });
    if (error) setMsg("에디터 추가 실패: " + error.message);
    else { setMsg("에디터 추가 완료"); setNewEd({ id: "", name: "", bio: "", ig: "" }); load(); }
    setTimeout(() => setMsg(null), 2000);
  }

  const inputStyle = {
    background: "transparent", border: "none", borderBottom: "1px solid " + S.ln,
    padding: "10px 0", fontFamily: S.bd, fontSize: 13, color: S.tx, outline: "none", width: "100%",
  };

  const labelStyle = { fontSize: 10, letterSpacing: 4, color: S.txGh, marginBottom: 16, display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: S.bg }}>
      {/* 헤더 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: mob ? "16px" : "20px 36px", borderBottom: "1px solid " + S.lnL,
      }}>
        <span style={{ fontFamily: S.sf, fontSize: mob ? 14 : 16, letterSpacing: 4, fontWeight: 300 }}>관리자</span>
        <button onClick={onClose} style={{
          fontFamily: S.sf, fontSize: 10, letterSpacing: 6,
          color: S.txGh, background: "none", border: "none", cursor: "pointer",
        }}>닫기</button>
      </div>

      {msg && (
        <div style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: 2, color: S.ac }}>{msg}</div>
      )}

      <div style={{ maxWidth: 700, margin: "0 auto", padding: mob ? "28px 16px" : "48px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: S.txGh }}>불러오는 중...</div>
        ) : (
          <>
            {/* 유저 목록 */}
            <div style={{ marginBottom: 56 }}>
              <span style={labelStyle}>사용자 관리</span>
              {users.map(u => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  padding: "16px 0", borderBottom: "1px solid " + S.lnL,
                }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 300, marginBottom: 2 }}>{u.name || "이름 없음"}</div>
                    <div style={{ fontSize: 11, color: S.txQ }}>{u.email}</div>
                  </div>

                  {/* 역할 선택 */}
                  <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{
                    fontFamily: S.sf, fontSize: 11, letterSpacing: 2,
                    color: S.tx, background: S.bg, border: "1px solid " + S.ln,
                    padding: "6px 12px", cursor: "pointer",
                  }}>
                    <option value="user">user</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>

                  {/* 에디터 연결 */}
                  {(u.role === "editor" || u.role === "admin") && (
                    <select value={u.editor_id || ""} onChange={e => linkEditor(u.id, e.target.value)} style={{
                      fontFamily: S.sf, fontSize: 11, letterSpacing: 2,
                      color: S.tx, background: S.bg, border: "1px solid " + S.ln,
                      padding: "6px 12px", cursor: "pointer",
                    }}>
                      <option value="">에디터 연결 없음</option>
                      {editors.map(ed => (
                        <option key={ed.id} value={ed.id}>{ed.name} ({ed.id})</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            {/* 에디터 추가 */}
            <div>
              <span style={labelStyle}>새 에디터 (슬로이스트) 추가</span>
              <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <input placeholder="아이디 (영문)" value={newEd.id}
                  onChange={e => setNewEd({ ...newEd, id: e.target.value })} style={inputStyle} />
                <input placeholder="이름 (한글)" value={newEd.name}
                  onChange={e => setNewEd({ ...newEd, name: e.target.value })} style={inputStyle} />
                <input placeholder="소개" value={newEd.bio}
                  onChange={e => setNewEd({ ...newEd, bio: e.target.value })} style={inputStyle} />
                <input placeholder="인스타 @" value={newEd.ig}
                  onChange={e => setNewEd({ ...newEd, ig: e.target.value })} style={inputStyle} />
              </div>
              <button onClick={addEditor} style={{
                fontFamily: S.sf, fontSize: 11, letterSpacing: 4,
                color: S.tx, background: "none", border: "1px solid " + S.ln,
                padding: "10px 24px", cursor: "pointer",
              }}>추가</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
