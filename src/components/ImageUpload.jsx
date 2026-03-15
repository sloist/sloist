// ── 이미지 업로드 (단일 / 다중) ──
import { useState, useRef } from "react";
import S from "../styles/tokens";
import { supabase } from "../lib/supabase";

// 단일 이미지: value=string, onChange(string)
// 다중 이미지: multiple=true, value=string[], onChange(string[]), max=3
export default function ImageUpload({ value, onChange, folder = "general", shape = "rect", multiple = false, max = 3 }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function uploadFile(file) {
    const ext = file.name.split(".").pop();
    const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(name, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      console.error("Upload error:", error);
      alert("업로드 실패: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("images").getPublicUrl(name);
    return data.publicUrl;
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      if (multiple) {
        const arr = Array.isArray(value) ? value : value ? [value] : [];
        onChange([...arr, url]);
      } else {
        onChange(url);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const isCircle = shape === "circle";

  // ── 다중 이미지 모드 ──
  if (multiple) {
    const photos = Array.isArray(value) ? value : value ? [value] : [];
    const canAdd = photos.length < max;
    return (
      <div>
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            {photos.map((url, i) => (
              <div key={i} style={{ position: "relative", width: 120 }}>
                <div style={{ width: 120, aspectRatio: "4/3", borderRadius: 2, overflow: "hidden" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ marginTop: 4, display: "flex", gap: 8, justifyContent: "center" }}>
                  {i > 0 && <button onClick={() => { const a = [...photos]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; onChange(a); }} style={{ fontFamily: S.ui, fontSize: 9, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>←</button>}
                  <button onClick={() => onChange(photos.filter((_, j) => j !== i))} style={{ fontFamily: S.ui, fontSize: 9, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>삭제</button>
                  {i < photos.length - 1 && <button onClick={() => { const a = [...photos]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; onChange(a); }} style={{ fontFamily: S.ui, fontSize: 9, color: S.txGh, background: "none", border: "none", cursor: "pointer" }}>→</button>}
                </div>
              </div>
            ))}
          </div>
        )}
        {canAdd && (
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            style={{
              width: photos.length > 0 ? 120 : "100%",
              aspectRatio: photos.length > 0 ? "4/3" : "16/10",
              borderRadius: 2,
              border: "1px dashed " + S.ln,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: uploading ? "default" : "pointer", transition: "border-color .3s",
            }}
          >
            <span style={{ fontSize: 11, color: S.txGh, letterSpacing: 2 }}>
              {uploading ? "업로드 중..." : `사진 추가 (${photos.length}/${max})`}
            </span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </div>
    );
  }

  // ── 단일 이미지 모드 (기존) ──
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
