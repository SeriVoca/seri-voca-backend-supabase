-- ============================================================================
-- RLS 정책
--
-- 전제: 9개 테이블에 이미 RLS가 활성화되어 있다(정책 0개 = 전면 차단 상태).
-- 이 파일은 그 위에 "누가 어떤 행을 볼/쓸 수 있는지"를 정의한다.
--
-- 대상 역할은 전부 authenticated 뿐이다. FE 라우터상 비로그인으로 접근 가능한
-- 화면은 LoginPage 하나뿐이라 anon에게 열어줄 데이터가 없다.
--
-- 주의: Edge Function이 secret key(service_role)를 쓰는 동안 이 정책들은
-- 평가되지 않는다(BYPASSRLS). 적용해도 앱 동작은 변하지 않으며, 실제로
-- 발동하려면 요청을 유저 JWT 클라이언트로 보내야 한다.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 소유권 판정 헬퍼
--
-- user_word / user_meaning에는 owner_id가 없어서 wordbook까지 조인해 올라가야
-- 소유자를 알 수 있다. 이 판정을 정책 안에 EXISTS로 직접 쓰면
--
--   user_meaning 정책 → user_word 조회 → user_word 정책도 평가됨
--                                       → 그 안에서 다시 wordbook 조회
--
-- 이렇게 중첩된다. security definer 함수는 정의한 사람(postgres) 권한으로
-- 실행되어 내부 조회에 RLS가 걸리지 않으므로 이 중첩이 사라진다.
-- 나중에 wordbook 정책이 user_word를 참조하게 되더라도 무한 재귀를 피할 수 있다.
--
-- search_path를 비웠으므로 함수 본문의 모든 객체 이름은 스키마 수식이 필수다.
-- ----------------------------------------------------------------------------

create or replace function public.owns_wordbook(p_wordbook_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.wordbook w
    where w.id = p_wordbook_id
      and w.type = 'USER'
      and w.owner_id = (select auth.uid())
  );
$$;

create or replace function public.owns_user_word(p_word_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_word uw
    join public.wordbook w on w.id = uw.wordbook_id
    where uw.id = p_word_id
      and w.type = 'USER'
      and w.owner_id = (select auth.uid())
  );
$$;

-- security definer 함수는 기본적으로 PUBLIC에 실행 권한이 열리므로 회수한다.
revoke execute on function public.owns_wordbook(uuid) from public;
revoke execute on function public.owns_user_word(uuid) from public;
grant  execute on function public.owns_wordbook(uuid) to authenticated;
grant  execute on function public.owns_user_word(uuid) to authenticated;


-- ----------------------------------------------------------------------------
-- user : 본인 프로필만
-- ----------------------------------------------------------------------------

create policy user_select_own on public."user"
for select to authenticated
using ( id = (select auth.uid()) );

create policy user_update_own on public."user"
for update to authenticated
using      ( id = (select auth.uid()) )
with check ( id = (select auth.uid()) );

-- role 자기 승격 차단.
-- RLS 정책은 "어떤 행"만 제어하고 "어떤 컬럼"은 제어하지 못한다. 위 UPDATE
-- 정책만 있으면 본인 행의 role을 'ADMIN'으로 바꾸는 UPDATE도 통과한다.
-- 컬럼 단위 GRANT는 RLS가 아니라 그 앞단의 권한 검사에서 걸린다.
-- email은 auth.users의 미러이므로 함께 제외한다.
revoke update on public."user" from authenticated;
grant  update (nickname, avatar_url) on public."user" to authenticated;

-- INSERT/DELETE 정책은 만들지 않는다 → 자동 거부.
-- 프로필 생성/삭제는 트리거 또는 service_role 경로에서만 일어난다.


-- ----------------------------------------------------------------------------
-- wordbook : SYSTEM은 로그인 유저 전체 공개, USER는 소유자 전용
--
-- 한 테이블에 성격이 다른 두 종류가 섞여 있어서 type 조건이 계속 따라붙는다.
-- ----------------------------------------------------------------------------

create policy wordbook_select_system_or_own on public.wordbook
for select to authenticated
using (
  type = 'SYSTEM'
  or owner_id = (select auth.uid())
);

create policy wordbook_insert_own on public.wordbook
for insert to authenticated
with check (
  type = 'USER'
  and owner_id = (select auth.uid())
);

-- USING은 "고칠 수 있는 행", WITH CHECK은 "고친 결과로 허용되는 값"이다.
-- WITH CHECK이 없으면 내 단어장을 type='SYSTEM'으로 승격하거나
-- owner_id를 남에게 넘기는 UPDATE가 통과한다.
create policy wordbook_update_own on public.wordbook
for update to authenticated
using      ( type = 'USER' and owner_id = (select auth.uid()) )
with check ( type = 'USER' and owner_id = (select auth.uid()) );

create policy wordbook_delete_own on public.wordbook
for delete to authenticated
using ( type = 'USER' and owner_id = (select auth.uid()) );


-- ----------------------------------------------------------------------------
-- user_word / user_meaning : 부모 wordbook의 소유자 전용
--
-- 현재 API의 IDOR이 막히는 지점.
-- POST/PATCH/DELETE /wordbooks/:wordbookId/words/user 는 경로의 wordbookId를
-- 소유권 검증 없이 그대로 사용한다. 유저 JWT 클라이언트로 전환되면 이 정책이
-- DB 레벨에서 일괄 차단한다.
-- ----------------------------------------------------------------------------

create policy user_word_select_own on public.user_word
for select to authenticated
using ( public.owns_wordbook(wordbook_id) );

create policy user_word_insert_own on public.user_word
for insert to authenticated
with check ( public.owns_wordbook(wordbook_id) );

create policy user_word_update_own on public.user_word
for update to authenticated
using      ( public.owns_wordbook(wordbook_id) )
with check ( public.owns_wordbook(wordbook_id) );

create policy user_word_delete_own on public.user_word
for delete to authenticated
using ( public.owns_wordbook(wordbook_id) );


create policy user_meaning_select_own on public.user_meaning
for select to authenticated
using ( public.owns_user_word(word_id) );

create policy user_meaning_insert_own on public.user_meaning
for insert to authenticated
with check ( public.owns_user_word(word_id) );

create policy user_meaning_update_own on public.user_meaning
for update to authenticated
using      ( public.owns_user_word(word_id) )
with check ( public.owns_user_word(word_id) );

create policy user_meaning_delete_own on public.user_meaning
for delete to authenticated
using ( public.owns_user_word(word_id) );


-- ----------------------------------------------------------------------------
-- 공용 읽기 전용 테이블
--
-- SELECT 정책만 만든다. INSERT/UPDATE/DELETE는 정책이 없으므로 거부되고,
-- 결과적으로 쓰기는 service_role(시딩/관리자 배치) 전용이 된다.
-- ----------------------------------------------------------------------------

create policy system_word_select on public.system_word
for select to authenticated using ( true );

create policy system_meaning_select on public.system_meaning
for select to authenticated using ( true );

-- wordbook_word는 SYSTEM 단어장만 참조하는 중간 테이블이라 전체 공개로 둔다.
-- USER 단어장도 여기에 연결하게 되면 부모 wordbook 가시성 기준으로 좁혀야 한다.
create policy wordbook_word_select on public.wordbook_word
for select to authenticated using ( true );

create policy curriculum_select on public.curriculum
for select to authenticated using ( true );

create policy curriculum_wordbook_select on public.curriculum_wordbook
for select to authenticated using ( true );


-- ----------------------------------------------------------------------------
-- 정책이 참조하는 컬럼 인덱스
--
-- FK를 걸어도 인덱스는 자동 생성되지 않는다. 정책의 소유권 판정이 행마다
-- 평가되므로 여기가 비어 있으면 단어 수백 개짜리 단어장에서 바로 체감된다.
-- 이미 같은 컬럼에 다른 이름의 인덱스가 있다면 중복이니 하나는 정리할 것.
-- ----------------------------------------------------------------------------

create index if not exists idx_wordbook_owner_id
  on public.wordbook (owner_id);
create index if not exists idx_user_word_wordbook_id
  on public.user_word (wordbook_id);
create index if not exists idx_user_meaning_word_id
  on public.user_meaning (word_id);
create index if not exists idx_wordbook_word_wordbook_id
  on public.wordbook_word (wordbook_id);
create index if not exists idx_system_meaning_word_id
  on public.system_meaning (word_id);
create index if not exists idx_curriculum_wordbook_curriculum_id
  on public.curriculum_wordbook (curriculum_id);


-- ============================================================================
-- 되돌리기 (필요할 때 아래를 실행)
--
-- drop policy if exists user_select_own                 on public."user";
-- drop policy if exists user_update_own                 on public."user";
-- grant update on public."user" to authenticated;
--
-- drop policy if exists wordbook_select_system_or_own   on public.wordbook;
-- drop policy if exists wordbook_insert_own             on public.wordbook;
-- drop policy if exists wordbook_update_own             on public.wordbook;
-- drop policy if exists wordbook_delete_own             on public.wordbook;
--
-- drop policy if exists user_word_select_own            on public.user_word;
-- drop policy if exists user_word_insert_own            on public.user_word;
-- drop policy if exists user_word_update_own            on public.user_word;
-- drop policy if exists user_word_delete_own            on public.user_word;
--
-- drop policy if exists user_meaning_select_own         on public.user_meaning;
-- drop policy if exists user_meaning_insert_own         on public.user_meaning;
-- drop policy if exists user_meaning_update_own         on public.user_meaning;
-- drop policy if exists user_meaning_delete_own         on public.user_meaning;
--
-- drop policy if exists system_word_select              on public.system_word;
-- drop policy if exists system_meaning_select           on public.system_meaning;
-- drop policy if exists wordbook_word_select            on public.wordbook_word;
-- drop policy if exists curriculum_select               on public.curriculum;
-- drop policy if exists curriculum_wordbook_select      on public.curriculum_wordbook;
--
-- drop function if exists public.owns_wordbook(uuid);
-- drop function if exists public.owns_user_word(uuid);
-- ============================================================================
