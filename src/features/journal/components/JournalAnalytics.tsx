"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MonthlyStatsGrid } from "./MonthlyStatsGrid";
import { JournalCalendar } from "./JournalCalendar";

export function JournalAnalytics() {
    const [trades, setTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrades = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('journal_trades')
                .select('*')
                .eq('user_id', user.id)
                .order('entry_date', { ascending: true });

            if (data) {
                setTrades(data);
            }
            setLoading(false);
        };

        fetchTrades();
    }, []);

    if (loading) {
        return <div className="text-center text-muted-foreground py-10">Loading Journal Data...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Statistics</h3>
                <MonthlyStatsGrid trades={trades} />
            </div>

            <JournalCalendar trades={trades} />
        </div>
    );
}
