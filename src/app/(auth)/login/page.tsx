import { GlassCard } from "@/components/ui/GlassCard";
import LoginForm from "@/features/auth/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <GlassCard className="w-full backdrop-blur-3xl">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-slate-400">Login to your Rupya terminal</p>
            </div>
            <LoginForm />
        </GlassCard>
    );
}
