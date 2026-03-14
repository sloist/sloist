// ── 로그인 / 회원가입 ──
import { useState } from "react";
import S from "../styles/tokens";
import { supabase, validatePw } from "../lib/supabase";

export default function Auth({ onAuth, signIn, signUp }) {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const mob = typeof window !== "undefined" && window.innerWidth < 768;

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    if (mode === "signup") {
      const pwErr = validatePw(pw, email);
      if (pwErr) { setMsg(pwErr); setLoading(false); return; }
      const { error } = await signUp(email, pw, name);
      if (error) {
        const m = error.message;
        if (m.includes("already registered")) setMsg("이미 가입된 이메일입니다");
        else if (m.includes("valid email")) setMsg("올바른 이메일을 입력하세요");
        else setMsg("가입 실패: 다시 시도해주세요");
      }
      else setMsg("가입 완료. 이메일을 확인하세요.");
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setMsg("전송 실패: 이메일을 확인하세요");
      else setMsg("비밀번호 재설정 링크를 이메일로 전송했습니다.");
    } else {
      const { error } = await signIn(email, pw);
      if (error) {
        const m = error.message;
        if (m.includes("Invalid login")) setMsg("이메일 또는 비밀번호를 확인하세요");
        else if (m.includes("Email not confirmed")) setMsg("이메일 인증을 완료해주세요");
        else setMsg("로그인 실패: 다시 시도해주세요");
      }
      else if (onAuth) onAuth();
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid " + S.ln,
    padding: "14px 0",
    fontFamily: S.sn,
    fontSize: 13,
    fontWeight: 300,
    color: S.tx,
    outline: "none",
    letterSpacing: 1,
    transition: "border-color .5s",
  };

  return (
    <div style={{ minHeight: "calc(100 * var(--dvh, 1vh))", height: "calc(100 * var(--dvh, 1vh))", background: S.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px ${S.bg} inset !important;-webkit-text-fill-color:${S.tx} !important;caret-color:${S.tx};transition:background-color 5000s ease-in-out 0s;}input::placeholder{color:${S.txGh};font-weight:300;}`}</style>

      {/* 중앙 — 로고 + 문장 + 폼 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ width: "100%", maxWidth: 280, textAlign: "center" }}>

          {/* 로고 — 화면의 주인공 */}
          <div
            onClick={onAuth}
            style={{ fontFamily: S.sf, fontSize: mob ? 32 : 40, fontWeight: 300, letterSpacing: mob ? 12 : 18, color: S.tx, cursor: "pointer", transition: "opacity .5s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".6"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >sloist</div>

          {/* 고정 문장 */}
          <div style={{ fontFamily: S.sn, fontSize: 10, fontWeight: 300, letterSpacing: 3, color: S.txF, marginTop: 14 }}>
            멈춰야 보이는 것들
          </div>

          {/* 폼 */}
          <div style={{ marginTop: mob ? 48 : 64, textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "signup" &&
                <input placeholder="이름" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              }
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && mode === "reset") handleSubmit(e); }}
                style={inputStyle}
              />
              {mode !== "reset" &&
                <input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }} style={inputStyle} />
              }

              {/* 메시지 */}
              <div style={{ minHeight: 18 }}>
                {msg && <div style={{ fontFamily: S.sn, fontSize: 11, fontWeight: 300, color: msg.includes("완료") || msg.includes("전송했습니다") ? S.ac : "#c47", lineHeight: 1.7, textAlign: "center" }}>{msg}</div>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  fontFamily: S.sn, fontSize: 11, fontWeight: 300, letterSpacing: 4,
                  color: "#fff", background: "#4A4844", border: "none", borderRadius: 3,
                  padding: "13px 0", cursor: "pointer",
                  opacity: loading ? 0.5 : 1, transition: "opacity .5s",
                }}
              >
                {loading ? "..." : mode === "login" ? "로그인" : mode === "signup" ? "가입하기" : "전송"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 보조 링크 — 하단 */}
      <div style={{ flexShrink: 0, padding: mob ? "0 0 36px" : "0 0 48px", display: "flex", justifyContent: "center", gap: mob ? 20 : 28 }}>
        {mode === "login" && (
          <>
            <button
              onClick={() => { setMode("reset"); setMsg(null); }}
              style={{ fontFamily: S.sn, fontSize: 9, fontWeight: 300, letterSpacing: 2, color: S.txGh, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color .5s" }}
              onMouseEnter={e => e.currentTarget.style.color = S.txF}
              onMouseLeave={e => e.currentTarget.style.color = S.txGh}
            >비밀번호 찾기</button>
            <button
              onClick={() => { setMode("signup"); setMsg(null); }}
              style={{ fontFamily: S.sn, fontSize: 9, fontWeight: 300, letterSpacing: 2, color: S.txGh, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color .5s" }}
              onMouseEnter={e => e.currentTarget.style.color = S.txF}
              onMouseLeave={e => e.currentTarget.style.color = S.txGh}
            >가입하기</button>
          </>
        )}
        {(mode === "signup" || mode === "reset") && (
          <button
            onClick={() => { setMode("login"); setMsg(null); }}
            style={{ fontFamily: S.sn, fontSize: 9, fontWeight: 300, letterSpacing: 2, color: S.txGh, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color .5s" }}
            onMouseEnter={e => e.currentTarget.style.color = S.txF}
            onMouseLeave={e => e.currentTarget.style.color = S.txGh}
          >로그인으로 돌아가기</button>
        )}
      </div>
    </div>
  );
}
