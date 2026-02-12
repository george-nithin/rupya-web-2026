"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { X, ExternalLink } from "lucide-react";

interface BrokerConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BROKERS = [
    {
        id: "upstox",
        name: "Upstox",
        logo: "https://upstox.com/favicon.ico",
        description: "Connect your Upstox account to sync portfolio",
    },
    {
        id: "zerodha",
        name: "Zerodha",
        logo: "https://zerodha.com/static/images/logo.svg",
        description: "Connect your Zerodha account to sync portfolio",
    },
    {
        id: "angelone",
        name: "Angel One",
        logo: "https://www.angelone.in/favicon.ico",
        description: "Connect your Angel One account to sync portfolio",
    },
    {
        id: "fyers",
        name: "Fyers",
        logo: "https://fyers.in/favicon.ico",
        description: "Connect your Fyers account to sync portfolio",
    },
    {
        id: "dhan",
        name: "Dhan",
        logo: "https://dhan.co/favicon.ico",
        description: "Connect your Dhan account to sync portfolio",
    },
];

export function BrokerConnectionModal({ isOpen, onClose }: BrokerConnectionModalProps) {
    const [connecting, setConnecting] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConnect = async (brokerId: string) => {
        setConnecting(brokerId);
        try {
            // Redirect to broker OAuth flow
            window.location.href = `/api/broker/connect/${brokerId}`;
        } catch (error) {
            console.error("Error connecting broker:", error);
            setConnecting(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Connect Broker</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Sync your portfolio automatically from your broker
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-xl transition-all duration-200"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="space-y-3">
                    {BROKERS.map((broker) => (
                        <div
                            key={broker.id}
                            className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                                    <img
                                        src={broker.logo}
                                        alt={broker.name}
                                        className="w-8 h-8 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%233b82f6'/%3E%3C/svg%3E";
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{broker.name}</h3>
                                    <p className="text-sm text-muted-foreground">{broker.description}</p>
                                </div>
                            </div>
                            <GlassButton
                                variant="primary"
                                onClick={() => handleConnect(broker.id)}
                                disabled={connecting !== null}
                            >
                                {connecting === broker.id ? (
                                    "Connecting..."
                                ) : (
                                    <>
                                        Connect
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </GlassButton>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-500">
                        <strong>Note:</strong> You'll be redirected to your broker's website to authorize
                        access. We only request read-only access to your portfolio holdings.
                    </p>
                </div>
            </GlassCard>
        </div>
    );
}
