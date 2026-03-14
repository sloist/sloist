import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

const WEAK_PW = ["12345678","123456789","1234567890","password","password1","qwer1234","qwerty1","abcd1234","abc12345"];
export function validatePw(pw, email) {
  if (!pw || pw.length < 8) return "8자 이상 · 영문과 숫자 포함";
  if (/\s/.test(pw)) return "공백은 사용할 수 없습니다";
  if (!/[a-zA-Z]/.test(pw)) return "8자 이상 · 영문과 숫자 포함";
  if (!/[0-9]/.test(pw)) return "8자 이상 · 영문과 숫자 포함";
  if (WEAK_PW.includes(pw.toLowerCase())) return "너무 쉬운 비밀번호입니다";
  if (email && pw.toLowerCase() === email.toLowerCase()) return "이메일과 다른 비밀번호를 사용해주세요";
  return null;
}
