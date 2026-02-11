import { GlassCard } from "@/components/ui/GlassCard";
import { Building2, Globe, Users } from "lucide-react";

interface CompanyProfileProps {
    symbol: string;
    description?: string;
}

export function CompanyProfile({ symbol, description }: CompanyProfileProps) {
    return (
        <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-sky-400" />
                About Company
            </h3>

            <p className="text-sm text-slate-400 leading-relaxed">
                {description || `${symbol} is a leading company in its sector, known for its strong market presence and consistent financial performance. It operates primarily in the Indian market with a focus on sustainable growth and innovation.`}
            </p>

            <div className="flex gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Globe className="h-3 w-3" />
                    <span>www.{symbol.toLowerCase()}.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3 w-3" />
                    <span>Sector: Nifty 50</span>
                </div>
            </div>
        </GlassCard>
    );
}


