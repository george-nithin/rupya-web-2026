import { IdeaFunnel } from "@/features/integrations/components/IdeaFunnel";

export default function FunnelPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Idea Funnel</h1>
                <p className="text-muted-foreground">Track the lifecycle of your trading ideas.</p>
            </div>
            <IdeaFunnel />
        </div>
    );
}
