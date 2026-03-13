-- ═══════════════════════════════════════
-- SLOIST 에디터 프로필 시스템 업데이트
-- 에디터가 직접 프로필을 만들고, 관리자가 승인
-- ═══════════════════════════════════════

-- 1. editors 테이블에 컬럼 추가
alter table editors add column if not exists links jsonb default '[]';
alter table editors add column if not exists status text default 'pending' check (status in ('pending', 'approved'));
alter table editors add column if not exists user_id uuid references auth.users;

-- 기존 에디터들은 approved로
update editors set status = 'approved' where status is null or status = 'pending';

-- 2. RLS 업데이트 - 에디터도 자기 프로필 생성/수정 가능
drop policy if exists "관리자 쓰기 - editors" on editors;
drop policy if exists "관리자 수정 - editors" on editors;

-- 에디터가 본인 프로필 생성 가능 (editor 역할 이상)
create policy "에디터 본인 쓰기 - editors" on editors for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
    and user_id = auth.uid()
  );

-- 에디터가 본인 프로필 수정 가능, 관리자는 전부 수정
create policy "에디터 본인 수정 - editors" on editors for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 공개 읽기는 approved만
drop policy if exists "공개 읽기 - editors" on editors;
create policy "공개 읽기 - editors" on editors for select
  using (
    status = 'approved'
    or user_id = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
