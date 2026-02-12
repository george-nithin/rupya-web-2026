"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { LogOut } from "lucide-react";
import { DataManagement } from "@/features/settings/components/DataManagement";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);
        };
        getUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-3 space-y-1">
                    <button className="w-full text-left px-3 py-2 rounded-xl bg-sky-500/10 text-sky-400 text-sm font-medium">Profile</button>
                    <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-card/20 text-muted-foreground text-sm transition-all duration-150 active:scale-95">Preferences</button>
                    <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-card/20 text-muted-foreground text-sm transition-all duration-150 active:scale-95">Notifications</button>
                    <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-card/20 text-muted-foreground text-sm transition-all duration-150 active:scale-95">Security</button>
                </div>

                {/* Content */}
                <div className="md:col-span-9 space-y-6">
                    {/* Profile Section */}
                    <GlassCard className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-foreground">
                                {user?.email ? user.email[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground max-w-[200px] truncate">{user?.email || 'User'}</h2>
                                <p className="text-sm text-muted-foreground">{user?.id || 'ID loading...'}</p>
                            </div>
                            <GlassButton className="ml-auto" variant="secondary" size="sm">Edit</GlassButton>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Display Name</label>
                                <GlassInput defaultValue={user?.user_metadata?.full_name || "Trader"} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                                <GlassInput value={user?.email || ""} disabled />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Data Management Section */}
                    <DataManagement />

                    <GlassButton
                        onClick={handleSignOut}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 active:scale-95"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Sign Out
                    </GlassButton>
                </div>
            </div>
        </div>
    );
}
