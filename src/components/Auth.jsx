// ── 로그인 / 회원가입 ──
import { useState } from "react";
import S from "../styles/tokens";

export default function Auth({ onAuth, signIn, signUp }) {
  const [mode, setMode] = useState("login"); // login | signup
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
    <div style={{
      minHeight: "100vh", background: S.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            fontFamily: S.sf, fontSize: mob ? 24 : 32, fontWeight: 300,
            letterSpacing: 12, color: S.tx, marginBottom: 12,
          }}>sloist</div>
          <div style={{ fontSize: 12, color: S.txGh, letterSpacing: 2 }}>
            {mode === "login" ? "다시 만나서 반갑습니다" : "느리게 걷는 사람들의 시선"}
          </div>
        </div>

        <div onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(e); }}
            style={inputStyle}
          />

          {msg && (
            <div style={{ fontSize: 12, color: msg.includes("완료") ? S.ac : "#c47", lineHeight: 1.6 }}>
              {msg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              fontFamily: S.sf, fontSize: 12, letterSpacing: 4,
              color: "#fff", background: S.tx, border: "none",
              padding: "14px 0", cursor: "pointer", marginTop: 12,
              opacity: loading ? 0.5 : 1, transition: "opacity .3s",
            }}
          >
            {loading ? "..." : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}
            style={{
              fontFamily: S.sf, fontSize: 11, letterSpacing: 3,
              color: S.txQ, background: "none", border: "none", cursor: "pointer",
            }}
          >
            {mode === "login" ? "계정이 없으신가요? 가입하기" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <button
            onClick={onAuth}
            style={{
              fontFamily: S.sf, fontSize: 10, letterSpacing: 4,
              color: S.txGh, background: "none", border: "none", cursor: "pointer",
            }}
          >
            둘러보기
          </button>
        </div>
      </div>
    </div>
  );
}
