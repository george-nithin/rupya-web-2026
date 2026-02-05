import { GlassCard } from "@/components/ui/GlassCard";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
    return (
        <GlassCard className="w-full backdrop-blur-3xl">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-slate-400">Join Rupya trading platform</p>
            </div>
            <RegisterForm />
        </GlassCard>
    );
}
