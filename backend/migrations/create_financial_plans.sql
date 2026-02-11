-- Create table for Financial Plans (Game Sessions)
create table if not exists public.financial_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  target_amount numeric not null,
  duration_days integer not null,
  start_date timestamptz default now(),
  current_amount numeric default 0,
  bricks_layout jsonb default '[]'::jsonb, -- Stores the visual state of bricks
  status text default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'FAILED')),
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.financial_plans enable row level security;

create policy "Users can view their own plans"
  on public.financial_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own plans"
  on public.financial_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own plans"
  on public.financial_plans for update
  using (auth.uid() = user_id);
