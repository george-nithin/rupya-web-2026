import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch strategies from database
        const { data, error } = await supabase
            .from('algo_strategies')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching strategies:', error);
        }

        // Return strategies or default list
        const strategies = data && data.length > 0 ? data : [
            {
                id: 'ma_crossover',
                name: 'Moving Average Crossover',
                description: 'Buy when fast MA crosses above slow MA, sell on opposite crossover',
                cagr: null,
                win_rate: null,
                max_drawdown: null,
            },
            {
                id: 'rsi_mean_reversion',
                name: 'RSI Mean Reversion',
                description: 'Buy when RSI < 30, sell when RSI > 70',
                cagr: null,
                win_rate: null,
                max_drawdown: null,
            },
            {
                id: 'breakout',
                name: 'Breakout Strategy',
                description: 'Buy on 20-day high breakout with stop-loss and profit target',
                cagr: null,
                win_rate: null,
                max_drawdown: null,
            },
            {
                id: 'buy_and_hold',
                name: 'Buy and Hold',
                description: 'Buy on first day and hold until the end',
                cagr: null,
                win_rate: null,
                max_drawdown: null,
            },
        ];

        return NextResponse.json(strategies);

    } catch (error: any) {
        console.error('Error in strategies API:', error);

        return NextResponse.json(
            { error: 'Failed to fetch strategies', details: error.message },
            { status: 500 }
        );
    }
}
