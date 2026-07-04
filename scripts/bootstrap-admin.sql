-- Run after creating a user in Supabase Auth (Authentication → Users → Add user)
-- Replace placeholders before running.

insert into public.admin_users (user_id, email, role)
values (
  '<AUTH_USER_UUID>'::uuid,
  'admin@sanveda.org',
  'super_admin'
)
on conflict (user_id) do update
set email = excluded.email,
    role = excluded.role;
