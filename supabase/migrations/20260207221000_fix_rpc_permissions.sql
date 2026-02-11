-- Grant execute permissions to API roles
GRANT EXECUTE ON FUNCTION public.get_target_symbols_for_fundamentals(int) TO anon, authenticated, service_role;

-- Force schema cache reload (Supabase specific)
NOTIFY pgrst, 'reload config';
