-- Backfill profiles for Auth users that existed before the profile trigger was installed.
-- The earliest existing Auth user becomes the initial EJ PNG administrator.
insert into public.profiles (id, full_name, email, role, status)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(coalesce(u.email,''),'@',1), 'EJ PNG User'),
  u.email,
  case
    when u.id = (select id from auth.users order by created_at asc limit 1) then 'admin'
    else 'staff'
  end,
  'Active'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
