import TradeEntryForm from "@/features/journal/components/TradeEntryForm";

export const dynamic = "force-dynamic";

export default function CreateTradePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Log a Trade</h1>
                <p className="text-muted-foreground">Capture details for your journal</p>
            </div>
            <TradeEntryForm />
        </div>
    );
}
