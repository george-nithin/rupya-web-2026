"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Twitter, MessageSquare, Github, Youtube, Instagram, Linkedin, Send } from "lucide-react";

export function SocialLinks() {
    const socials = [
        { icon: <Send className="h-5 w-5" />, label: "Telegram", color: "from-blue-400 to-blue-600", shadow: "shadow-blue-500/20" },
        { icon: <Twitter className="h-5 w-5" />, label: "Twitter", color: "from-sky-400 to-sky-600", shadow: "shadow-sky-500/20" },
        { icon: <MessageSquare className="h-5 w-5" />, label: "Discord", color: "from-indigo-400 to-indigo-600", shadow: "shadow-indigo-500/20" },
        { icon: <Instagram className="h-5 w-5" />, label: "Instagram", color: "from-pink-400 to-rose-600", shadow: "shadow-rose-500/20" },
        { icon: <Youtube className="h-5 w-5" />, label: "Youtube", color: "from-red-400 to-red-600", shadow: "shadow-red-500/20" },
        { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", color: "from-blue-600 to-blue-800", shadow: "shadow-blue-700/20" },
    ];

    return (
        <div className="flex flex-col items-center gap-8 py-12">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Connect with us</div>

            <div className="flex flex-wrap justify-center gap-6">
                {socials.map((social, i) => (
                    <button
                        key={i}
                        className="group relative"
                        title={social.label}
                    >
                        {/* Gradient Glow */}
                        <div className={`absolute -inset-2 bg-gradient-to-br ${social.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />

                        <div className="relative h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-0.5 backdrop-blur-md group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-300">
                            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-xl ${social.shadow} group-hover:scale-110 transition-transform`}>
                                {social.icon}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest mt-4">
                © 2025 Rupya.io • All rights reserved
            </div>
        </div>
    );
}
