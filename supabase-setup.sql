-- ═══════════════════════════════════════
-- SLOIST CMS 테이블
-- Supabase SQL Editor에서 실행하세요
-- ═══════════════════════════════════════

-- 1. 에디터 (슬로이스트)
create table editors (
  id text primary key,           -- 영문 아이디 (hayan, yunseul 등)
  name text not null,
  bio text,
  ig text,
  tags text[] default '{}',
  img text,
  grad text,
  created_at timestamptz default now()
);

-- 2. 콘텐츠 (space, scene, objet 통합)
create table contents (
  id text primary key,           -- s1, m1, o1 등
  root text not null check (root in ('space', 'scene', 'objet')),
  title text not null,
  sub text,                      -- 부제 (scene용: 저자/감독)
  note text,                     -- 본문
  photo text,
  grad text,
  tags text,                     -- "카페 · 핸드드립" 형태
  location text,                 -- space용
  cat text,                      -- space 하위분류: 카페/식당/숙소/휴식/영감
  type text,                     -- scene 하위분류: 서적/음악/영상/장면/루틴
  otype text,                    -- objet 하위분류: 가구/조명/그릇/의류/소품
  maker text,                    -- objet용: 제작자
  link text,
  lat float,                     -- space 지도용
  lng float,
  editor text references editors(id),
  is_official boolean default false,
  is_cover boolean default false,
  sort_order int default 0,      -- 정렬 순서 (원하면 사용)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. RLS 정책 (읽기는 모두 허용, 쓰기는 인증된 사용자만)
alter table editors enable row level security;
alter table contents enable row level security;

-- 누구나 읽기 가능
create policy "공개 읽기 - editors" on editors for select using (true);
create policy "공개 읽기 - contents" on contents for select using (true);

-- 인증된 사용자만 쓰기 (나중에 관리자 페이지 만들 때)
create policy "인증 쓰기 - editors" on editors for all using (auth.role() = 'authenticated');
create policy "인증 쓰기 - contents" on contents for all using (auth.role() = 'authenticated');

-- 인덱스
create index idx_contents_root on contents(root);
create index idx_contents_editor on contents(editor);
