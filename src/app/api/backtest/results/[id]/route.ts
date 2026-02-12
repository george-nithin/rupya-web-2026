import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Create Supabase client with service role key
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch backtest result from database
        const { data, error } = await supabase
            .from('algo_backtest_results')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Backtest result not found', details: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Error fetching backtest result:', error);

        return NextResponse.json(
            { error: 'Failed to fetch backtest result', details: error.message },
            { status: 500 }
        );
    }
}
