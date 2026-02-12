"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Hammer, Shield, TrendingUp, Trophy } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type BrickType = {
    id: string;
    value: number;
    color: string;
    label: string;
    width: number; // visual width constraint (1 = small, 2 = med, 3 = large)
};

type PlacedBrick = BrickType & {
    x: number; // simplified grid position logic could go here if needed, but for now we stack.
};

const BRICK_TYPES: Omit<BrickType, 'id'>[] = [
    { value: 100, color: "bg-stone-400", label: "₹100", width: 1 },
    { value: 1000, color: "bg-slate-500", label: "₹1k", width: 1 },
    { value: 10000, color: "bg-sky-600", label: "₹10k", width: 2 },
    { value: 50000, color: "bg-amber-600", label: "₹50k", width: 2 },
    { value: 100000, color: "bg-purple-600", label: "₹1L", width: 3 },
];

export default function GameArenaPage() {
    const params = useParams();
    const router = useRouter();
    const planId = params.id as string;

    // Game State
    const [plan, setPlan] = useState<any>(null);
    const [currentAmount, setCurrentAmount] = useState(0);
    const [placedBricks, setPlacedBricks] = useState<PlacedBrick[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ msg: string, type: 'good' | 'bad' } | null>(null);

    // Fetch Plan on Load
    useEffect(() => {
        const fetchPlan = async () => {
            const { data, error } = await supabase
                .from('financial_plans')
                .select('*')
                .eq('id', planId)
                .single();

            if (data) {
                setPlan(data);
                setCurrentAmount(data.current_amount || 0);
                setPlacedBricks(data.bricks_layout || []);
            } else {
                console.error("Plan not found:", error);
                // router.push('/dashboard/planning'); // Commented out for dev safety
            }
            setLoading(false);
        };
        fetchPlan();
    }, [planId]);

    // --- Game Logic ---

    const addBrick = async (brickTemplate: typeof BRICK_TYPES[0]) => {
        const newBrick: PlacedBrick = {
            ...brickTemplate,
            id: crypto.randomUUID(),
            x: 0, // Unused in simple stack, but useful for enhancements
        };

        const newAmount = currentAmount + brickTemplate.value;
        const newBricks = [...placedBricks, newBrick];

        // Optimistic Update
        setCurrentAmount(newAmount);
        setPlacedBricks(newBricks);
        showNotification(`+₹${brickTemplate.value.toLocaleString()}`, 'good');

        // Persist (Debounced in real app, simplified here)
        await supabase
            .from('financial_plans')
            .update({
                current_amount: newAmount,
                bricks_layout: newBricks
            })
            .eq('id', planId);
    };

    const useHammer = async () => {
        if (placedBricks.length === 0) return;

        // Remove last brick (LIFO)
        const lastBrick = placedBricks[placedBricks.length - 1];
        const newAmount = Math.max(0, currentAmount - lastBrick.value);
        const newBricks = placedBricks.slice(0, -1);

        setCurrentAmount(newAmount);
        setPlacedBricks(newBricks);
        showNotification(`-₹${lastBrick.value.toLocaleString()}`, 'bad');

        await supabase
            .from('financial_plans')
            .update({
                current_amount: newAmount,
                bricks_layout: newBricks
            })
            .eq('id', planId);
    };

    const showNotification = (msg: string, type: 'good' | 'bad') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 2000);
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-muted-foreground font-mono">Loading Battlefield...</div>;

    const progress = Math.min((currentAmount / (plan?.target_amount || 1)) * 100, 100);

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden flex flex-col relative bg-[#1c1c22]">
            {/* Top HUD */}
            <div className="p-4 border-b border-border/50 bg-[#111316] flex justify-between items-center z-20 shadow-xl">
                <div className="flex items-center gap-4">
                    <GlassButton size="sm" variant="ghost" onClick={() => router.push('/planning')}>
                        <ArrowLeft className="h-5 w-5" />
                    </GlassButton>
                    <div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Target</div>
                        <div className="text-lg font-mono font-bold text-foreground">₹{plan?.target_amount?.toLocaleString()}</div>
                    </div>
                </div>

                {/* Central Timer & Progress */}
                <div className="flex-1 max-w-xl mx-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Fortress Integrity</span>
                        <span className="font-mono">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-border/50 relative">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition-all duration-200={{ type: "spring", stiffness: 50 }}
                        />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-card/30 w-full -skew-x-12 animate-[shimmer_2s_infinite]" />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-card/20 rounded-xl border border-border flex items-center gap-2">
                        <Clock className="h-5 w-5 text-sky-400" />
                        <span className="font-mono font-bold text-foreground">29D 23H</span>
                    </div>
                </div>
            </div>

            {/* Main Game Area (Fortress View) */}
            <div className="flex-1 relative bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center">
                <div className="absolute inset-0 bg-[#0B0E11]/80 backdrop-blur-[2px]" />

                {/* The Fortress Stacking Area */}
                <div className="absolute bottom-0 left-0 right-0 top-0 p-8 flex items-end justify-center pb-32 overflow-hidden">
                    <div className="relative w-full max-w-4xl min-h-[500px] flex flex-wrap-reverse content-start justify-center gap-1 pointer-events-none filter drop-shadow-2xl">
                        <AnimatePresence>
                            {placedBricks.map((brick, i) => (
                                <motion.div
                                    key={brick.id}
                                    layout
                                    initial={{ y: -500, opacity: 0, scale: 0.5, rotate: Math.random() * 10 - 5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, opacity: 0, rotate: 180 }}
                                    transition-all duration-200={{ type: "spring", stiffness: 120, damping: 15 }}
                                    className={`h-12 rounded-sm border-t border-l border-border shadow-strong ${brick.color} flex items-center justify-center`}
                                    style={{
                                        width: brick.width === 1 ? '80px' : brick.width === 2 ? '160px' : '240px',
                                        zIndex: i
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-white/50">{brick.label}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {/* Base Platform */}
                        <div className="w-full h-4 bg-slate-700 rounded-full mt-1 mb-1 opacity-50 absolute bottom-0" />
                    </div>
                </div>

                {/* Floating Notification */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold text-2xl border ${notification.type === 'good' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} backdrop-blur-md shadow-2xl z-50`}
                        >
                            {notification.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Dock (Armory) */}
            <div className="h-28 bg-[#0B0E11] border-t border-border z-30 flex items-center justify-center gap-4 px-4 overflow-x-auto pb-safe">
                <div className="flex items-center gap-4 pr-8 border-r border-border mr-4">
                    <button
                        onClick={useHammer}
                        className="group flex flex-col items-center gap-1 min-w-[80px] hover:scale-105 transition-transform"
                    >
                        <div className="h-14 w-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-150 active:scale-95">
                            <Hammer className="h-6 w-6 text-red-400 group-hover:rotate-[-45deg] transition-transform" />
                        </div>
                        <span className="text-[10px] font-bold text-red-400 uppercase">Expense Hit</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {BRICK_TYPES.map((brick) => (
                        <button
                            key={brick.value}
                            onClick={() => addBrick(brick)}
                            className="group flex flex-col items-center gap-1 min-w-[70px] hover:scale-105 transition-transform"
                        >
                            <div className={`h-12 w-full rounded shadow-md border-t border-l border-border ${brick.color} opacity-90 group-hover:opacity-100`}></div>
                            <span className="text-[10px] font-bold text-muted-foreground">{brick.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
