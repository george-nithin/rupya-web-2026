-- Ensure user_watchlist table exists
create table if not exists public.user_watchlist (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    symbol text not null,
    created_at timestamptz default now(),
    unique(user_id, symbol)
);

-- Enable RLS for watchlist
alter table public.user_watchlist enable row level security;

-- Policies for watchlist
create policy "Users can view their own watchlist"
    on public.user_watchlist for select
    using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist"
    on public.user_watchlist for insert
    with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist"
    on public.user_watchlist for delete
    using (auth.uid() = user_id);

-- Ensure market_equity_quotes table exists (Basic Schema)
create table if not exists public.market_equity_quotes (
    symbol text primary key,
    company_name text,
    last_price numeric,
    change numeric,
    percent_change numeric,
    pchange_1y numeric,
    total_traded_volume numeric,
    high numeric,
    low numeric,
    open numeric,
    previous_close numeric,
    updated_at timestamptz default now()
);

-- Enable RLS for market data (Public Read)
alter table public.market_equity_quotes enable row level security;

create policy "Market data is viewable by everyone"
    on public.market_equity_quotes for select
    using (true);

-- Allow service role (backend script) to update market data
-- (Supabase service role bypasses RLS, but explicit policy can be good checking)
