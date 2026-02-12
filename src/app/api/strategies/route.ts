
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch official algo strategies (public)
        const { data: algoData, error: algoError } = await supabase
            .from('algo_strategies')
            .select('*')
            .order('created_at', { ascending: false });

        if (algoError) throw algoError;

        // 2. Fetch user playbook strategies (private)
        let playbookData: any[] = [];
        if (user) {
            const { data, error } = await supabase
                .from('user_strategies')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Map playbook strategies to consistent format
                playbookData = data.map(s => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || '',
                    type: 'custom',
                    source: 'playbook',
                    win_rate: s.win_rate,
                    total_trades: s.total_trades,
                    total_pnl: s.total_pnl,
                    created_at: s.created_at
                }));
            }
        }

        // Combine both sources
        const allStrategies = [
            ...(algoData || []).map(s => ({ ...s, source: 'algo' })),
            ...playbookData
        ];

        return NextResponse.json(allStrategies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, code } = body;

        const { data, error } = await supabase
            .from('algo_strategies')
            .insert([{
                name,
                description,
                code,
                // Default values
                risk_level: 'High',
                cagr: 0
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
