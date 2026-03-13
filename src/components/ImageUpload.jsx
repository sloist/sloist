// ── 이미지 업로드 ──
import { useState, useRef } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";

export default function ImageUpload({ value, onChange, folder = "general", shape = "rect" }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;

    const { error } = await supabase.storage.from("images").upload(name, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Upload error:", error);
      alert("업로드 실패: " + error.message);
    } else {
      const { data } = supabase.storage.from("images").getPublicUrl(name);
      onChange(data.publicUrl);
    }
    setUploading(false);
  }

  const isCircle = shape === "circle";

  return (
    <div>
      {value ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{
            width: isCircle ? 80 : "100%",
            height: isCircle ? 80 : undefined,
            maxHeight: isCircle ? undefined : 240,
            aspectRatio: isCircle ? undefined : "16/10",
            borderRadius: isCircle ? "50%" : 2,
            overflow: "hidden",
          }}>
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
            <button onClick={() => fileRef.current?.click()} style={{
              fontFamily: S.sf, fontSize: 10, letterSpacing: 3,
              color: S.txQ, background: "none", border: "none", cursor: "pointer",
            }}>변경</button>
            <button onClick={() => onChange("")} style={{
              fontFamily: S.sf, fontSize: 10, letterSpacing: 3,
              color: S.txGh, background: "none", border: "none", cursor: "pointer",
            }}>삭제</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: isCircle ? 80 : "100%",
            height: isCircle ? 80 : undefined,
            aspectRatio: isCircle ? undefined : "16/10",
            borderRadius: isCircle ? "50%" : 2,
            border: "1px dashed " + S.ln,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "border-color .3s",
          }}
        >
          <span style={{ fontSize: 11, color: S.txGh, letterSpacing: 2 }}>
            {uploading ? "업로드 중..." : "사진 선택"}
          </span>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
