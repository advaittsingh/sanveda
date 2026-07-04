-- Fix infinite recursion on admin_users SELECT policy (use is_admin() security definer)
drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list"
  on public.admin_users for select
  using (public.is_admin());
