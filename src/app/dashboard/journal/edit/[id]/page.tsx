import TradeEntryForm from "@/features/journal/components/TradeEntryForm";

export async function generateStaticParams() {
    return [];
}

export default async function EditTradePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Edit Trade</h1>
                <p className="text-slate-400">Update your trade details</p>
            </div>
            <TradeEntryForm tradeId={id} />
        </div>
    );
}
