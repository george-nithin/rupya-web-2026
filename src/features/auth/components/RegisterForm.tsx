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
import { User, Mail, Lock, AlertCircle } from "lucide-react";

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                    },
                },
            });

            if (error) {
                throw error;
            }

            // Redirect to onboarding instead of dashboard
            router.push("/onboarding");
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-4">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <GlassInput
                        type="text"
                        placeholder="Full Name"
                        {...register("fullName")}
                        error={!!errors.fullName}
                        className="pl-10"
                    />
                    {errors.fullName && (
                        <p className="mt-1 flex items-center text-xs text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <GlassInput
                        type="email"
                        placeholder="Email Address"
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
                        placeholder="Password"
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

                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <GlassInput
                        type="password"
                        placeholder="Confirm Password"
                        {...register("confirmPassword")}
                        error={!!errors.confirmPassword}
                        className="pl-10"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 flex items-center text-xs text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
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
                {isLoading ? "Creating Account..." : "Create Account"}
            </GlassButton>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f172a] px-2 text-slate-500">Or sign up with</span>
                </div>
            </div>

            <button
                type="button"
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
                Sign up with Google
            </button>

            <div className="text-center text-sm text-slate-400 mt-6">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                    Log in
                </Link>
            </div>
        </form>
    );
}
