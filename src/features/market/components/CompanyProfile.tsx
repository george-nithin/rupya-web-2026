import { GlassCard } from "@/components/ui/GlassCard";
import { Building2, Globe, Users } from "lucide-react";

interface CompanyProfileProps {
    symbol: string;
    description?: string;
}

export function CompanyProfile({ symbol, description }: CompanyProfileProps) {
    return (
        <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-400" />
                About Company
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
                {description || `${symbol} is a leading company in its sector, known for its strong market presence and consistent financial performance. It operates primarily in the Indian market with a focus on sustainable growth and innovation.`}
            </p>

            <div className="flex gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span>www.{symbol.toLowerCase()}.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Sector: Nifty 50</span>
                </div>
            </div>
        </GlassCard>
    );
}


