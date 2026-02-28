"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Sparkles } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setError("Supabase configuration is missing. Please check your environment variables.");
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                router.push("/dashboard");
            }
        } catch (error: any) {
            setError(error.message || "Invalid login credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex relative bg-black overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/rupya-hero.png"
                        alt="Rupya"
                        fill
                        className="object-cover opacity-90"
                        priority
                    />
                </div>

                {/* Bottom text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10">
                    <h2 className="text-5xl font-black mb-4 text-foreground leading-tight">
                        Trade Smarter,
                        <br />
                        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Not Harder
                        </span>
                    </h2>
                    <p className="text-foreground/80 text-lg">
                        Your AI-powered trading companion
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form - COMPLETELY SEPARATE */}
            <div className="flex items-center justify-center bg-slate-950 p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo - visible on mobile */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden">
                            <Image
                                src="/rupya-logo-circle.png"
                                alt="Rupya"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-3xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            Rupya
                        </span>
                    </div>

                    {/* Header */}
                    <div className="space-y-3">
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                            <span className="text-foreground">Welcome Back,</span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                                Trader
                            </span>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-orange-400" />
                            Sign in to access your trading dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-orange-400 transition-all duration-150" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="trader@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-card/50 border border-slate-800 rounded-xl text-foreground placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-orange-400 transition-all duration-150" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-card/50 border border-slate-800 rounded-xl text-foreground placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500/20"
                                />
                                <span className="text-muted-foreground group-hover:text-muted-foreground transition-all duration-150">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-orange-400 hover:text-orange-300 font-medium transition-all duration-150"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-foreground font-bold rounded-xl shadow-strong shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>Signing In...</span>
                            ) : (
                                <>
                                    <span>Start Trading</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center pt-4">
                        <p className="text-muted-foreground text-sm">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="text-orange-400 hover:text-orange-300 font-semibold transition-all duration-150"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div className="p-4 rounded-xl bg-card/30 border border-slate-800/50">
                        <p className="text-xs text-slate-600 text-center mb-2 font-medium uppercase tracking-wide">Demo Credentials</p>
                        <div className="space-y-1 text-xs font-mono text-center">
                            <div className="text-muted-foreground">
                                Email: <span className="text-orange-400">nithinikkara@gmail.com</span>
                            </div>
                            <div className="text-muted-foreground">
                                Password: <span className="text-orange-400">nithin@123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
