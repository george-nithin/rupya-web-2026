import TradeEntryForm from "@/features/journal/components/TradeEntryForm";

export default function CreateTradePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Log a Trade</h1>
                <p className="text-slate-400">Capture details for your journal</p>
            </div>
            <TradeEntryForm />
        </div>
    );
}
