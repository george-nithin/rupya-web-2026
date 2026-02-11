-- Enable RLS
ALTER TABLE journal_trades ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own trades
DROP POLICY IF EXISTS "Users can view own trades" ON journal_trades;
CREATE POLICY "Users can view own trades" ON journal_trades
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own trades
DROP POLICY IF EXISTS "Users can insert own trades" ON journal_trades;
CREATE POLICY "Users can insert own trades" ON journal_trades
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own trades
DROP POLICY IF EXISTS "Users can update own trades" ON journal_trades;
CREATE POLICY "Users can update own trades" ON journal_trades
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to delete their own trades
DROP POLICY IF EXISTS "Users can delete own trades" ON journal_trades;
CREATE POLICY "Users can delete own trades" ON journal_trades
    FOR DELETE
    USING (auth.uid() = user_id);
