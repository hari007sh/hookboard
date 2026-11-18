create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  brief jsonb not null,
  plan jsonb not null,
  created_at timestamptz not null default now()
);

create index plans_user_id_created_at_idx on public.plans (user_id, created_at desc);

alter table public.plans enable row level security;

create policy "Users read their own plans" on public.plans
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users save their own plans" on public.plans
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete their own plans" on public.plans
  for delete to authenticated using ((select auth.uid()) = user_id);
;
