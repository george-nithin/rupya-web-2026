
-- Enable RLS
alter table market_equity_quotes enable row level security;

-- Drop existing policy if any (to be safe)
drop policy if exists "Allow public read" on market_equity_quotes;
drop policy if exists "Public read access" on market_equity_quotes;

-- Create policy for public read
create policy "Allow public read" on market_equity_quotes
  for select using (true);


