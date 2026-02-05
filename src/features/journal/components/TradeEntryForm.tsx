"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Calendar, Camera, Hash, Target, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { uploadTradeScreenshot } from "@/lib/uploadUtils";

const strategies = ["Breakout", "Mean Reversion", "Trend Following", "Gap Fill", "Scalping"];

const tradeSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    direction: z.enum(["LONG", "SHORT"]),
    entryPrice: z.coerce.number().min(0.1),
    stopLoss: z.coerce.number().min(0.1),
    target: z.coerce.number().min(0.1),
    quantity: z.coerce.number().min(1),
    strategy: z.string(),
    reasoning: z.string(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

export default function TradeEntryForm() {
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Autocomplete Search State
    const [suggestions, setSuggestions] = useState<{ symbol: string; company_name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<TradeFormData>({
        resolver: zodResolver(tradeSchema),
        defaultValues: {
            symbol: "",
            direction: "LONG",
            entryPrice: 0,
            stopLoss: 0,
            target: 0,
            quantity: 1,
            strategy: "",
            reasoning: "",
        }
    });

    const [rrRatio, setRrRatio] = useState<number | null>(null);
    const [riskAmt, setRiskAmt] = useState<number | null>(null);

    const entry = watch("entryPrice");
    const sl = watch("stopLoss");
    const target = watch("target");
    const qty = watch("quantity");
    const symbolValue = watch("symbol");

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Search stocks
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!symbolValue || symbolValue.length < 2) {
                setSuggestions([]);
                return;
            }

            const { data } = await supabase
                .from('market_equity_quotes')
                .select('symbol, company_name')
                .ilike('symbol', `${symbolValue}%`)
                .limit(5);

            if (data) {
                setSuggestions(data);
                setShowSuggestions(true);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [symbolValue]);

    useEffect(() => {
        if (entry && sl && target) {
            const risk = Math.abs(Number(entry) - Number(sl));
            const reward = Math.abs(Number(target) - Number(entry));
            setRrRatio(Number((reward / risk).toFixed(2)));
            setRiskAmt(Math.round(risk * Number(qty)));
        }
    }, [entry, sl, target, qty]);

    const onSubmit = async (data: TradeFormData) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            let screenshotUrl = null;
            if (screenshot) {
                screenshotUrl = await uploadTradeScreenshot(screenshot, user.id);
            }

            const { error } = await supabase.from('journal_trades').insert({
                user_id: user.id,
                symbol: data.symbol,
                direction: data.direction,
                entry_price: data.entryPrice,
                stop_loss: data.stopLoss,
                target_price: data.target,
                quantity: data.quantity,
                strategy_name: data.strategy,
                reasoning: data.reasoning,
                pnl: 0, // Initial PnL
                status: 'OPEN',
                entry_date: new Date().toISOString(),
                screenshot_url: screenshotUrl
            });

            if (error) throw error;

            alert("Trade saved successfully!");
            router.push('/dashboard/journal'); // Redirect to journal list
        } catch (error: any) {
            console.error("Error saving trade:", error);
            alert("Failed to save trade: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GlassCard className="max-w-4xl mx-auto p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-400" />
                Log New Trade
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Trade Details */}
                    <div className="space-y-4">
                        <div className="relative" ref={wrapperRef}>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Symbol</label>
                            <GlassInput
                                {...register("symbol")}
                                placeholder="e.g. RELIANCE"
                                autoComplete="off"
                                onFocus={() => {
                                    if (symbolValue && symbolValue.length >= 2) setShowSuggestions(true);
                                }}
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl backdrop-blur-md max-h-60 overflow-y-auto">
                                    {suggestions.map((item) => (
                                        <div
                                            key={item.symbol}
                                            className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                            onClick={() => {
                                                setValue("symbol", item.symbol);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <div className="text-white font-medium">{item.symbol}</div>
                                            <div className="text-xs text-slate-400 truncate">{item.company_name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.symbol && <p className="text-xs text-red-400 mt-1">{errors.symbol.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Direction</label>
                                <select
                                    {...register("direction")}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500/50"
                                >
                                    <option value="LONG">LONG 🟢</option>
                                    <option value="SHORT">SHORT 🔴</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Strategy</label>
                                <select
                                    {...register("strategy")}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-sky-500/50"
                                >
                                    <option value="">Select Strategy</option>
                                    {strategies.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Entry Price</label>
                                <GlassInput {...register("entryPrice")} type="number" step="0.05" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Stop Loss</label>
                                <GlassInput {...register("stopLoss")} type="number" step="0.05" className="border-red-500/30 focus:border-red-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Target</label>
                                <GlassInput {...register("target")} type="number" step="0.05" className="border-green-500/30 focus:border-green-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
                            <GlassInput {...register("quantity")} type="number" />
                        </div>
                    </div>

                    {/* Right Column: Calculations & Extras */}
                    <div className="space-y-6">
                        {/* Risk Card */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" /> Risk Analysis
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500">Risk/Reward</div>
                                    <div className={`text-xl font-bold ${rrRatio && rrRatio >= 2 ? 'text-green-400' : 'text-orange-400'}`}>
                                        {rrRatio ? `1:${rrRatio}` : "-"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Capital at Risk</div>
                                    <div className="text-xl font-bold text-red-400">
                                        {riskAmt ? `₹${riskAmt}` : "-"}
                                    </div>
                                </div>
                            </div>
                            {rrRatio && rrRatio < 1.5 && (
                                <div className="mt-3 text-xs text-orange-400 flex items-center gap-1 bg-orange-500/10 p-2 rounded">
                                    <AlertTriangle className="h-3 w-3" />
                                    Low R:R ratio! Consider tightening SL.
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Trade Reasoning</label>
                            <textarea
                                {...register("reasoning")}
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-sky-500/50 resize-none"
                                placeholder="Why did you take this trade? Market context, confluences..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Screenshot</label>
                            <div className="relative border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setScreenshot(e.target.files[0]);
                                        }
                                    }}
                                />
                                <Camera className="h-6 w-6 text-slate-500 mx-auto mb-2" />
                                <span className="text-xs text-slate-500">
                                    {screenshot ? screenshot.name : "Drag or click to upload chart"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                    <GlassButton variant="ghost" type="button" onClick={() => router.back()}>Cancel</GlassButton>
                    <GlassButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            "Save to Journal"
                        )}
                    </GlassButton>
                </div>
            </form>
        </GlassCard>
    );
}
