-- ============================================================================
-- RLS 정책 검증 스크립트
--
-- 대시보드 SQL Editor는 postgres(테이블 owner, BYPASSRLS) 권한으로 실행되어
-- RLS가 적용되지 않는다. 그냥 SELECT를 돌리면 전부 통과해버려 검증이 되지 않으므로
-- 반드시 `set local role`로 역할을 바꿔서 확인해야 한다.
--
-- 모든 블록이 트랜잭션 + rollback이라 데이터는 남지 않는다.
-- 실행 전 아래 두 UUID를 실제 값으로 바꿀 것.
--   :user_a       테스트할 유저의 auth.users.id
--   :others_book  유저 A가 소유하지 않은 wordbook.id (type='USER')
-- ============================================================================


-- ----------------------------------------------------------------------------
-- [0] 사전 점검 : RLS 활성화 및 정책 개수
-- ----------------------------------------------------------------------------

-- 9개 테이블 전부 rowsecurity = true 여야 한다
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by rowsecurity, tablename;

-- 정책 19개, roles가 전부 {authenticated} 여야 한다
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 헬퍼 함수 2개가 security definer(prosecdef = true)로 생성됐는지
select proname, prosecdef
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('owns_wordbook', 'owns_user_word');

-- 프로필 생성 트리거가 security definer인지 (아니면 가입이 깨진다)
select t.tgname, p.proname, p.prosecdef
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where not t.tgisinternal
  and t.tgrelid = 'auth.users'::regclass;


-- ----------------------------------------------------------------------------
-- [1] anon : 모든 테이블이 0건이어야 한다
-- ----------------------------------------------------------------------------
begin;
set local role anon;

select 'user'               as tbl, count(*) from public."user"
union all select 'wordbook',            count(*) from public.wordbook
union all select 'wordbook_word',       count(*) from public.wordbook_word
union all select 'system_word',         count(*) from public.system_word
union all select 'system_meaning',      count(*) from public.system_meaning
union all select 'user_word',           count(*) from public.user_word
union all select 'user_meaning',        count(*) from public.user_meaning
union all select 'curriculum',          count(*) from public.curriculum
union all select 'curriculum_wordbook', count(*) from public.curriculum_wordbook;
-- 기대: 전부 0

rollback;


-- ----------------------------------------------------------------------------
-- [2] authenticated : 본인 데이터 + 공용 데이터만 보이는지
-- ----------------------------------------------------------------------------
begin;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',  '00000000-0000-4000-8000-000000000001',  -- ← :user_a
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

-- 프로필: 본인 1건만
select count(*) as own_profile from public."user";
-- 기대: 1

-- 단어장: SYSTEM 전체 + 본인 USER
select type, count(*) from public.wordbook group by type;

-- 남의 USER 단어장은 안 보여야 한다
select count(*) as others_wordbooks
from public.wordbook
where type = 'USER' and owner_id <> (select auth.uid());
-- 기대: 0

-- 공용 데이터는 보여야 한다
select
  (select count(*) from public.curriculum)     as curriculums,
  (select count(*) from public.system_word)    as system_words;
-- 기대: 둘 다 > 0

-- 남의 단어는 안 보여야 한다
select count(*) as visible_user_words from public.user_word;
-- 기대: 본인 단어장의 단어 수와 일치

rollback;


-- ----------------------------------------------------------------------------
-- [3] IDOR 차단 : 유저 A가 유저 B의 단어장에 단어를 넣을 수 있는가
--     현재 API의 POST /wordbooks/:wordbookId/words/user 가 뚫려 있는 지점.
-- ----------------------------------------------------------------------------
begin;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',  '00000000-0000-4000-8000-000000000001',  -- ← :user_a
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

insert into public.user_word (wordbook_id, en_text)
values ('00000000-0000-4000-8000-0000000000ff', 'hijacked');  -- ← :others_book
-- 기대: ERROR  new row violates row-level security policy for table "user_word"

rollback;


-- ----------------------------------------------------------------------------
-- [4] 소유권 이전 차단 : 내 단어장을 남에게 넘기거나 SYSTEM으로 승격할 수 있는가
-- ----------------------------------------------------------------------------
begin;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',  '00000000-0000-4000-8000-000000000001',
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

-- 내 단어장을 SYSTEM으로 승격 시도
update public.wordbook
set type = 'SYSTEM'
where owner_id = (select auth.uid());
-- 기대: ERROR  new row violates row-level security policy (WITH CHECK 위반)

rollback;


-- ----------------------------------------------------------------------------
-- [5] role 자기 승격 차단
--     컬럼 단위 GRANT로 막았으므로 permission denied 가 나야 한다.
-- ----------------------------------------------------------------------------
begin;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub',  '00000000-0000-4000-8000-000000000001',
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

-- 허용되어야 하는 수정
update public."user" set nickname = '변경테스트' where id = (select auth.uid());
-- 기대: UPDATE 1

-- 차단되어야 하는 수정
update public."user" set role = 'ADMIN' where id = (select auth.uid());
-- 기대: ERROR  permission denied for table user

rollback;
