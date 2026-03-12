# SLOIST 세팅 가이드

## 1단계: 로컬에서 실행

```bash
# 프로젝트 폴더에서
npm install
```

`.env` 파일을 열고 Supabase anon key를 넣어주세요:
```
VITE_SUPABASE_URL=https://qxxnvdywsuvjbfsfttxi.supabase.co
VITE_SUPABASE_ANON_KEY=여기에_실제_키_붙여넣기
```

```bash
npm run dev
```
→ http://localhost:5173 에서 확인

## 2단계: Supabase 테이블 만들기

1. Supabase 대시보드 → SQL Editor
2. `supabase-setup.sql` 내용 복사 → 실행
3. `supabase-seed.sql` 내용 복사 → 실행
4. Table Editor에서 데이터 확인

## 3단계: Vercel 배포

1. GitHub에 이 프로젝트를 push
2. vercel.com → New Project → GitHub 레포 연결
3. Environment Variables에 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## 콘텐츠 추가하기

Supabase 대시보드 → Table Editor → contents 테이블에서 직접 추가/수정
