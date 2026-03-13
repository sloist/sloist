// ── 로그인 / 회원가입 ──
import { useState } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";

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
      const { error } = await signUp(email, pw, name);
      if (error) {
        const m = error.message;
        if (m.includes("already registered")) setMsg("이미 가입된 이메일입니다");
        else if (m.includes("valid email")) setMsg("올바른 이메일을 입력하세요");
        else if (m.includes("at least")) setMsg("비밀번호는 6자 이상이어야 합니다");
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
    fontFamily: S.bd,
    fontSize: 14,
    color: S.tx,
    outline: "none",
    letterSpacing: 1,
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, display: "flex", flexDirection: "column" }}>
      {/* 자동완성 파란 배경 제거 */}
      <style>{`input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px ${S.bg} inset !important;-webkit-text-fill-color:${S.tx} !important;caret-color:${S.tx};transition:background-color 5000s ease-in-out 0s;}`}</style>

      {/* 헤더 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: mob ? 44 : 56, padding: mob ? "0 16px" : "0 36px", flexShrink: 0,
      }}>
        <div
          onClick={onAuth}
          style={{ fontFamily: S.sf, fontSize: mob ? 20 : 28, fontWeight: 300, letterSpacing: mob ? 8 : 16, color: S.tx, cursor: "pointer" }}
        >sloist</div>
        <button
          onClick={onAuth}
          style={{ fontFamily: S.sf, fontSize: 10, letterSpacing: 4, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}
        >close</button>
      </div>

      {/* 폼 — 상단 40% 위치 고정 */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, paddingTop: mob ? "15vh" : "18vh" }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          {/* 타이틀 */}
          <div style={{
            fontFamily: S.sf, fontSize: mob ? 18 : 22, fontWeight: 300,
            letterSpacing: mob ? 4 : 6, color: S.tx, marginBottom: mob ? 36 : 48,
          }}>
            {mode === "login" ? "로그인" : mode === "signup" ? "가입하기" : "비밀번호 찾기"}
          </div>

          {/* 입력 필드 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {mode === "signup" && (
              <input
                placeholder="이름"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            )}
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            {mode !== "reset" && (
              <input
                type="password"
                placeholder="비밀번호"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }}
                style={inputStyle}
              />
            )}

            {msg && (
              <div style={{ fontSize: 12, color: msg.includes("완료") || msg.includes("전송했습니다") ? S.ac : "#c47", lineHeight: 1.6 }}>
                {msg}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                fontFamily: S.sf, fontSize: 12, letterSpacing: 4,
                color: "#fff", background: S.tx, border: "none",
                padding: "14px 0", cursor: "pointer", marginTop: 8,
                opacity: loading ? 0.5 : 1, transition: "opacity .3s",
              }}
            >
              {loading ? "..." : mode === "login" ? "로그인" : mode === "signup" ? "가입하기" : "전송"}
            </button>
          </div>

          {/* 보조 링크 — 하단 고정 */}
          <div style={{ position: "fixed", bottom: mob ? 32 : 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: mob ? 20 : 28 }}>
            {mode === "login" && (
              <>
                <button
                  onClick={() => { setMode("reset"); setMsg(null); }}
                  style={{ fontFamily: S.sf, fontSize: 11, letterSpacing: 2, color: S.txF, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >비밀번호 찾기</button>
                <span style={{ color: S.lnL }}>|</span>
                <button
                  onClick={() => { setMode("signup"); setMsg(null); }}
                  style={{ fontFamily: S.sf, fontSize: 11, letterSpacing: 2, color: S.txQ, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >가입하기</button>
              </>
            )}
            {(mode === "signup" || mode === "reset") && (
              <button
                onClick={() => { setMode("login"); setMsg(null); }}
                style={{ fontFamily: S.sf, fontSize: 11, letterSpacing: 2, color: S.txQ, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >로그인으로 돌아가기</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
