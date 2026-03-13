-- ═══════════════════════════════════════
-- SLOIST Storage 정책
-- images 버킷 생성 후 실행하세요
-- ═══════════════════════════════════════

-- 누구나 이미지 읽기 가능
create policy "공개 읽기 - images" on storage.objects for select
  using (bucket_id = 'images');

-- 에디터 이상만 업로드 가능
create policy "에디터 업로드 - images" on storage.objects for insert
  with check (
    bucket_id = 'images'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- 본인 업로드 삭제 가능 + 관리자는 전부
create policy "삭제 - images" on storage.objects for delete
  using (
    bucket_id = 'images'
    and (
      owner = auth.uid()
      or exists (
        select 1 from profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
      )
    )
  );
