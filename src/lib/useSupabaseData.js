// ── Supabase 데이터 로딩 훅 ──
// editors, contents 테이블에서 데이터를 불러와
// 기존 하드코딩 형식과 동일하게 변환합니다.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

export function useSupabaseData(userId) {
  const [editors, setEditors] = useState(null);    // ED 객체
  const [profiles, setProfiles] = useState(null);  // PF 객체 (작성자)
  const [contents, setContents] = useState(null);   // 전체 콘텐츠 배열
  const [savedIds, setSavedIds] = useState([]);      // 보관된 content id 배열
  const [followingIds, setFollowingIds] = useState([]); // 팔로우 editor id 배열
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data: edRows, error: edErr } = await supabase
        .from("editors")
        .select("*");
      if (edErr) throw edErr;

      const { data: ctRows, error: ctErr } = await supabase
        .from("contents")
        .select("*")
        .order("created_at", { ascending: true });
      if (ctErr) throw ctErr;

      const { data: pfRows } = await supabase
        .from("profiles")
        .select("id, name, role");
      const PF = {};
      (pfRows || []).forEach(r => { PF[r.id] = r; });

      const ED = {};
      edRows.forEach((row) => {
        ED[row.id] = {
          name: row.name,
          bio: row.bio,
          ig: row.ig,
          tags: row.tags || [],
          img: row.img,
          grad: row.grad,
          links: row.links || [],
        };
      });

      const items = ctRows.map((row) => ({
        id: row.id,
        root: row.root,
        title: row.title,
        sub: row.sub || undefined,
        note: row.note || undefined,
        photo: row.photo || undefined,
        grad: row.grad || undefined,
        tags: row.tags || undefined,
        location: row.location || undefined,
        cat: row.cat || undefined,
        type: row.type || undefined,
        otype: row.otype || undefined,
        maker: row.maker || undefined,
        photos: row.photos || [],
        aspect: row.aspect || undefined,
        link: row.link || undefined,
        lat: row.lat || undefined,
        lng: row.lng || undefined,
        editor: row.editor || undefined,
        authorId: row.author_id || undefined,
        isOfficial: row.is_official || false,
        isCover: row.is_cover || false,
        created_at: row.created_at || undefined,
      }));

      setEditors(ED);
      setProfiles(PF);
      setContents(items);
    } catch (e) {
      console.error("Supabase load error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // 로그인 사용자의 saves/follows 로딩
  useEffect(() => {
    if (!userId) { setSavedIds([]); setFollowingIds([]); return; }
    async function loadUserData() {
      const [{ data: sv }, { data: fl }] = await Promise.all([
        supabase.from("saves").select("content_id").eq("user_id", userId),
        supabase.from("follows").select("editor_id").eq("user_id", userId),
      ]);
      setSavedIds((sv || []).map(r => r.content_id));
      setFollowingIds((fl || []).map(r => r.editor_id));
    }
    loadUserData();
  }, [userId]);

  // 카테고리별 분리
  const SPACE = contents?.filter((i) => i.root === "space") || [];
  const SCENE = contents?.filter((i) => i.root === "scene") || [];
  const OBJET = contents?.filter((i) => i.root === "objet") || [];
  const FROMSLOIST = contents?.filter((i) => i.root === "from_sloist") || [];

  return { ED: editors, PF: profiles, ALL: contents, SPACE, SCENE, OBJET, FROMSLOIST, savedIds, setSavedIds, followingIds, setFollowingIds, loading, error, reload: load };
}
