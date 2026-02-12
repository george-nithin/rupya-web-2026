import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
            <GlassCard className="max-w-md w-full p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Failed</h1>
                <p className="text-muted-foreground mb-8">
                    We were unable to sign you in specific to Google. This could be due to a configuration mismatch or an expired session.
                </p>

                <div className="space-y-3">
                    <Link href="/login">
                        <GlassButton className="w-full">
                            Back to Login
                        </GlassButton>
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
