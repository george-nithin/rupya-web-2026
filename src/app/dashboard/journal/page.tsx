"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { JournalAnalytics } from "@/features/journal/components/JournalAnalytics";
import { Plus, FileDown } from "lucide-react";
import Link from "next/link";
import { ActiveTradeTracker } from "@/features/journal/components/ActiveTradeTracker";
import { JournalTimeline } from "@/features/journal/components/JournalTimeline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

export default function JournalPage() {
    const downloadPDF = async () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Trading Journal Report", 14, 22);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: trades } = await supabase
            .from('journal_trades')
            .select('*')
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false });

        if (trades) {
            const tableData = trades.map(t => [
                new Date(t.entry_date).toLocaleDateString(),
                t.symbol,
                t.trade_type || '-', // Added Type
                t.direction,
                t.strategy_name || '-',
                t.entry_price,
                t.exit_price || '-',
                t.pnl || 'OPEN',
                t.status
            ]);

            autoTable(doc, {
                head: [['Date', 'Symbol', 'Type', 'Dir', 'Strategy', 'Entry', 'Exit', 'PnL', 'Status']],
                body: tableData,
                startY: 30,
            });

            doc.save("trading_journal.pdf");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Trading Journal</h1>
                    <p className="text-muted-foreground">Track, Analyze, Improve</p>
                </div>
                <Link href="/dashboard/journal/create">
                    <GlassButton>
                        <Plus className="h-5 w-5 mr-2" />
                        New Trade
                    </GlassButton>
                </Link>
            </div>

            <ActiveTradeTracker />

            <JournalAnalytics />

            {/* Recent Trades Timeline */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Trade History</h3>
                    <GlassButton onClick={downloadPDF} size="sm" variant="secondary">
                        <FileDown className="h-5 w-5 mr-2" /> Download Report
                    </GlassButton>
                </div>
                <JournalTimeline />
            </div>
        </div>
    );
}
