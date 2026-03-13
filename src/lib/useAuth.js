// ── 인증 훅 ──
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export function useAuth() {
  const [user, setUser] = useState(null);       // supabase auth user
  const [profile, setProfile] = useState(null);  // profiles 테이블 row
  const [authLoading, setAuthLoading] = useState(true);

  // 현재 세션 확인 + 변경 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    if (!error && data) setProfile(data);
    setAuthLoading(false);
  }

  // 이메일 회원가입
  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { data, error };
  }

  // 이메일 로그인
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // 로그아웃
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  // 역할
  const role = profile?.role || "user";
  const isAdmin = role === "admin";
  const isEditor = role === "editor" || role === "admin";
  const editorId = profile?.editor_id || null;

  return {
    user, profile, authLoading,
    role, isAdmin, isEditor, editorId,
    signUp, signIn, signOut,
    reloadProfile: () => user && loadProfile(user.id),
  };
}
