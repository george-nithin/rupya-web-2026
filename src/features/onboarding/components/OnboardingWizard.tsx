"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ExperienceStep } from "./ExperienceStep";
import { MarketStep } from "./MarketStep";
import { SectorStep } from "./SectorStep";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

export default function OnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        experience: "",
        markets: [] as string[],
        sectors: [] as string[],
    });

    const totalSteps = 3;

    const nextStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            router.push("/dashboard");
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    // Validation
    const canProceed = () => {
        if (step === 1) return !!data.experience;
        if (step === 2) return data.markets.length > 0;
        if (step === 3) return data.sectors.length > 0;
        return true;
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                    <span>Start</span>
                    <span>Experience</span>
                    <span>Markets</span>
                    <span>Finish</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-sky-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            <GlassCard className="p-8 min-h-[400px] flex flex-col justify-between backdrop-blur-3xl">
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && (
                                <ExperienceStep
                                    value={data.experience}
                                    onChange={(val) => setData({ ...data, experience: val })}
                                />
                            )}
                            {step === 2 && (
                                <MarketStep
                                    value={data.markets}
                                    onChange={(val) => setData({ ...data, markets: val })}
                                />
                            )}
                            {step === 3 && (
                                <SectorStep
                                    value={data.sectors}
                                    onChange={(val) => setData({ ...data, sectors: val })}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-between pt-6 border-t border-white/5">
                    <GlassButton
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className={step === 1 ? "invisible" : ""}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                    </GlassButton>

                    <GlassButton
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className={!canProceed() ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {step === totalSteps ? "Finish Setup" : "Continue"}
                        {step === totalSteps ? (
                            <CheckCircle className="h-4 w-4 ml-2" />
                        ) : (
                            <ChevronRight className="h-4 w-4 ml-2" />
                        )}
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
    );
}
