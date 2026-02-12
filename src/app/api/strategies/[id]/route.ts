
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { id } = await context.params;
        const { data, error } = await supabase
            .from('algo_strategies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { id } = await context.params;
        const body = await request.json();

        // Remove id from body to avoid updating primary key
        const { id: _, ...updateData } = body;

        const { data, error } = await supabase
            .from('algo_strategies')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { id } = await context.params;
        const { error } = await supabase
            .from('algo_strategies')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
