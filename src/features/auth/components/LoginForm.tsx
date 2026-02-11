"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Mock login for test user
            // if (data.email === "nithinikkara@gmail.com" && data.password === "Nithin@123") {
            //     router.push("/dashboard");
            //     return;
            // }

            console.log('Attempting login with:', data.email);
            console.log('Supabase client:', supabase);
            console.log('Supabase auth:', supabase?.auth);

            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                throw error;
            }

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login logic error:", err);
            if (err.message === "Invalid login credentials" || err.message.includes("User not found")) {
                setError("Invalid email or password. If you haven't created an account, please sign up.");
            } else {
                setError(err.message || "Failed to login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    queryParams: {
                        access_type: "offline",
                        prompt: "consent",
                    },
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error("Google Login Error:", error);
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <GlassInput
                        type="email"
                        placeholder="trader@rupya.com"
                        {...register("email")}
                        error={!!errors.email}
                        className="pl-10"
                    />
                    {errors.email && (
                        <p className="mt-1 flex items-center text-xs text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <GlassInput
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        error={!!errors.password}
                        className="pl-10"
                    />
                    {errors.password && (
                        <p className="mt-1 flex items-center text-xs text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.password.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5 text-sky-500 focus:ring-sky-500/50" />
                    Remember me
                </label>
                <Link href="/forgot-password" className="text-sky-400 hover:text-sky-300 transition-colors">
                    Forgot password?
                </Link>
            </div>

            {error && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            <GlassButton
                type="submit"
                className="w-full h-12 text-base shadow-sky-500/20"
                disabled={isLoading}
            >
                {isLoading ? "Signing in..." : "Sign In"}
            </GlassButton>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f172a] px-2 text-slate-500">Or continue with</span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Continue with Google
            </button>

            <div className="text-center text-sm text-slate-400 mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                    Create account
                </Link>
            </div>
        </form>
    );
}
