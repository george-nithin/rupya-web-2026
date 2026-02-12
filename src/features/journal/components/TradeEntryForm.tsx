"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Calendar, Camera, Hash, Target, TrendingUp, AlertTriangle, Loader2, DollarSign, Brain, Clock, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { uploadTradeScreenshot } from "@/lib/uploadUtils";

const strategies = ["Breakout", "Mean Reversion", "Trend Following", "Gap Fill", "Scalping", "Pullback"];
const emotionsList = ["Confident", "Anxious", "FOMO", "Revenge", "Patient", "Hesitant", "Greedy"];
const tradeTypes = ["Intraday", "Swing", "Positional", "Investment"];
const sessions = ["Morning", "Afternoon", "Closing"];

const tradeSchema = z.object({
    symbol: z.string().min(1, "Symbol is required"),
    direction: z.enum(["LONG", "SHORT"]),
    entryPrice: z.coerce.number().min(0.1),
    stopLoss: z.coerce.number().min(0.1),
    target: z.coerce.number().min(0.1),
    quantity: z.coerce.number().min(1),
    strategy: z.string().optional(),
    reasoning: z.string().optional(),
    tradeType: z.string().min(1, "Trade Type is required"),
    entryDate: z.string(),
    tags: z.string().optional(), // Comma separated
    emotions: z.array(z.string()).optional(),
    fees: z.coerce.number().optional(),
    session: z.enum(["Morning", "Afternoon", "Closing"]).optional(),
    status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).optional(),
    exitPrice: z.coerce.number().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeEntryFormProps {
    tradeId?: string;
}

export default function TradeEntryForm({ tradeId }: TradeEntryFormProps) {
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!tradeId);
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSymbol = searchParams.get('symbol') || "";

    // Autocomplete Search State
    const [suggestions, setSuggestions] = useState<{ symbol: string; company_name: string }[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { register, watch, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(tradeSchema),
        defaultValues: {
            symbol: initialSymbol,
            direction: "LONG",
            entryPrice: 0,
            stopLoss: 0,
            target: 0,
            quantity: 1,
            strategy: "",
            reasoning: "",
            tradeType: "Intraday",
            entryDate: new Date().toISOString().split('T')[0],
            tags: "",
            emotions: [],
            fees: 0,
            status: "OPEN",
            exitPrice: 0,
        }
    });

    useEffect(() => {
        const fetchTrade = async () => {
            if (!tradeId) return;

            const { data, error } = await supabase
                .from('journal_trades')
                .select('*')
                .eq('id', tradeId)
                .single();

            if (data) {
                reset({
                    symbol: data.symbol,
                    direction: data.direction,
                    entryPrice: data.entry_price,
                    stopLoss: data.stop_loss || 0,
                    target: data.target_price || 0,
                    quantity: data.quantity,
                    strategy: data.strategy_name || "",
                    reasoning: data.reasoning || "",
                    tradeType: data.trade_type || "Intraday",
                    entryDate: new Date(data.entry_date).toISOString().split('T')[0],
                    tags: data.tags?.join(', ') || "",
                    emotions: data.emotions || [],
                    fees: data.fees || 0,
                    status: data.status || "OPEN",
                    exitPrice: data.exit_price || 0,
                });
            }
            setIsLoading(false);
        };

        fetchTrade();
    }, [tradeId, reset]);

    const [rrRatio, setRrRatio] = useState<number | null>(null);
    const [riskAmt, setRiskAmt] = useState<number | null>(null);

    const entry = watch("entryPrice");
    const sl = watch("stopLoss");
    const target = watch("target");
    const qty = watch("quantity");
    const symbolValue = watch("symbol");
    const selectedEmotions = watch("emotions") || [];

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

    const toggleEmotion = (emotion: string) => {
        const current = selectedEmotions;
        if (current.includes(emotion)) {
            setValue("emotions", current.filter(e => e !== emotion));
        } else {
            setValue("emotions", [...current, emotion]);
        }
    };

    const onSubmit = async (data: TradeFormData) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            let screenshotUrl = null;
            if (screenshot) {
                screenshotUrl = await uploadTradeScreenshot(screenshot, user.id);
            }

            // Parse tags
            const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [];

            let pnl = 0;
            if (data.status === 'CLOSED' && data.exitPrice) {
                const diff = data.direction === 'LONG' ? (data.exitPrice - data.entryPrice) : (data.entryPrice - data.exitPrice);
                pnl = (diff * data.quantity) - (data.fees || 0);
            }

            const tradeData = {
                user_id: user.id,
                symbol: data.symbol,
                direction: data.direction,
                entry_price: data.entryPrice,
                stop_loss: data.stopLoss,
                target_price: data.target,
                quantity: data.quantity,
                strategy_name: data.strategy,
                reasoning: data.reasoning,
                pnl: pnl,
                status: data.status,
                entry_date: new Date(data.entryDate).toISOString(),
                ...(screenshotUrl && { screenshot_url: screenshotUrl }),
                trade_type: data.tradeType,
                tags: tagsArray,
                emotions: data.emotions,
                fees: data.fees,
                session: data.session,
                exit_price: data.exitPrice || null
            };

            let error;
            if (tradeId) {
                // Update
                const { error: updateError } = await supabase
                    .from('journal_trades')
                    .update(tradeData)
                    .eq('id', tradeId);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('journal_trades')
                    .insert(tradeData);
                error = insertError;
            }

            if (error) throw error;

            alert("Trade saved successfully!");
            router.push('/dashboard/journal');
        } catch (error: any) {
            console.error("Error saving trade:", error);
            alert("Failed to save trade: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GlassCard className="max-w-5xl mx-auto p-6">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-400" />
                {tradeId ? "Edit Trade" : "Log New Trade"}
            </h2>

            {isLoading && <div className="text-center py-10">Loading trade details...</div>}

            {!isLoading && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Core Trade Details (2 cols wide) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Section 1: Instrument & Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative" ref={wrapperRef}>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Symbol</label>
                                    <GlassInput
                                        {...register("symbol")}
                                        placeholder="e.g. RELIANCE"
                                        autoComplete="off"
                                        onFocus={() => {
                                            if (symbolValue && symbolValue.length >= 2) setShowSuggestions(true);
                                        }}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-card/95 border border-border rounded-xl shadow-xl backdrop-blur-md max-h-60 overflow-y-auto">
                                            {suggestions.map((item) => (
                                                <div
                                                    key={item.symbol}
                                                    className="px-4 py-3 hover:bg-card/30 cursor-pointer transition-all duration-150 border-b border-border/50 last:border-0 active:scale-95"
                                                    onClick={() => {
                                                        setValue("symbol", item.symbol);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div className="text-foreground font-medium">{item.symbol}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{item.company_name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.symbol && <p className="text-xs text-red-400 mt-1">{errors.symbol.message as string}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                                        <GlassInput type="date" {...register("entryDate")} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                                        <select {...register("tradeType")} className="w-full bg-card/20 border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-sky-500/50">
                                            {tradeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Strategy & Setup */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Direction</label>
                                    <select {...register("direction")} className="w-full bg-card/20 border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-sky-500/50">
                                        <option value="LONG">LONG 🟢</option>
                                        <option value="SHORT">SHORT 🔴</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Strategy</label>
                                    <select {...register("strategy")} className="w-full bg-card/20 border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-sky-500/50">
                                        <option value="">Select Strategy</option>
                                        {strategies.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Session</label>
                                    <select {...register("session")} className="w-full bg-card/20 border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-sky-500/50">
                                        <option value="">Select Session</option>
                                        {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Section 3: Execution Numbers */}
                            <div className="grid grid-cols-4 gap-4 p-4 bg-card/20 rounded-xl border border-border">
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Qty</label>
                                    <GlassInput {...register("quantity")} type="number" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Entry</label>
                                    <GlassInput {...register("entryPrice")} type="number" step="0.05" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">SL</label>
                                    <GlassInput {...register("stopLoss")} type="number" step="0.05" className="border-red-500/30 focus:border-red-500" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Target</label>
                                    <GlassInput {...register("target")} type="number" step="0.05" className="border-green-500/30 focus:border-green-500" />
                                </div>
                            </div>

                            {/* Edit Mode: Exit Details */}
                            {tradeId && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-card/20 rounded-xl border border-border">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                                        <select {...register("status")} className="w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground outline-none">
                                            <option value="OPEN">OPEN</option>
                                            <option value="CLOSED">CLOSED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Exit Price</label>
                                        <GlassInput {...register("exitPrice")} type="number" step="0.05" />
                                    </div>
                                </div>
                            )}

                            {/* Section 4: Text Areas */}
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Trade Reasoning (Setup & Confluence)</label>
                                <textarea
                                    {...register("reasoning")}
                                    className="w-full h-24 bg-card/20 border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-sky-500/50 resize-none font-sans"
                                    placeholder="Why did you take this trade? Market context, confluences..."
                                />
                            </div>

                            {/* New Section: Tags & Screenshot */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                                        <Tag className="h-5 w-5" /> Tags
                                    </label>
                                    <GlassInput {...register("tags")} placeholder="e.g. nfp, news, breakout, error" />
                                    <p className="text-[10px] text-muted-foreground mt-1">Comma separated values</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                                        <Camera className="h-5 w-5" /> Screenshot
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setScreenshot(e.target.files[0]);
                                            }
                                        }}
                                        className="block w-full text-xs text-muted-foreground
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-xs file:font-semibold
                                      file:bg-sky-500/10 file:text-sky-400
                                      hover:file:bg-sky-500/20
                                    "
                                    />
                                </div>
                            </div>

                        </div>


                        {/* Right Column: Risk & Psychology (1 col wide) */}
                        <div className="space-y-6">
                            {/* Risk Card */}
                            <div className="bg-card/50 rounded-xl p-5 border border-border">
                                <h3 className="text-sm font-semibold text-sky-400 mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5" /> Risk Calc
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">R:R Ratio</span>
                                        <span className={`text-lg font-mono font-bold ${rrRatio && rrRatio >= 2 ? 'text-green-400' : 'text-orange-400'}`}>
                                            {rrRatio ? `1 : ${rrRatio}` : "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Risk Amount</span>
                                        <span className="text-lg font-mono font-bold text-red-400">
                                            {riskAmt ? `₹${riskAmt}` : "-"}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-border/50">
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Est. Fees/Brokerage</label>
                                        <GlassInput {...register("fees")} type="number" placeholder="20" className="h-8 text-sm" />
                                    </div>
                                </div>
                                {rrRatio && rrRatio < 1.5 && (
                                    <div className="mt-4 text-xs text-orange-400 flex items-start gap-2 bg-orange-500/10 p-2 rounded">
                                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>Risk/Reward is below 1:1.5. Consider tightening SL or skipping.</span>
                                    </div>
                                )}
                            </div>

                            {/* Psychology Card */}
                            <div className="bg-card/50 rounded-xl p-5 border border-border">
                                <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                    <Brain className="h-5 w-5" /> Psychology
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {emotionsList.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => toggleEmotion(emoji)}
                                            className={`px-3 py-1.5 rounded-full text-xs transition-all border ${selectedEmotions.includes(emoji)
                                                ? "bg-purple-500/20 border-purple-500 text-purple-200"
                                                : "bg-card/20 border-border text-muted-foreground hover:bg-card/30"
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 flex justify-end gap-4">
                        <GlassButton variant="ghost" type="button" onClick={() => router.back()}>Cancel</GlassButton>
                        <GlassButton type="submit" disabled={isSubmitting} className="w-40">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Trade"}
                        </GlassButton>
                    </div>
                </form>
            )}
        </GlassCard>
    );
}
